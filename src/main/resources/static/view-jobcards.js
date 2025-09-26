window.onload = async function() {
    const res = await fetch('/jobcard/all/jobcards');
    const jobCards = (await res.json()).data;
    const tbody = document.getElementById('jobCardsTable').getElementsByTagName('tbody')[0];
    jobCards.forEach(card => {
        const row = tbody.insertRow();

        // Actions cell at leftmost
        const actionsCell = row.insertCell(0);
        actionsCell.innerHTML = `
            <i class="fa fa-eye" style="color:#28a745; cursor:pointer; margin-right:10px;" title="View"></i>
            <i class="fa fa-edit" style="color:#007bff; cursor:pointer; margin-right:10px;" title="Edit"></i>
            <i class="fa fa-trash" style="color:#d9534f; cursor:pointer;" title="Delete"></i>
        `;
        actionsCell.querySelector('.fa-eye').onclick = function() {
            window.location.href = 'singleJobCardView.html?jobCardId=' + encodeURIComponent(card.jobCardId);
        };
        actionsCell.querySelector('.fa-edit').onclick = function() {
            window.location.href = 'addJobCard.html?jobCardId=' + encodeURIComponent(card.jobCardId);
        };
        actionsCell.querySelector('.fa-trash').onclick = async function() {
            if (confirm('Are you sure you want to delete this job card?')) {
                await fetch('/jobcard/delete/' + encodeURIComponent(card.jobCardId), { method: 'DELETE' });
                row.remove();
            }
        };

        row.insertCell().innerText = card.jobCardId ? parseInt(card.jobCardId) : '';
        row.insertCell().innerText = card.name || '';
        row.insertCell().innerText = card.address || '';
        row.insertCell().innerText = card.phoneNumber || '';
        row.insertCell().innerText = card.chasisNumber || '';
        row.insertCell().innerText = card.model || '';
        row.insertCell().innerText = card.serviceType || '';
        row.insertCell().innerText = card.date || '';
        row.insertCell().innerText = card.motorNumber || '';
        row.insertCell().innerText = card.kilometerReading || '';
        row.insertCell().innerText = card.dateForSale || '';
        row.insertCell().innerText = (card.damaged || []).join(', ');
        row.insertCell().innerText = (card.scratch || []).join(', ');
        row.insertCell().innerText = (card.missing || []).join(', ');
        row.insertCell().innerText = card.saName || '';
        row.insertCell().innerText = card.techName || '';
        row.insertCell().innerText = card.fiName || '';
        row.insertCell().innerText = card.warranty || '';
        row.insertCell().innerText = card.partsCharge || card.partsCahrge || 0;
    });
};