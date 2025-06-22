import { getToken } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://127.0.0.1:8000';
  const summaryUrl = `${BASE_URL}/api/analytics/financial-summary/`;
  const graphUrl = `${BASE_URL}/api/analytics/summary/graph/`;

  const form = document.getElementById('analytics-filter-form');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  const revenueEl = document.getElementById('total-revenue');
  const expenseEl = document.getElementById('total-expense');
  const profitEl = document.getElementById('net-profit');
  const marginEl = document.getElementById('profit-margin');
  const chartImg = document.getElementById('analytics-chart');

  function loadAnalytics(startDate = '', endDate = '') {
    const token = getToken();
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    // --- Fetch summary ---
    fetch(`${summaryUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Analytics summary response:', data);
        revenueEl.textContent = `Ksh ${parseFloat(data.total_revenue).toLocaleString()}`;
        expenseEl.textContent = `Ksh ${parseFloat(data.total_expense).toLocaleString()}`;
        profitEl.textContent = `Ksh ${parseFloat(data.net_profit).toLocaleString()}`;
        marginEl.textContent = `(${data.net_profit_margin_percent}%)`;
      })
      .catch(err => console.error('Error loading financial summary:', err));

    // --- Fetch graph image ---
    fetch(`${graphUrl}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Graph API returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Graph response:", data);

        if (chartImg && data.graph_image_base64) {
          chartImg.src = `data:image/png;base64,${data.graph_image_base64}`;
          chartImg.onerror = () => console.error("Failed to load image.");
        } else {
          console.warn('No image data found or chart element missing');
        }
      })
      .catch(err => {
        console.error('Error loading chart image:', err);
        if (chartImg) chartImg.src = '';
      });
  }

  // Handle filter form submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const start = startDateInput.value;
      const end = endDateInput.value;
      loadAnalytics(start, end);
    });
  }

  // Initial load
  if (document.getElementById('analytics')) {
    loadAnalytics();
  }
});
