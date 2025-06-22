
import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:8000';
  const collectionModal = document.getElementById('collection-modal');
  const openModalBtn = document.getElementById('open-collection-modal');
  const closeModalBtn = document.getElementById('close-collection-modal');
  const collectionForm = document.getElementById('collection-form');
  const collectionSelect = document.getElementById('collection-select');
  const clientSelect = document.getElementById('collection-client');
  const tableBody = document.getElementById('collections-table-body');

  // ✅ Load client options for form dropdown
  function loadClients() {
    if (!clientSelect) return;

    clientSelect.innerHTML = '<option value="">Select Client</option>';

    fetch(`${BASE_URL}/api/clients/`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        data.forEach(client => {
          const option = document.createElement('option');
          option.value = client.id;
          option.textContent = client.name;
          clientSelect.appendChild(option);
        });
      })
      .catch(err => console.error('Error loading clients:', err));
  }

  // ✅ Load collections and items
  function loadCollections() {
    let clientMap = {};

    // First: Get clients
    fetch(`${BASE_URL}/api/clients/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(clients => {
        clients.forEach(client => {
          clientMap[client.id] = client.name;
        });

        return fetch(`${BASE_URL}/api/collections/`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
      })
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = '';
        collectionSelect.innerHTML = `<option value="">Select Collection</option>`;

        data.forEach(collection => {
          const clientName = clientMap[collection.client] || 'Unknown';

          collectionSelect.innerHTML += `
            <option value="${collection.id}">
              ${clientName} - ${collection.date_collected}
            </option>`;

          if (collection.items && collection.items.length > 0) {
            collection.items.forEach(item => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td class="p-2">${clientName}</td>
                <td class="p-2">${collection.date_collected}</td>
                <td class="p-2">${collection.due_date}</td>
                <td class="p-2">${item.waste_category}</td>
                <td class="p-2">${item.quantity}</td>
                <td class="p-2">${item.unit}</td>
                <td class="p-2">${item.unit_price}</td>
                <td class="p-2">${item.amount}</td>
                <td class="p-2">
                  <button class="text-red-600" onclick="deleteItem(${item.id})">Delete</button>
                </td>`;
              tableBody.appendChild(row);
            });
          }
        });
      })
      .catch(err => console.error('Error loading collections or clients:', err));
  }

  // ✅ Delete item
  window.deleteItem = function (id) {
    if (!confirm('Delete this collection item?')) return;

    fetch(`${BASE_URL}/api/collection-items/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    }).then(res => {
      if (res.ok) loadCollections();
    });
  };

  // ✅ Submit new collection item
  collectionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(collectionForm);
    const payload = {};
    formData.forEach((val, key) => {
      if (key === 'quantity' || key === 'unit_price') {
        payload[key] = parseFloat(val);
      } else if (key === 'collection') {
        payload[key] = parseInt(val);
      } else {
        payload[key] = val;
      }
    });

    fetch(`${BASE_URL}/api/collection-items/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.ok) {
        collectionForm.reset();
        collectionModal.classList.add('hidden');
        loadCollections();
      }
    });
  });

  // ✅ Modal open/close
  if (openModalBtn && closeModalBtn && collectionModal) {
    openModalBtn.addEventListener('click', () => {
      collectionModal.classList.remove('hidden');
      loadClients();
    });

    closeModalBtn.addEventListener('click', () => {
      collectionModal.classList.add('hidden');
    });
  }

  // ✅ Initialize
  if (document.getElementById('collections')) {
    loadCollections();
  }
});
