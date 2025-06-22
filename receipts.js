import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:8000';

  const receiptModal = document.getElementById('receipt-modal');
  const openReceiptBtn = document.getElementById('open-receipt-modal');
  const closeReceiptBtn = document.getElementById('close-receipt-modal');
  const receiptForm = document.getElementById('receipt-form');
  const receiptsTable = document.getElementById('receipts-table-body');
  const invoiceSelect = document.getElementById('receipt-invoice');
  const clientInput = document.getElementById('receipt-client'); // hidden input for client ID

  function loadReceipts() {
    receiptsTable.innerHTML = '';

    fetch(`${BASE_URL}/api/receipts/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        data.forEach(receipt => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="p-2">${receipt.receipt_number || '-'}</td>
            <td class="p-2">${receipt.client_name || '-'}</td>
            <td class="p-2">${receipt.invoice_number || '-'}</td>
            <td class="p-2">${receipt.amount}</td>
            <td class="p-2">${receipt.payment_method}</td>
            <td class="p-2">${receipt.date_paid}</td>
            <td class="p-2 space-x-2">
              <button onclick="downloadReceipt(${receipt.id})" class="text-green-600">Download</button>
              <button onclick="deleteReceipt(${receipt.id})" class="text-red-600">Delete</button>
            </td>
          `;
          receiptsTable.appendChild(row);
        });
      });
  }

  window.downloadReceipt = function (id) {
    window.open(`${BASE_URL}/api/receipts/${id}/pdf/`, '_blank');
  };

  window.deleteReceipt = function (id) {
    if (!confirm("Delete this receipt?")) return;

    fetch(`${BASE_URL}/api/receipts/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }).then(res => {
      if (res.ok) loadReceipts();
    });
  };

  function loadInvoices() {
    fetch(`${BASE_URL}/api/invoices/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        invoiceSelect.innerHTML = `<option value="">Select Invoice</option>`;
        data.forEach(inv => {
          const option = document.createElement('option');
          option.value = inv.id;
          option.textContent = `${inv.invoice_number} (${inv.client?.name || ''})`;
          option.dataset.clientId = inv.client; // Store client ID in a data attribute
          invoiceSelect.appendChild(option);
        });
      });
  }

  // 🔁 Whenever the invoice dropdown changes, update the hidden client input
  invoiceSelect?.addEventListener('change', () => {
    const selectedOption = invoiceSelect.options[invoiceSelect.selectedIndex];
    const clientId = selectedOption.dataset.clientId;
    clientInput.value = clientId || '';
  });

  receiptForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(receiptForm);

    fetch(`${BASE_URL}/api/receipts/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    }).then(res => {
      if (res.ok) {
        receiptModal.classList.add('hidden');
        receiptForm.reset();
        loadReceipts();
      } else {
        res.json().then(data => {
          alert("Error creating receipt: " + JSON.stringify(data));
        });
      }
    });
  });

  openReceiptBtn?.addEventListener('click', () => {
    loadInvoices();
    receiptModal.classList.remove('hidden');
  });

  closeReceiptBtn?.addEventListener('click', () => {
    receiptModal.classList.add('hidden');
  });

  if (document.getElementById('receipts')) {
    loadReceipts();
  }
});
