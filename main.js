// main.js

// Get stored token
export function getToken() {
    return localStorage.getItem('access_token');
}

// Check if token exists and is valid (basic check only)
export function checkAuth() {
    const token = getToken();
    const timestamp = localStorage.getItem('token_timestamp');
    const hourInMs = 60 * 60 * 1000;

    if (!token || !timestamp || (Date.now() - parseInt(timestamp)) > hourInMs) {
        localStorage.clear();
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Fetch wrapper with Authorization header
export async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logoutUser();
        return null;
    }

    return response;
}

// Logout user and blacklist token
export function logoutUser() {
    const token = getToken();
    if (!token) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    fetch('http://127.0.0.1:8000/api/token/blacklist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
    })
    .finally(() => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// DOM Ready: Hook up logout button and load user name
document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.querySelector("button.logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Fetch and display logged-in user's name
    if (checkAuth()) {
        try {
            const res = await fetchWithAuth('http://127.0.0.1:8000/api/users/me/');
            if (res && res.ok) {
                const user = await res.json();
                const userDisplayEl = document.getElementById('user-welcome-name');
                if (userDisplayEl) {
                    userDisplayEl.textContent = user.name || user.username || "User";
                }
            }
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
        }
    }
});
