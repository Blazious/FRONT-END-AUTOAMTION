import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:8000';
  const expenseModal = document.getElementById('expense-modal');
  const openExpenseBtn = document.getElementById('open-expense-modal');
  const closeExpenseBtn = document.getElementById('close-expense-modal');
  const expenseForm = document.getElementById('expense-form');
  const expensesTable = document.getElementById('expenses-table-body');
  const expenseCollectionSelect = document.getElementById('expense-collection-select');

  function loadExpenses() {
    expensesTable.innerHTML = '';

    fetch(`${BASE_URL}/api/general-expenses/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        data.forEach(exp => addExpenseRow(exp, 'General'));
      });

    fetch(`${BASE_URL}/api/expenses/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        data.forEach(exp => addExpenseRow(exp, 'Collection'));
      });
  }

  function addExpenseRow(exp, type) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-2">${exp.date}</td>
      <td class="p-2">${type}</td>
      <td class="p-2">${exp.description}</td>
      <td class="p-2">${exp.amount}</td>
      <td class="p-2">${exp.reference || '-'}</td>
      <td class="p-2">
        <button onclick="deleteExpense('${exp.id}', '${type}')" class="text-red-600">Delete</button>
      </td>`;
    expensesTable.appendChild(row);
  }

  window.deleteExpense = function(id, type) {
    const url = type === 'General'
      ? `${BASE_URL}/api/general-expenses/${id}/`
      : `${BASE_URL}/api/expenses/${id}/`;

    if (!confirm(`Delete this ${type.toLowerCase()} expense?`)) return;

    fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }).then(res => {
      if (res.ok) loadExpenses();
    });
  };

  function loadCollections() {
    fetch(`${BASE_URL}/api/collections/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        expenseCollectionSelect.innerHTML = '<option value="">Select Collection (optional)</option>';
        data.forEach(col => {
          const label = `${col.client.name} - ${col.date_collected}`;
          expenseCollectionSelect.innerHTML += `<option value="${col.id}">${label}</option>`;
        });
      });
  }

  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(expenseForm);
    const hasCollection = formData.get('collection');

    const url = hasCollection
      ? `${BASE_URL}/api/expenses/`
      : `${BASE_URL}/api/general-expenses/`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    }).then(res => {
      if (res.ok) {
        expenseModal.classList.add('hidden');
        expenseForm.reset();
        loadExpenses();
      }
    });
  });

  openExpenseBtn?.addEventListener('click', () => {
    loadCollections();
    expenseModal.classList.remove('hidden');
  });

  closeExpenseBtn?.addEventListener('click', () => {
    expenseModal.classList.add('hidden');
  });

  if (document.getElementById('expenses')) {
    loadExpenses();
  }
});
