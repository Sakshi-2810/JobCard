function getSelectedValues(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`))
                .map(cb => cb.value);
}

let partBills = [];

function addPartBill() {
    const name = document.getElementById('partName').value;
    const quantity = document.getElementById('partQuantity').value;
    const price = document.getElementById('partPrice').value;
    const warranty = document.getElementById('warrantyYes').checked;
    if(!name || !quantity || !price) return;
    partBills.push({
        partName: name,
        quantity: Number(quantity),
        price: Number(price),
        total: Number(quantity) * Number(price),
        warranty: warranty
    });
    updatePartBillList();
    document.getElementById('partName').value = '';
    document.getElementById('partQuantity').value = '';
    document.getElementById('partPrice').value = '';
     document.getElementById('warrantyYes').checked = false;
}

function removePartBill(idx) {
    partBills.splice(idx, 1);
    updatePartBillList();
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
}

document.getElementById('jobCardForm').onsubmit = async function(e) {
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
        attachedImages: [...(window.loadedFiles || [])]
    };
      // Create multipart form data
        const formData = new FormData();
        formData.append("jobCard", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (form.fileUpload.files.length > 0) {
           const files = form.fileUpload.files;
           for (let i = 0; i < files.length; i++) {
               formData.append('files', files[i]);
           }
        }

    const res = await fetch('/jobcard/add', {
        method: 'POST',
        body: formData
    });
    const result = await res.json();
  // Show banner
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
        window.location.href = 'addJobCard.html';
    }, 1500);
};

window.onload = async function() {
    // Prefill if editing
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    if (jobCardId) {
        const res = await fetch('/jobcard/single?id=' + encodeURIComponent(jobCardId));
        const card = (await res.json()).data;
        const form = document.getElementById('jobCardForm');
        form.name.value = card.name || '';
        form.address.value = card.address || '';
        form.phoneNumber.value = card.phoneNumber || '';
        form.chasisNumber.value = card.chasisNumber || '';
        form.model.value = card.model || '';
        onModelSelected(form.model.value);

        form.initialObservations.value = card.initialObservations || '';
        form.serviceType.value = card.serviceType || '';
        form.motorNumber.value = card.motorNumber || '';
        form.kilometerReading.value = card.kilometerReading || '';
        form.dateForSale.value = card.dateForSale || '';
        form.saName.value = card.saName || '';
        form.techName.value = card.techName || '';
        form.fiName.value = card.fiName || '';
        form.additionalDiscount.value = card.additionalDiscount || 0;

        // Multi-selects
        function setMultiSelect(select, values) {
           if (!select) return;
           Array.from(select.options).forEach(opt => {
                opt.selected = values && values.includes(opt.value);
           });
        }
        setMultiSelect(form.damaged, card.damaged || []);
        setMultiSelect(form.scratch, card.scratch || []);
        setMultiSelect(form.missing, card.missing || []);

        // Part bills
        partBills = card.partBillList || [];
        updatePartBillList();
        document.getElementById("editJobCardImagesSection").style.display = "block";
        window.currentFileIds = loadEditJobCardImages(card.fileIds);
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
      };

      li.appendChild(details);
      li.appendChild(icon);
      ul.appendChild(li);
  });
}
function loadEditJobCardImages(fileIds) {
    const container = document.getElementById("editJobCardImages");
    container.innerHTML = ""; // Clear existing images

    const loadedFiles = []; // Keep track of currently loaded files

    fileIds.forEach(fileId => {
        // Create wrapper div
        const imgWrapper = document.createElement("div");
        imgWrapper.style.position = "relative";
        imgWrapper.style.width = "120px";
        imgWrapper.style.height = "120px";
        imgWrapper.style.border = "1px solid #ccc";
        imgWrapper.style.borderRadius = "8px";
        imgWrapper.style.overflow = "hidden";
        imgWrapper.style.display = "inline-flex";
        imgWrapper.style.alignItems = "center";
        imgWrapper.style.justifyContent = "center";
        imgWrapper.style.background = "#f8f8f8";
        imgWrapper.style.marginRight = "10px";
        imgWrapper.style.marginBottom = "10px";

        // Create image element
        const img = document.createElement("img");
        img.src = `/jobcard/files/download/${fileId}`;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.alt = "Attached Image";
        imgWrapper.appendChild(img);

        // Create trash icon
        const trash = document.createElement("i");
        trash.className = "fa fa-trash";
        trash.style.position = "absolute";
        trash.style.top = "5px";
        trash.style.right = "5px";
        trash.style.color = "#d9534f";
        trash.style.cursor = "pointer";
        trash.style.background = "rgba(255,255,255,0.8)";
        trash.style.borderRadius = "50%";
        trash.style.padding = "4px";
        trash.style.zIndex = "10";  // Make sure it’s on top

        trash.onclick = () => {
            container.removeChild(imgWrapper);
            const index = loadedFiles.indexOf(fileId);
            if (index > -1) loadedFiles.splice(index, 1);
        };

        imgWrapper.appendChild(trash);
        container.appendChild(imgWrapper);

        loadedFiles.push(fileId);
    });

    return loadedFiles;
}

let partsData = {};

function onModelSelected(model) {
  if (!model) return;

  fetch(`/jobcard/partlist?model=${encodeURIComponent(model)}`)
    .then(response => response.json())
    .then(json => {
      // Assuming json.data is array of { partName: "...", price: number }
      partsData = {};
      const partList = document.getElementById('partname-list');
      partList.innerHTML = '';

      json.data.forEach(part => {
        partsData[part.partName] = part.price;
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
    partPriceInput.value = partsData[enteredName];
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
