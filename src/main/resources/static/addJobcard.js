function getSelectedValues(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`))
                .map(cb => cb.value);
}

let partBills = []; // Initialize partBills array

function addPartBill() {
    const name = document.getElementById('partName').value;
    const quantity = document.getElementById('partQuantity').value;
    const price = document.getElementById('partPrice').value;
    const warranty = document.getElementById('warrantyYes').checked;
    const modelInput = document.getElementById('model');
    if(!name || !quantity || !price) return;
    // Determine modelName from partsData if available
    let modelName = '';
    if (partsData && partsData[name] && partsData[name].modelName) {
      modelName = partsData[name].modelName;
    } else if (modelInput) {
      modelName = modelInput.value.trim();
    }
    partBills.push({
      partName: name,
      quantity: Number(quantity),
      price: Number(price),
      total: Number(quantity) * Number(price),
      warranty: warranty,
      modelName: modelName
    });
    updatePartBillList();
    updateTotals();
    document.getElementById('partName').value = '';
    document.getElementById('partQuantity').value = '';
    document.getElementById('partPrice').value = '';
     document.getElementById('warrantyYes').checked = false;
}

function removePartBill(idx) {
    partBills.splice(idx, 1);
    updatePartBillList();
    updateTotals();
}

function updatePartBillList() {
    const ul = document.getElementById('partBillList');
    ul.innerHTML = '';
   partBills.forEach((bill, idx) => {
       const li = document.createElement('li');
       li.style.display = 'flex';
       li.style.justifyContent = 'space-between';
       li.style.alignItems = 'center';
       li.style.padding = '6px 10px';
       li.style.marginBottom = '4px';
       li.style.border = '1px solid #ddd';
       li.style.borderRadius = '6px';
       li.style.backgroundColor = '#f9f9f9';

       // Left side details
       const details = document.createElement('div');
       details.innerHTML = `
           <strong>${bill.partName}</strong><br/>
           Qty: ${bill.quantity} * ${bill.price} = <strong>${bill.total}</strong> <br/>
           Warranty: <span style="color:${bill.warranty ? 'green' : 'red'}">
               ${bill.warranty ? 'Yes' : 'No'}
           </span>
        <span style="font-size:11px;color:#888;">Model: ${bill.modelName || ''}</span>
       `;

       // Trash icon
       const icon = document.createElement('i');
       icon.className = 'fa fa-trash';
       icon.style.cursor = 'pointer';
       icon.style.color = '#d9534f';
       icon.title = 'Remove';
       icon.onclick = () => removePartBill(idx);

       li.appendChild(details);
       li.appendChild(icon);
       ul.appendChild(li);
   });
   updateTotals();
}

document.getElementById('jobCardForm').onsubmit = async function(e) {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    const form = e.target;
    const data = {
        jobCardId: jobCardId ? Number(jobCardId) : undefined,
        name: form.name.value,
        address: form.address.value,
        phoneNumber: Number(form.phoneNumber.value),
        chasisNumber: form.chasisNumber.value,
        model: form.model.value,
        additionalDiscount: form.additionalDiscount.value ? Number(form.additionalDiscount.value) : 0,
        initialObservations : form.initialObservations.value,
        estimatedCost: Number(form.estimatedCost.value),
        serviceType: form.serviceType.value,
        motorNumber: form.motorNumber.value,
        kilometerReading: Number(form.kilometerReading.value),
        dateForSale: form.dateForSale.value,
        damaged: getSelectedValues("damaged"),
        scratch: getSelectedValues("scratch"),
        missing: getSelectedValues("missing"),
        saName: form.saName.value,
        techName: form.techName.value,
        fiName: form.fiName.value,
        labourCharge: labourCharges,
        partBillList: partBills,
        images: uploadedUrls,
        signatureBase64: document.getElementById('signatureData').value,
        paymentMethod: form.paymentMethod ? form.paymentMethod.value : undefined,
        amountPaid: form.amountPaid && form.amountPaid.value ? Number(form.amountPaid.value) : 0
    };


  try {
      const res = await fetch('/jobcard/add', {
          method: 'POST',
          body: JSON.stringify(data),
           headers: {
              'Content-Type': 'application/json'
            },
      });

      if (!res.ok) {
          // Handle error response
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Failed to add job card.';
          alert(errorMessage);  // or show error banner
          return; // stop further execution
      }

      const result = await res.json();
      // Show success banner
      const banner = document.getElementById('successBanner');
      banner.innerText = result.message;
      banner.style.display = 'block';

      // Clear form fields
      form.reset();
      partBills = [];
      updatePartBillList();

      setTimeout(() => { banner.style.display = 'none'; }, 3000); // Hide after 3s

      // Redirect after 1.5 seconds
      setTimeout(() => {
          banner.style.display = 'none';
          window.location.href = 'singleJobCardView.html?jobCardId=' + encodeURIComponent(result.data);
      }, 1000);

  } catch (error) {
      alert('Error submitting job card: ' + error.message);
  } finally {
    loader.style.display = 'none';
  }
};

window.onload = async function() {
    // Prefill if editing
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    if (jobCardId) {

      const loader = document.getElementById('loader');
      loader.style.display = 'flex'; // show loader
        try{
            const res = await fetch('/jobcard/single?id=' + encodeURIComponent(jobCardId));
         if(!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch job card");
        }
        const card = (await res.json()).data;
        const form = document.getElementById('jobCardForm');
        form.name.value = card.name || '';
        form.address.value = card.address || '';
        form.phoneNumber.value = card.phoneNumber || '';
        form.chasisNumber.value = card.chasisNumber || '';
        form.model.value = card.model || '';
        onModelSelected(form.model.value);

        form.initialObservations.value = card.initialObservations || '';
        form.estimatedCost.value = card.estimatedCost || 0;
        form.serviceType.value = card.serviceType || '';
        form.motorNumber.value = card.motorNumber || '';
        form.kilometerReading.value = card.kilometerReading || '';
        form.dateForSale.value = card.dateForSale || '';
        form.saName.value = card.saName || '';
        form.techName.value = card.techName || '';
        form.fiName.value = card.fiName || '';
        form.additionalDiscount.value = card.additionalDiscount || 0;
        if (form.paymentMethod) form.paymentMethod.value = card.paymentMethod || '';
        if (form.amountPaid) form.amountPaid.value = card.amountPaid || 0;
        document.getElementById('signatureData').value = card.signatureBase64 || '';
        loadSignature()
        loadAttachedImages(card.images || []);
       function setMultiSelect(container, values) {
           if (!container) return;
           values = Array.isArray(values) ? values : (values ? values.split(",") : []);
           const checkboxes = container.querySelectorAll('input[type="checkbox"]');
           checkboxes.forEach(cb => {
               cb.checked = values.includes(cb.value);
           });
       }

       setMultiSelect(document.getElementById("damaged"), card.damaged);
       setMultiSelect(document.getElementById("missing"), card.missing);
       setMultiSelect(document.getElementById("scratch"), card.scratch);

        // Part bills
        partBills = card.partBillList || [];
        updatePartBillList();
        labourCharges = card.labourCharge || [];
        renderLabourCharges();
        } catch (error) {
             console.error('Error loading job card:', error);
             alert(error.message || 'This JobCard does not exist. Press OK to add new JobCard');
             window.location.href = window.location.pathname;
        } finally {
             loader.style.display = 'none'; // hide loader
           }
    } else {
             loader.style.display = 'none'; // hide loader
    }

   fetch('/jobcard/model/all')
     .then(response => response.json())
     .then(json => {
       const dataList = document.getElementById('model-list');
       dataList.innerHTML = ''; // Clear any existing options

       json.data.forEach(model => {
         const option = document.createElement('option');
         option.value = model;
         dataList.appendChild(option);
       });
     })
     .catch(error => {
       console.error('Error fetching model list:', error);
     });

  // Ensure totals reflect any prefilled data
  try { updateTotals(); } catch (e) { /* ignore if DOM not ready */ }
};

// Add at the top
let labourCharges = [];

// Add function
function addLabourCharge() {
    const name = document.getElementById('labourName').value.trim();
    const amount = Number(document.getElementById('labourAmount').value);
    if (!name || !amount) return;
    labourCharges.push({ name: name, price : amount });
    renderLabourCharges();
    updateTotals();
    document.getElementById('labourName').value = '';
    document.getElementById('labourAmount').value = '';
}

function renderLabourCharges() {
  const ul = document.getElementById('labourChargeList');
  ul.innerHTML = '';

  labourCharges.forEach((charge, idx) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '6px 10px';
      li.style.marginBottom = '4px';
      li.style.border = '1px solid #ddd';
      li.style.borderRadius = '6px';
      li.style.backgroundColor = '#f9f9f9';

      // Left side details
      const details = document.createElement('div');
      details.innerHTML = `
          <strong>${charge.name}</strong> <br/>
          Amount: <strong>${charge.price}</strong>
      `;

      // Trash icon
      const icon = document.createElement('i');
      icon.className = 'fa fa-trash';
      icon.style.cursor = 'pointer';
      icon.style.color = '#d9534f';
      icon.title = 'Remove';
      icon.onclick = () => {
          labourCharges.splice(idx, 1);
          renderLabourCharges();
          updateTotals();
      };

      li.appendChild(details);
      li.appendChild(icon);
      ul.appendChild(li);
  });
}

// Update totals: parts (exclude warranty), labour, discount and grand total
function updateTotals() {
    // Parts total excluding warranty
    const partsTotal = partBills.reduce((sum, b) => sum + ((b.warranty) ? 0 : (b.quantity * b.price)), 0);

    // Labour total
    const labourTotal = labourCharges.reduce((sum, l) => sum + (l.price || 0), 0);

    // Additional discount
    const additionalDiscountInput = document.getElementById('additionalDiscount');
    const discount = additionalDiscountInput && additionalDiscountInput.value ? Number(additionalDiscountInput.value) : 0;

    // Grand total
    const grandTotal = Math.max(0, partsTotal + labourTotal - discount);

    // Update DOM (format to 2 decimals)
    const fmt = (v) => (Number(v) || 0).toFixed(2);
    const partsEl = document.getElementById('partsTotal');
    const labourEl = document.getElementById('labourTotal');
    const discEl = document.getElementById('discountDisplay');
    const grandEl = document.getElementById('grandTotal');

    if (partsEl) partsEl.innerText = fmt(partsTotal);
    if (labourEl) labourEl.innerText = fmt(labourTotal);
    if (discEl) discEl.innerText = fmt(discount);
    if (grandEl) grandEl.innerText = fmt(grandTotal);
}

// Hook discount input change to recalc totals
const additionalDiscountInput = document.getElementById('additionalDiscount');
if (additionalDiscountInput) {
    additionalDiscountInput.addEventListener('input', updateTotals);
}

let partsData = {};

function onModelSelected(model) {
  if (!model) return;

  fetch(`/jobcard/partlist?model=${encodeURIComponent(model)}`)
    .then(response => response.json())
    .then(json => {
      // Assuming json.data is array of { partName: "...", price: number, modelName: string }
      partsData = {};
      const partList = document.getElementById('partname-list');
      partList.innerHTML = '';

      json.data.forEach(part => {
        // Store both price and modelName for each part
        partsData[part.partName] = { price: part.price, modelName: part.modelName || model };
        const option = document.createElement('option');
        option.value = part.partName;
        partList.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching parts list:', error);
      partsData = {};
      document.getElementById('partname-list').innerHTML = '';
    });
}

// Event listener on partName input to auto-fill price
const partNameInput = document.getElementById('partName');
const partPriceInput = document.getElementById('partPrice');

partNameInput.addEventListener('input', function () {
  const enteredName = partNameInput.value.trim();
  if (partsData.hasOwnProperty(enteredName)) {
    partPriceInput.value = partsData[enteredName].price;
    partPriceInput.readOnly = false; // lock price if from suggestions
  } else {
    partPriceInput.value = '';
    partPriceInput.readOnly = false; // allow manual price entry
  }
});

// Connect the model input to trigger parts fetch, example if model input has id="model"
document.getElementById('model').addEventListener('change', (event) => {
  onModelSelected(event.target.value.trim());
});

 const canvas = document.getElementById('signature');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Resize canvas to pixel size
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
    }
    resizeCanvas();

    // Mouse and touch events for drawing
    canvas.addEventListener('mousedown', () => { drawing = true; ctx.beginPath(); });
    canvas.addEventListener('mouseup', () => { drawing = false; saveSignature(); });
    canvas.addEventListener('mouseout', () => { drawing = false; saveSignature(); });
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        drawing = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); drawing = false; saveSignature(); });
    canvas.addEventListener('touchcancel', () => { drawing = false; saveSignature(); });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!drawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        drawLine(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    function draw(event) {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        drawLine(event.clientX - rect.left, event.clientY - rect.top);
    }

    function drawLine(x, y) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function clearSignature() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('signatureData').value = '';
    }

    function saveSignature() {
        const dataURL = canvas.toDataURL('image/png');
        document.getElementById('signatureData').value = dataURL;
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

let uploadedUrls = [];
document.getElementById("uploadBtn").addEventListener("click", async () => {
    const files = document.getElementById("fileUpload").files;
    const container = document.getElementById("editJobCardImages");
    const section = document.getElementById("editJobCardImagesSection");
    const hiddenInput = document.getElementById("uploadedFileUrls");

    if (files.length === 0) {
      alert("Please select at least one image!");
      return;
    }
    const uploadBtn = document.getElementById("uploadBtn");

    toggleButtonLoader(uploadBtn, true);

    section.style.display = "block"; // show attached section

    const formData = new FormData();

    for (const file of files) {
      formData.append("file", file);
     }

  try {
    const response = await fetch("/jobcard/uploadToDrive", {
        method: "POST",
        body: formData
      }
    );

    const result = await response.json();

    if (result.fileUrl && result.fileUrl.length > 0) {
        loadAttachedImages(result.fileUrl);
    }
     else {
      alert(`Failed to upload files`);
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert(`Error uploading `);
  }
    hiddenInput.value = JSON.stringify(uploadedUrls);
    toggleButtonLoader(uploadBtn, false);
  });

 function loadAttachedImages(images) {

   const container = document.getElementById("editJobCardImages");
   const section = document.getElementById("editJobCardImagesSection");
   const hiddenInput = document.getElementById("uploadedFileUrls");

   // Clear any existing previews
   container.innerHTML = "";

   if (!images || images.length === 0) {
     section.style.display = "none";
     uploadedUrls = [];
     hiddenInput.value = "[]";
     return;
   }

   // Save URLs in global array
   uploadedUrls = images;

   // Update hidden field for form submission
   hiddenInput.value = JSON.stringify(uploadedUrls);

   // Show section
   section.style.display = "block";

   // Render each image with delete option
   uploadedUrls.forEach((url) => {
     const wrapper = document.createElement("div");
     wrapper.style.position = "relative";
     wrapper.style.display = "inline-block";

     const iframe = document.createElement("iframe");
     iframe.src = url;
     iframe.width = "120";
     iframe.height = "120";
     iframe.style.border = "1px solid #ccc";
     iframe.style.borderRadius = "8px";
     iframe.style.cursor = "pointer";
     iframe.allowFullscreen = true;

     iframe.addEventListener("click", () => {
       window.open(iframe.src, "_blank");
     });

     // Trash button
     const trashBtn = document.createElement("button");
     trashBtn.innerHTML = "🗑️";
     trashBtn.title = "Remove image";
     trashBtn.style.position = "absolute";
     trashBtn.style.top = "2px";
     trashBtn.style.right = "2px";
     trashBtn.style.background = "rgba(0,0,0,0.6)";
     trashBtn.style.color = "white";
     trashBtn.style.border = "none";
     trashBtn.style.borderRadius = "50%";
     trashBtn.style.cursor = "pointer";
     trashBtn.style.width = "24px";
     trashBtn.style.height = "24px";
     trashBtn.style.display = "flex";
     trashBtn.style.alignItems = "center";
     trashBtn.style.justifyContent = "center";

     trashBtn.addEventListener("click", (e) => {
       e.stopPropagation(); // prevent image click
       wrapper.remove();

       // Remove from array + update hidden input
       const index = uploadedUrls.indexOf(url);
       if (index > -1) {
         uploadedUrls.splice(index, 1);
       }
       hiddenInput.value = JSON.stringify(uploadedUrls);

       if (uploadedUrls.length === 0) {
         section.style.display = "none";
       }
     });

     wrapper.appendChild(iframe);
     wrapper.appendChild(trashBtn);
     container.appendChild(wrapper);
   });
 }
function toggleButtonLoader(button, loading) {
  const text = button.querySelector("#uploadBtnText");
  const loader = button.querySelector(".loader");

  if (loading) {
    if (text) text.style.visibility = "hidden";
    if (loader) loader.style.display = "inline-block";
    button.disabled = true;
    button.style.opacity = "0.7";
  } else {
    if (text) text.style.visibility = "visible";
    if (loader) loader.style.display = "none";
    button.disabled = false;
    button.style.opacity = "1";
  }
}

// Hide/Show Vehicle, Staff and Condition sections based on the 'Hide Details' toggle
function applyHideDetails() {
  try {
    const toggle = document.getElementById('hideDetailsToggle');
    const hide = toggle && toggle.checked;
    const vehicle = document.getElementById('vehicleSection');
    const staff = document.getElementById('staffSection');
    const condition = document.getElementById('conditionSection');

    if (vehicle) vehicle.style.display = hide ? 'none' : 'block';
    if (staff) staff.style.display = hide ? 'none' : 'block';
    if (condition) condition.style.display = hide ? 'none' : 'block';
  } catch (e) {
    // ignore DOM issues
  }
}

// Wire up the toggle (if present) and apply initial state
try {
  const hideToggle = document.getElementById('hideDetailsToggle');
  if (hideToggle) {
    hideToggle.addEventListener('change', applyHideDetails);
    // apply initial state on script load
    applyHideDetails();
  }
} catch (e) {
  // ignore
}
