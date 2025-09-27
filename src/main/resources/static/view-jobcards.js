window.onload = async function() {
    try{
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
              try {
                  const response = await fetch('/jobcard/delete?id=' + encodeURIComponent(card.jobCardId), {
                      method: 'DELETE'
                  });

                  if (response.ok) {
                      row.remove();
                  } else {
                      alert('Failed to delete job card. Please try again.');
                  }
              } catch (error) {
                  console.error('Error deleting job card:', error);
                  alert('An error occurred while deleting. Please try again later.');
              }
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
        row.insertCell().innerText = card.totalCharge || 0;
    });
} catch (error) {
    console.error('Error fetching job cards:', error);
    alert('An error occurred while fetching job cards. Please try again later.');
};
};

function editJobCard() {
    const params = new URLSearchParams(window.location.search);
    const jobCardId = params.get('jobCardId');
    window.location.href = "addJobCard.html?id=" + encodeURIComponent(jobCardId);
}

const filterInput = document.getElementById("tableFilterInput");
const table = document.getElementById("jobCardsTable");
const tbody = table.tBodies[0];
const sortDirection = {};

// Filter table rows based on search input
filterInput.addEventListener("input", () => {
  const filter = filterInput.value.toLowerCase();
  const rows = tbody.rows;
  for (const row of rows) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  }
});


// Sort table by column index with toggle ascending/descending
function sortTable(colIndex) {
  const rowsArray = Array.from(tbody.rows);
  sortDirection[colIndex] = !sortDirection[colIndex];

  rowsArray.sort((a, b) => {
    let valA = a.cells[colIndex].textContent.trim().toLowerCase();
    let valB = b.cells[colIndex].textContent.trim().toLowerCase();

    // Convert numeric strings to numbers for numeric sorting
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    if (!isNaN(numA) && !isNaN(numB)) {
      valA = numA;
      valB = numB;
    }

    if (valA < valB) return sortDirection[colIndex] ? -1 : 1;
    if (valA > valB) return sortDirection[colIndex] ? 1 : -1;
    return 0;
  });
      // Reappend sorted rows
      rowsArray.forEach((row) => tbody.appendChild(row));

      // Update sorting arrow on header
      const ths = table.tHead.rows[0].cells;
      for (let i = 0; i < ths.length; i++) {
        ths[i].classList.remove("sort-asc", "sort-desc");
      }
      ths[colIndex].classList.add(
        sortDirection[colIndex] ? "sort-asc" : "sort-desc"
      );
}




