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
        attachedImages: [...(window.loadedFiles || [])],
        signatureBase64: document.getElementById('signatureData').value
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

  try {
      const res = await fetch('/jobcard/add', {
          method: 'POST',
          body: formData
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
        document.getElementById('signatureData').value = card.signatureBase64 || '';
        loadSignature()
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
        } catch (error) {
             console.error('Error loading job card:', error);
             alert('This JobCard does not exist. Press OK to add new JobCard');
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
