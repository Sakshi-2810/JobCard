// viewJobCard.js
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');

    if (jobCardId) {


     document.querySelector(".btn-edit").href = "addJobCard.html?jobCardId=" + encodeURIComponent(jobCardId);

        const res = await fetch('/jobcard/single?id=' + encodeURIComponent(jobCardId));
        const card = (await res.json()).data;
        loadJobCardImages(card.fileIds);

        const form = document.getElementById('viewJobCardForm');
        form.name.value = card.name || '';
        form.address.value = card.address || '';
        form.phoneNumber.value = card.phoneNumber || '';
        form.chasisNumber.value = card.chasisNumber || '';
        form.model.value = card.model || '';
        form.serviceType.value = card.serviceType || '';
        form.date.value = card.date || '';
        form.motorNumber.value = card.motorNumber || '';
        form.kilometerReading.value = card.kilometerReading || '';
        form.dateForSale.value = card.dateForSale || '';
        form.damaged.value = (card.damaged || []).join(', ');
        form.scratch.value = (card.scratch || []).join(', ');
        form.missing.value = (card.missing || []).join(', ');
        form.saName.value = card.saName || '';
        form.techName.value = card.techName || '';
        form.fiName.value = card.fiName || '';
        form.warranty.value = card.warranty || '';
        form.total.value = card.totalCharge || 0;
        form.additionalDiscount.value = card.additionalDiscount || 0;
        form.initialObservations.value = card.initialObservations || '';
      // Part Bills view
          const partBillsContainer = document.querySelector('[name="partBills"]').parentNode;
          partBillsContainer.querySelector('textarea').remove(); // remove old textarea

          const partTable = document.createElement('table');
          partTable.style.width = '100%';
          partTable.style.borderCollapse = 'collapse';
          partTable.innerHTML = `
              <thead>
                  <tr style="background:#f1f1f1; text-align:left;">
                      <th style="padding:6px; border:1px solid #ddd;">Part Name</th>
                      <th style="padding:6px; border:1px solid #ddd;">Qty</th>
                      <th style="padding:6px; border:1px solid #ddd;">Price</th>
                      <th style="padding:6px; border:1px solid #ddd;">Total</th>
                      <th style="padding:6px; border:1px solid #ddd;">Warranty</th>
                  </tr>
              </thead>
              <tbody></tbody>
          `;
          const partTbody = partTable.querySelector('tbody');

          (card.partBillList || []).forEach(bill => {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                  <td style="padding:6px; border:1px solid #ddd;">${bill.partName}</td>
                  <td style="padding:6px; border:1px solid #ddd;">${bill.quantity}</td>
                  <td style="padding:6px; border:1px solid #ddd;">${bill.price}</td>
                  <td style="padding:6px; border:1px solid #ddd;"><strong>${bill.total}</strong></td>
                  <td style="padding:6px; border:1px solid #ddd; color:${bill.warranty ? 'green' : 'red'};">
                      ${bill.warranty ? 'Yes' : 'No'}
                  </td>
              `;
              partTbody.appendChild(tr);
      });
      partBillsContainer.appendChild(partTable);

      // Labour Charges view
      const labourContainer = document.querySelector('[name="labourCharges"]').parentNode;
      labourContainer.querySelector('textarea').remove();

      const labourTable = document.createElement('table');
      labourTable.style.width = '100%';
      labourTable.style.borderCollapse = 'collapse';
      labourTable.innerHTML = `
          <thead>
              <tr style="background:#f1f1f1; text-align:left;">
                  <th style="padding:6px; border:1px solid #ddd;">Charge Name</th>
                  <th style="padding:6px; border:1px solid #ddd;">Amount</th>
              </tr>
          </thead>
          <tbody></tbody>
      `;
      const labourTbody = labourTable.querySelector('tbody');

      (card.labourCharge || []).forEach(charge => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td style="padding:6px; border:1px solid #ddd;">${charge.name}</td>
              <td style="padding:6px; border:1px solid #ddd;"><strong>${charge.price}</strong></td>
          `;
          labourTbody.appendChild(tr);
      });
      labourContainer.appendChild(labourTable);

       if (card.signatureBase64) {
            document.getElementById('signatureData').value = card.signatureBase64;
            loadSignature();
       }
 }
 };

function downloadInvoice() {
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    if (!jobCardId) return alert("Job card ID missing");

    fetch(`/jobcard/download-pdf?jobCardId=${encodeURIComponent(jobCardId)}`)
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${jobCardId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error("PDF download failed:", err));
}

function loadJobCardImages(fileIds) {
    const container = document.getElementById("jobCardImages");
    container.innerHTML = ""; // clear old

    if (!fileIds || fileIds.length === 0) {
        container.innerHTML = "<p style='color:#888;'>No images attached.</p>";
        return;
    }

    fileIds.forEach(id => {
        const img = document.createElement("img");
        img.src = `/jobcard/files/download/${id}`;
        img.style.width = "150px";
        img.style.height = "auto";
        img.style.border = "1px solid #ccc";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
        container.appendChild(img);
    });
}
const canvas = document.getElementById('signature');
const ctx = canvas.getContext('2d');
let drawing = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  loadSignature();
}

function loadSignature() {
  const dataUrl = document.getElementById('signatureData').value;
  if (dataUrl) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1)
      );
    };
    img.src = dataUrl;
  }
}

resizeCanvas();

// Mouse events
canvas.addEventListener('mousedown', e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  saveSignature();
});

canvas.addEventListener('mouseout', () => {
  drawing = false;
  saveSignature();
});

// Touch events
canvas.addEventListener(
  'touchstart',
  e => {
    e.preventDefault();
    if (e.touches.length > 0) {
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }
  },
  { passive: false }
);

canvas.addEventListener(
  'touchmove',
  e => {
    e.preventDefault();
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  },
  { passive: false }
);

canvas.addEventListener(
  'touchend',
  e => {
    e.preventDefault();
    drawing = false;
    saveSignature();
  },
  { passive: false }
);

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('signatureData').value = '';
}

function saveSignature() {
  const dataURL = canvas.toDataURL('image/png');
  document.getElementById('signatureData').value = dataURL;
}


