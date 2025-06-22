import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    const servicesTableBody = document.getElementById('services-table-body');
    const openServiceModalBtn = document.getElementById('open-service-modal');
    const closeServiceModalBtn = document.getElementById('close-service-modal');
    const serviceModal = document.getElementById('service-modal');
    const serviceForm = document.getElementById('service-form');
    const serviceClientSelect = document.getElementById('service-client');

    const BASE_URL = 'http://127.0.0.1:8000';

    // Show modal
    openServiceModalBtn.addEventListener('click', () => {
        serviceModal.classList.remove('hidden');
        fetchClients();  // Load clients into dropdown
    });

    // Hide modal
    closeServiceModalBtn.addEventListener('click', () => {
        serviceModal.classList.add('hidden');
        serviceForm.reset();
    });

    // Fetch and display services
    async function fetchServices() {
        try {
            const response = await fetch(`${BASE_URL}/api/collections/`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const services = await response.json();

            servicesTableBody.innerHTML = '';
            services.forEach(service => {
                const row = `
                    <tr class="border-b">
                        <td class="p-2">${service.id}</td>
                        <td class="p-2">${service.client_name || '—'}</td>
                        <td class="p-2">${service.date_collected}</td>
                        <td class="p-2">${service.due_date}</td>
                        <td class="p-2">${service.invoiced ? 'Yes' : 'No'}</td>
                    </tr>
                `;
                servicesTableBody.innerHTML += row;
            });
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    }

    // Fetch clients for dropdown
    async function fetchClients() {
        try {
            const response = await fetch(`${BASE_URL}/api/clients/`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const clients = await response.json();

            serviceClientSelect.innerHTML = `<option value="">Select Client</option>`;
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                serviceClientSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        }
    }

    // Submit new service
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            client: serviceClientSelect.value,
            date_collected: document.getElementById('service-start-date').value,
            due_date: document.getElementById('service-due-date').value,
            invoiced: false,
            items: [] 
        };

        try {
            const response = await fetch(`${BASE_URL}/api/collections/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Error creating service');
            }

            serviceModal.classList.add('hidden');
            serviceForm.reset();
            fetchServices();  // Refresh table
        } catch (err) {
            console.error(err);
            alert('Failed to create service');
        }
    });

    // Initial load
    fetchServices();
});
