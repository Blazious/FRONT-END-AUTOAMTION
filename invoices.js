import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:8000';
  const invoiceModal = document.getElementById('invoice-modal');
  const openInvoiceBtn = document.getElementById('open-invoice-modal');
  const closeInvoiceBtn = document.getElementById('close-invoice-modal');
  const invoiceForm = document.getElementById('invoice-form');
  const invoiceCollectionSelect = document.getElementById('invoice-collection');
  const invoiceTableBody = document.getElementById('invoices-table-body');

  let collectionClientMap = {};

  // ✅ Load Invoices
  function loadInvoices() {
    fetch(`${BASE_URL}/api/invoices/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        invoiceTableBody.innerHTML = '';
        data.forEach(inv => {
          // Main row
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="p-2 font-bold">${inv.invoice_number}</td>
            <td class="p-2">${inv.client_name || 'N/A'}</td>
            <td class="p-2">${inv.date_issued}</td>
            <td class="p-2">${inv.due_date}</td>
            <td class="p-2">${inv.status}</td>
            <td class="p-2">${inv.total_due}</td>
            <td class="p-2 space-x-2">
              <button class="text-blue-600" onclick="viewInvoicePDF(${inv.id})">View</button>
              <button class="text-red-600" onclick="deleteInvoice(${inv.id})">Delete</button>
            </td>
          `;
          invoiceTableBody.appendChild(row);

          // Items row (if any)
          if (inv.items && inv.items.length > 0) {
            const itemRow = document.createElement('tr');
            itemRow.innerHTML = `
              <td colspan="7" class="bg-gray-50 p-3">
                <strong>Items:</strong>
                <table class="w-full mt-2 border-t">
                  <thead class="text-sm text-left text-gray-600">
                    <tr>
                      <th class="p-1">Description</th>
                      <th class="p-1">Quantity</th>
                      <th class="p-1">Unit</th>
                      <th class="p-1">Unit Price</th>
                      <th class="p-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inv.items.map(item => `
                      <tr>
                        <td class="p-1">${item.description}</td>
                        <td class="p-1">${item.quantity}</td>
                        <td class="p-1">${item.unit}</td>
                        <td class="p-1">${item.unit_price}</td>
                        <td class="p-1">${item.amount}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </td>
            `;
            invoiceTableBody.appendChild(itemRow);
          }
        });
      })
      .catch(err => console.error('Failed to load invoices:', err));
  }

  // ✅ Load Collections
  function loadCollectionsForInvoice() {
    fetch(`${BASE_URL}/api/collections/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        invoiceCollectionSelect.innerHTML = `<option value="">Select Collection</option>`;
        collectionClientMap = {};

        data.forEach(col => {
          const label = `${col.client?.name || 'Unknown'} - ${col.date_collected}`;
          invoiceCollectionSelect.innerHTML += `<option value="${col.id}">${label}</option>`;
          if (col.client) {
            collectionClientMap[col.id] = col.client;
          }
        });
      });
  }

  // ✅ Load Clients
  function loadClientsForInvoice() {
    const clientSelect = document.getElementById('invoice-client');

    fetch(`${BASE_URL}/api/clients/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        clientSelect.innerHTML = `<option value="">Select Client</option>`;
        data.forEach(client => {
          clientSelect.innerHTML += `<option value="${client.id}">${client.name}</option>`;
        });
      })
      .catch(err => console.error('Failed to load clients:', err));
  }

  // ✅ View Invoice PDF
  window.viewInvoicePDF = function (id) {
    window.open(`${BASE_URL}/api/invoices/${id}/pdf/`, '_blank');
  };

  // ✅ Delete Invoice
  window.deleteInvoice = function (id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    fetch(`${BASE_URL}/api/invoices/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }).then(res => {
      if (res.ok) loadInvoices();
    });
  };

  // ✅ Submit Invoice
  invoiceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(invoiceForm);

    const payload = {
      client: parseInt(formData.get('client')),
      collection: parseInt(formData.get('collection_id')),
      date_issued: formData.get('date_issued'),
      due_date: formData.get('due_date'),
      status: formData.get('status'),
      terms: formData.get('terms'),
      notes: formData.get('notes')
    };
     
    console.log('Payload being sent:', payload);
    fetch(`${BASE_URL}/api/invoices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          invoiceForm.reset();
          invoiceModal.classList.add('hidden');
            // Slight delay to allow backend to link items and calculate
          setTimeout(() => {
            loadInvoices(); // now you'll see items and totals
          }, 1000); // 1 second delay, adjust if needed
           
        } else {
          res.json().then(err => console.error('Invoice creation error:', err));
        }
      })
      .catch(err => {
        console.error('Network error:', err);
      });
  });

  // ✅ Modal Controls
  openInvoiceBtn?.addEventListener('click', () => {
    invoiceModal.classList.remove('hidden');
    loadCollectionsForInvoice();
    loadClientsForInvoice();
  });

  closeInvoiceBtn?.addEventListener('click', () => {
    invoiceModal.classList.add('hidden');
  });

  // ✅ Initialize
  if (document.getElementById('invoices')) {
    loadInvoices();
  }
});
