function getSelectedValues(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`))
                .map(cb => cb.value);
}

let partBills = [];

function addPartBill() {
    const name = document.getElementById('partName').value;
    const model = document.getElementById('partModel').value;
    const quantity = document.getElementById('partQuantity').value;
    const price = document.getElementById('partPrice').value;
    const warranty = document.getElementById('warrantyYes').checked;
    if(!name || !quantity || !price) return;
    partBills.push({
        partName: name,
        model: model,
        quantity: Number(quantity),
        price: Number(price),
        total: Number(quantity) * Number(price),
        warranty: warranty
    });
    updatePartBillList();
    document.getElementById('partName').value = '';
    document.getElementById('partModel').value = '';
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
           <strong>${bill.partName}</strong> (${bill.model}) <br/>
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
        serviceType: form.serviceType.value,
        motorNumber: form.motorNumber.value,
        kilometerReading: Number(form.kilometerReading.value),
        dateForSale: form.dateForSale.value,
        damaged: getSelectedValues(form.damaged),
        scratch: getSelectedValues(form.scratch),
        missing: getSelectedValues(form.missing),
        saName: form.saName.value,
        techName: form.techName.value,
        fiName: form.fiName.value,
        labourCharge: labourCharges,
        partBillList: partBills
    };
    const res = await fetch('/jobcard/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
        form.serviceType.value = card.serviceType || '';
        form.motorNumber.value = card.motorNumber || '';
        form.kilometerReading.value = card.kilometerReading || '';
        form.dateForSale.value = card.dateForSale || '';
        form.saName.value = card.saName || '';
        form.techName.value = card.techName || '';
        form.fiName.value = card.fiName || '';

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
    }
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
