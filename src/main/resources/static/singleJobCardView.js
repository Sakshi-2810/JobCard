// viewJobCard.js
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');

    if (jobCardId) {
     document.querySelector(".btn-edit").href = "addJobCard.html?jobCardId=" + encodeURIComponent(jobCardId);

        const res = await fetch('/jobcard/single?id=' + encodeURIComponent(jobCardId));
        const card = (await res.json()).data;
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
                  <th style="padding:6px; border:1px solid #ddd;">Model</th>
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
              <td style="padding:6px; border:1px solid #ddd;">${bill.model}</td>
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
