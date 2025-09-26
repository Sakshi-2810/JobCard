// viewJobCard.js
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    if (jobCardId) {
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
        form.partsCharge.value = card.partsCharge || card.partsCahrge || 0;
        form.partBills.value = (card.partBillList || []).map(bill => JSON.stringify(bill)).join('\n');
    }
};