import { checkAuth, fetchWithAuth } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Ensures user is authenticated

    const clientModal = document.getElementById('client-modal');
    const openModalBtn = document.getElementById('open-client-modal');
    const closeModalBtn = document.getElementById('close-client-modal');
    const clientForm = document.getElementById('client-form');
    const clientTableBody = document.getElementById('clients-table-body');

    // Load clients
    async function loadClients() {
        try {
            const res = await fetchWithAuth('http://127.0.0.1:8000/api/clients/');
            if (!res.ok) throw new Error('Failed to fetch clients');
            const data = await res.json();

            clientTableBody.innerHTML = '';
            data.forEach(client => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2">${client.name}</td>
                    <td class="p-2">${client.address}</td>
                    <td class="p-2">${client.city}</td>
                    <td class="p-2">${client.phone}</td>
                    <td class="p-2">${client.email}</td>
                    <td class="p-2">${client.wht_agent ? 'Yes' : 'No'}</td>
                    <td class="p-2">${client.kra_pin || ''}</td>
                    <td class="p-2">
                        <button class="text-red-600 delete-client-btn" data-id="${client.id}">Delete</button>
                    </td>
                `;
                clientTableBody.appendChild(row);
            });

            attachDeleteEvents();
        } catch (err) {
            console.error(err);
        }
    }

    // Delete client
    function attachDeleteEvents() {
        const deleteButtons = document.querySelectorAll('.delete-client-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-id');
                if (!confirm('Are you sure you want to delete this client?')) return;

                const res = await fetchWithAuth(`http://127.0.0.1:8000/api/clients/${id}/`, { method: 'DELETE' });
                if (res.ok) {
                    loadClients();
                } else {
                    console.error('Failed to delete client');
                }
            });
        });
    }

    // Submit new client
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(clientForm);
        const payload = {};

        formData.forEach((value, key) => {
            payload[key] = key === 'wht_agent' ? formData.get('wht_agent') === 'on' : value;
        });

        const res = await fetchWithAuth('http://127.0.0.1:8000/api/clients/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            clientForm.reset();
            clientModal.classList.add('hidden');
            loadClients();
        } else {
            console.error('Failed to create client');
        }
    });

    // Modal controls
    openModalBtn?.addEventListener('click', () => clientModal.classList.remove('hidden'));
    closeModalBtn?.addEventListener('click', () => clientModal.classList.add('hidden'));

    // Init
    if (document.getElementById('clients')) {
        loadClients();
    }
});
