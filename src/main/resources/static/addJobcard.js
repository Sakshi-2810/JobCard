function getSelectedValues(select) {
    return Array.from(select.selectedOptions).map(opt => opt.value);
}
let partBills = [];

function addPartBill() {
    const name = document.getElementById('partName').value;
    const model = document.getElementById('partModel').value;
    const quantity = document.getElementById('partQuantity').value;
    const price = document.getElementById('partPrice').value;
    partBills.push({
        partName: name,
        model: model,
        quantity: Number(quantity),
        price: Number(price),
        total: Number(quantity) * Number(price)
    });
    updatePartBillList();
    document.getElementById('partName').value = '';
    document.getElementById('partModel').value = '';
    document.getElementById('partQuantity').value = '';
    document.getElementById('partPrice').value = '';
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
        li.textContent = `${bill.partName} (${bill.model}) x${bill.quantity} @${bill.price} = ${bill.total} | Warranty: ${bill.warranty || 'False'}`;
        const icon = document.createElement('i');
        icon.className = 'fa fa-trash';
        icon.style.cursor = 'pointer';
        icon.style.color = '#d9534f';
        icon.title = 'Remove';
        icon.onclick = () => removePartBill(idx);
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
    labourChargeList: labourCharges,
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
        form.date.value = card.date || '';
        form.motorNumber.value = card.motorNumber || '';
        form.kilometerReading.value = card.kilometerReading || '';
        form.dateForSale.value = card.dateForSale || '';
        form.saName.value = card.saName || '';
        form.techName.value = card.techName || '';
        form.fiName.value = card.fiName || '';
        form.warranty.value = card.warranty || '';
        form.partsCharge.value = card.partsCharge || card.partsCahrge || 0;

        // Multi-selects
        function setMultiSelect(select, values) {
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
    labourCharges.push({ name, amount });
    renderLabourCharges();
    document.getElementById('labourName').value = '';
    document.getElementById('labourAmount').value = '';
}

function renderLabourCharges() {
    const ul = document.getElementById('labourChargeList');
    ul.innerHTML = '';
    labourCharges.forEach((charge, idx) => {
        const li = document.createElement('li');
        li.textContent = `${charge.name}: ₹${charge.amount} `;
        const icon = document.createElement('i');
        icon.className = 'fa fa-trash';
        icon.style.cursor = 'pointer';
        icon.style.color = '#d9534f';
        icon.title = 'Remove';
        icon.onclick = () => {
            labourCharges.splice(idx, 1);
            renderLabourCharges();
        };
        li.appendChild(icon);
        ul.appendChild(li);
    });
}
