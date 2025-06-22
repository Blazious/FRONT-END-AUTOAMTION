// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// DOM Elements
const clientsTableBody = document.getElementById('clientsTableBody');
const collectionsTableBody = document.getElementById('collectionsTableBody');
const invoicesTableBody = document.getElementById('invoicesTableBody');
const receiptsTableBody = document.getElementById('receiptsTableBody');


// Authentication check
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const timestamp = localStorage.getItem('token_timestamp');
    
    if (!token || !timestamp) {
        window.location.href = 'index.html';
        return false;
    }
    
    const hourInMs = 60 * 60 * 1000;
    const isTokenValid = (Date.now() - parseInt(timestamp)) < hourInMs;
    
    if (!isTokenValid) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_timestamp');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Tab switching functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Load data for the active tab
            loadTabData(targetTab);
        });
    });
}

// Load data for specific tab
function loadTabData(tabName) {
    switch(tabName) {
        case 'clients':
            loadClients();
            break;
        case 'collections':
            loadCollections();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'receipts': // ✅ Added case for receipts
            loadReceipts();
            break;
    }
}

// Load clients data from API
async function loadClients() {
    try {
        const clients = await fetchClients();
        const tbody = document.getElementById('clientsTableBody');
        const pagination = document.getElementById('clientsPagination');
        
        tbody.innerHTML = '';
        
        clients.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-slate-50 transition-colors';
            row.innerHTML = `
                <td class="p-4 font-medium text-slate-900">${client.name}</td>
                <td class="p-4 text-slate-600">${client.address}</td>
                <td class="p-4 text-slate-600">${client.city}</td>
                <td class="p-4 text-slate-600">${client.phone}</td>
                <td class="p-4 text-slate-600">${client.email}</td>
                <td class="p-4">
                    <span class="status-badge ${client.wht_agent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${client.wht_agent ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="p-4">
                    <div class="relative">
                        <button class="action-menu-btn px-2 py-1 text-gray-400 hover:text-gray-600" data-client-id="${client.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                        <div class="dropdown-menu w-32">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 edit-client" data-client-id="${client.id}">Edit</a>
                            <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 delete-client" data-client-id="${client.id}">Delete</a>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        pagination.textContent = `Showing 1–${clients.length} of ${clients.length} clients`;
    } catch (error) {
        console.error('Error loading clients:', error);
        showError('Failed to load clients. Please try again.');
    }
}

// Load collections data from API
async function loadCollections() {
    try {
        const collections = await fetchCollections();
        const tbody = document.getElementById('collectionsTableBody');
        const pagination = document.getElementById('collectionsPagination');
        
        tbody.innerHTML = '';
        
        collections.forEach(collection => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-slate-50 transition-colors';
            row.innerHTML = `
                <td class="p-4 font-medium text-slate-900">${collection.client}</td>
                <td class="p-4 text-slate-600">${collection.date_collected}</td>
                <td class="p-4 text-slate-600">${collection.due_date}</td>
                <td class="p-4">
                    <span class="status-badge ${collection.invoiced ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${collection.invoiced ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="p-4 text-slate-600">${collection.created_by}</td>
                <td class="p-4">
                    <div class="relative">
                        <button class="action-menu-btn px-2 py-1 text-gray-400 hover:text-gray-600" data-collection-id="${collection.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                        <div class="dropdown-menu w-48">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 view-collection" data-collection-id="${collection.id}">View Collection with items</a>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 edit-collection" data-collection-id="${collection.id}">Edit Collection</a>
                            <hr class="my-1">
                            <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 delete-collection" data-collection-id="${collection.id}">Delete Collection</a>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        pagination.textContent = `Showing 1–${collections.length} of ${collections.length} collections`;
    } catch (error) {
        console.error('Error loading collections:', error);
        showError('Failed to load collections. Please try again.');
    }
}

// Load invoices data from API
async function loadInvoices() {
    try {
        const invoices = await fetchInvoices();
        const tbody = document.getElementById('invoicesTableBody');
        const pagination = document.getElementById('invoicesPagination');
        
        tbody.innerHTML = '';
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-slate-50 transition-colors';
            row.innerHTML = `
                <td class="p-4 font-medium text-blue-600 cursor-pointer hover:underline" onclick="showInvoiceDetails(${invoice.id})">
                    ${invoice.invoice_number}
                </td>
                <td class="p-4 text-slate-900 font-medium">${invoice.client}</td>
                <td class="p-4 text-slate-600">${invoice.date_issued}</td>
                <td class="p-4 text-slate-600">${invoice.due_date}</td>
                <td class="p-4 text-slate-900 font-medium">${invoice.total_due.toLocaleString()}</td>
                <td class="p-4">
                    <span class="status-badge status-${invoice.status}">
                        ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                </td>
                <td class="p-4">
                    <button class="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100" onclick="showInvoiceDetails(${invoice.id})">
                        <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        pagination.textContent = `Showing 1–${invoices.length} of ${invoices.length} invoices`;
    } catch (error) {
        console.error('Error loading invoices:', error);
        showError('Failed to load invoices. Please try again.');
    }
}

// Show invoice details modal with data from API
async function showInvoiceDetails(invoiceId) {
    try {
        const invoice = await fetchInvoiceDetails(invoiceId);
        if (!invoice) return;
        
        const modal = document.getElementById('invoiceModal');
        const content = document.getElementById('invoiceModalContent');
        
        content.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold">Invoice Details</h2>
                <div class="flex gap-2">
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.414a1 1 0 01-.707-.293l-2-2A1 1 0 006 6H4a2 2 0 00-2 2v6a2 2 0 002 2h2m5 4v-4m0 0V8m0 4h8m-8 0H7" />
                        </svg>
                        Print
                    </button>
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                    </button>
                    <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">eTIMS</button>
                    ${invoice.status !== 'paid' ? '<button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 mark-as-paid" data-invoice-id="${invoice.id}">Mark as Paid</button>' : ''}
                    <button onclick="closeInvoiceModal()" class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Close</button>
                </div>
            </div>

            <div class="bg-white border rounded-lg p-6 space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900">INVOICE #${invoice.invoice_number}</h1>
                            <p class="text-slate-600">Waste Management Co.</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="status-badge status-${invoice.status}">
                            ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                    </div>
                </div>

                <!-- Company and Client Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="font-semibold text-slate-900 mb-2">From:</h3>
                        <div class="text-slate-600">
                            <p class="font-medium">Waste Management Co.</p>
                            <p>123 Business Park, Nairobi</p>
                            <p>VAT No: P0512345678</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-900 mb-2">To:</h3>
                        <div class="text-slate-600">
                            <p class="font-medium">${invoice.client}</p>
                            <p>${invoice.client_address || 'N/A'}</p>
                            <p>VAT No: ${invoice.client_vat || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span class="font-semibold text-slate-900">Date Issued: </span>
                        <span class="text-slate-600">${invoice.date_issued}</span>
                    </div>
                    <div>
                        <span class="font-semibold text-slate-900">Due Date: </span>
                        <span class="text-slate-600">${invoice.due_date}</span>
                    </div>
                </div>

                <!-- Invoice Items -->
                <div>
                    <h3 class="font-semibold text-slate-900 mb-4">Invoice Items</h3>
                    <div class="border rounded-lg overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-3 font-medium text-slate-700">#</th>
                                    <th class="text-left p-3 font-medium text-slate-700">Description</th>
                                    <th class="text-left p-3 font-medium text-slate-700">Quantity</th>
                                    <th class="text-left p-3 font-medium text-slate-700">Unit</th>
                                    <th class="text-left p-3 font-medium text-slate-700">Unit Price</th>
                                    <th class="text-right p-3 font-medium text-slate-700">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map((item, index) => `
                                    <tr class="border-t">
                                        <td class="p-3 text-slate-600">${index + 1}</td>
                                        <td class="p-3 text-slate-900">${item.description}</td>
                                        <td class="p-3 text-slate-600">${item.quantity.toFixed(3)}</td>
                                        <td class="p-3 text-slate-600">${item.unit}</td>
                                        <td class="p-3 text-slate-600">${item.unit_price.toFixed(2)}</td>
                                        <td class="p-3 text-right text-slate-900 font-medium">${item.amount.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Totals -->
                <div class="flex justify-end">
                    <div class="w-80 space-y-2">
                        <div class="flex justify-between">
                            <span class="text-slate-600">Subtotal:</span>
                            <span class="text-slate-900 font-medium">${invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600">VAT (16%):</span>
                            <span class="text-slate-900 font-medium">${invoice.vat.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600">WHT (2%):</span>
                            <span class="text-slate-900 font-medium">-${invoice.wht.toLocaleString()}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between text-lg font-bold">
                                <span class="text-slate-900">TOTAL:</span>
                                <span class="text-slate-900">${invoice.total_due.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Terms and Notes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    <div>
                        <h3 class="font-semibold text-slate-900 mb-2">Terms:</h3>
                        <p class="text-slate-600">Payment due within 30 days</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-900 mb-2">Payment Methods:</h3>
                        <div class="text-slate-600 space-y-1">
                            <p>Bank: ABC Bank</p>
                            <p>Account No: 123-456-789</p>
                            <p>SWIFT: ABCDKE22</p>
                        </div>
                    </div>
                </div>

                <div class="text-center pt-6 border-t">
                    <p class="text-slate-600">Thank you for your business!</p>
                </div>
            </div>

            <div class="flex gap-2 justify-end pt-4">
                <button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 edit-invoice" data-invoice-id="${invoice.id}">Edit</button>
                <button class="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 delete-invoice" data-invoice-id="${invoice.id}">Delete</button>
                ${invoice.status === 'paid' ? '<button class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">Create Receipt</button>' : ''}
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading invoice details:', error);
        showError('Failed to load invoice details. Please try again.');
    }
}

// Close invoice modal
function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initialize event delegation for all interactive elements
function initEventDelegation() {
    // Handle dropdown menus
    document.addEventListener('click', function(e) {
        // Dropdown toggles
        if (e.target.closest('.action-menu-btn')) {
            e.preventDefault();
            const dropdown = e.target.closest('.action-menu-btn').nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdown) menu.classList.remove('show');
            });
            dropdown.classList.toggle('show');
        } else {
            // Close dropdowns when clicking outside
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }

        // Client actions
        if (e.target.classList.contains('edit-client')) {
            e.preventDefault();
            const clientId = e.target.getAttribute('data-client-id');
            editClient(clientId);
        }
        
        if (e.target.classList.contains('delete-client')) {
            e.preventDefault();
            const clientId = e.target.getAttribute('data-client-id');
            deleteClient(clientId);
        }

        // Collection actions
        if (e.target.classList.contains('view-collection')) {
            e.preventDefault();
            const collectionId = e.target.getAttribute('data-collection-id');
            viewCollection(collectionId);
        }
        
        if (e.target.classList.contains('edit-collection')) {
            e.preventDefault();
            const collectionId = e.target.getAttribute('data-collection-id');
            editCollection(collectionId);
        }
        
        if (e.target.classList.contains('delete-collection')) {
            e.preventDefault();
            const collectionId = e.target.getAttribute('data-collection-id');
            deleteCollection(collectionId);
        }

        // Invoice actions (from modal)
        if (e.target.classList.contains('edit-invoice')) {
            e.preventDefault();
            const invoiceId = e.target.getAttribute('data-invoice-id');
            editInvoice(invoiceId);
        }
        
        if (e.target.classList.contains('delete-invoice')) {
            e.preventDefault();
            const invoiceId = e.target.getAttribute('data-invoice-id');
            deleteInvoice(invoiceId);
        }
        
        if (e.target.classList.contains('mark-as-paid')) {
            e.preventDefault();
            const invoiceId = e.target.getAttribute('data-invoice-id');
            markInvoiceAsPaid(invoiceId);
        }
    });
}

//LOAD RECEIPTS DATA FROM APIs
async function loadReceipts() {
  try {
    const receipts =  await fetchReceipts();
    const receiptsTableBody = document.getElementById('receiptsTableBody');
    const pagination = document.getElementById('receiptsPagination');

    receiptsTableBody.innerHTML = '';

    receipts.forEach(receipt => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-slate-50 transition-colors';
      row.innerHTML = `
        <td class="p-4 font-medium text-slate-900">${receipt.receipt_number}</td>
        <td class="p-4 text-slate-600">${receipt.client?.name || 'N/A'}</td>
        <td class="p-4 text-slate-600">${receipt.invoice?.invoice_number || 'N/A'}</td>
        <td class="p-4 text-slate-600">${receipt.amount}</td>
        <td class="p-4 text-slate-600 capitalize">${receipt.payment_method}</td>
        <td class="p-4 text-slate-600">${receipt.date_paid}</td>
        <td class="p-4 text-slate-600">${receipt.created_by?.username || 'N/A'}</td>
        <td class="p-4">
          <a href="${API_BASE_URL}/receipts/${receipt.id}/pdf/" target="_blank" class="text-blue-600 hover:underline">PDF</a>
        </td>`;
      receiptsTableBody.appendChild(row);
    });

    pagination.textContent = `Showing 1–${receipts.length} of ${receipts.length} receipts`;
  } catch (error) {
    console.error('Error loading receipts:', error);
    alert('Failed to load receipts. Please try again.');
  }
}
// CRUD Operations for Clients
async function editClient(clientId) {
    console.log('Edit client:', clientId);
    // Implement edit functionality - open a modal with a form
}

async function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            await makeAuthenticatedRequest(`${API_BASE_URL}/clients/${clientId}/`, {
                method: 'DELETE'
            });
            loadClients(); // Refresh the list
        } catch (error) {
            showError('Failed to delete client');
        }
    }
}

// CRUD Operations for Collections
async function viewCollection(collectionId) {
    console.log('View collection:', collectionId);
    // Implement view functionality
}

async function editCollection(collectionId) {
    console.log('Edit collection:', collectionId);
    // Implement edit functionality
}

async function deleteCollection(collectionId) {
    if (confirm('Are you sure you want to delete this collection?')) {
        try {
            await makeAuthenticatedRequest(`${API_BASE_URL}/collections/${collectionId}/`, {
                method: 'DELETE'
            });
            loadCollections(); // Refresh the list
        } catch (error) {
            showError('Failed to delete collection');
        }
    }
}

// CRUD Operations for Invoices
async function editInvoice(invoiceId) {
    console.log('Edit invoice:', invoiceId);
    // Implement edit functionality
}

async function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        try {
            await makeAuthenticatedRequest(`${API_BASE_URL}/invoices/${invoiceId}/`, {
                method: 'DELETE'
            });
            closeInvoiceModal();
            loadInvoices(); // Refresh the list
        } catch (error) {
            showError('Failed to delete invoice');
        }
    }
}

async function markInvoiceAsPaid(invoiceId) {
    try {
        await makeAuthenticatedRequest(`${API_BASE_URL}/invoices/${invoiceId}/mark_as_paid/`, {
            method: 'POST'
        });
        showInvoiceDetails(invoiceId); // Refresh the modal
        loadInvoices(); // Refresh the list
    } catch (error) {
        showError('Failed to mark invoice as paid');
    }
}

// Handle logout
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_timestamp');
        window.location.href = 'index.html';
    });
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => errorElement.classList.add('hidden'), 5000);
    }
}

// API helper function for authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const response = await fetch(url, { ...options, ...defaultOptions });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

// API functions
async function fetchClients() {
    return makeAuthenticatedRequest(`${API_BASE_URL}/clients/`);
}

async function fetchCollections() {
    return makeAuthenticatedRequest(`${API_BASE_URL}/collections/`);
}

async function fetchInvoices() {
    return makeAuthenticatedRequest(`${API_BASE_URL}/invoices/`);
}

async function fetchInvoiceDetails(invoiceId) {
    return makeAuthenticatedRequest(`${API_BASE_URL}/invoices/${invoiceId}/`);
}

async function fetchReceipts() {
    return makeAuthenticatedRequest(`${API_BASE_URL}/receipts/`);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Initialize components
    initTabs();
    initEventDelegation(); // Replaces initDropdowns
    initLogout();
   
    
    // Load initial data (clients tab is active by default)
    loadClients();
    
    // Close modal when clicking outside
    document.getElementById('invoiceModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('invoiceModal')) {
            closeInvoiceModal();
        }
    });
});