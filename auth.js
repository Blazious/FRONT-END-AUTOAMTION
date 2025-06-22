// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const demoLogin = document.getElementById('demoLogin');

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const TOKEN_ENDPOINT = `${API_BASE_URL}/token/`;

// Password toggle functionality
passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁' : '🙈';
});

// Form submission with backend integration
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Hide previous messages
    hideMessages();
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    try {
        // Make API call to backend
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Successful authentication
            const { access, refresh, user } = data;
            
            // Store tokens securely
            storeAuthTokens(access, refresh);
            
            // Store user data
            storeUserData(user);
            
            showSuccess(`Welcome back, ${user?.username || 'User'}! Redirecting to dashboard...`);
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            // Authentication failed
            let errorMsg = 'Invalid credentials. Please try again.';
            
            if (data.detail) {
                errorMsg = data.detail;
            } else if (data.non_field_errors) {
                errorMsg = data.non_field_errors[0];
            } else if (data.error) {
                errorMsg = data.error;
            }
            
            showError(errorMsg);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Unable to connect to server. Please check your connection and try again.');
        } else {
            showError('An unexpected error occurred. Please try again.');
        }
    } finally {
        showLoading(false);
    }
});

// Demo login with backend credentials
demoLogin.addEventListener('click', function() {
    emailInput.value = 'jimmy@gmail.com';
    passwordInput.value = 'chilumo1993';
    
    // Add visual feedback
    emailInput.style.background = '#e8f5e8';
    passwordInput.style.background = '#e8f5e8';
    
    setTimeout(() => {
        emailInput.style.background = '';
        passwordInput.style.background = '';
    }, 1000);
});

// Token management functions
function storeAuthTokens(accessToken, refreshToken) {
    // Store in localStorage which persists between page loads
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_timestamp', Date.now());
    
    // Also store in memory for quick access
    window.authTokens = {
        access: accessToken,
        refresh: refreshToken,
        timestamp: Date.now()
    };
    
    // Set authentication flag
    window.isAuthenticated = true;
}

function storeUserData(userData) {
    // Store user data in memory
    window.currentUser = userData;
    
    // In a real application, you would use:
    // localStorage.setItem('user_data', JSON.stringify(userData));
    
    console.log('User data stored:', userData);
}

function getAuthToken() {
    // Get from memory (replace with localStorage in real app)
    return window.authTokens?.access || null;
}

function isTokenExpired() {
    if (!window.authTokens) return true;
    
    // Check if token is older than 1 hour (adjust based on your backend settings)
    const hourInMs = 60 * 60 * 1000;
    return (Date.now() - window.authTokens.timestamp) > hourInMs;
}

// Utility functions
function showLoading(loading) {
    loginBtn.classList.toggle('loading', loading);
    loginBtn.disabled = loading;
    
    if (loading) {
        loginBtn.querySelector('.btn-text').textContent = 'Signing In...';
    } else {
        loginBtn.querySelector('.btn-text').textContent = 'Sign In';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.animation = 'slideUp 0.3s ease-out';
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 8000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.style.animation = 'slideUp 0.3s ease-out';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add input animation effects
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Forgot password handler
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    // You can implement password reset API call here
    showError('Password reset functionality coming soon. Contact admin for assistance.');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        demoLogin.click();
    }
});

// Token refresh function (for future use)
async function refreshAuthToken() {
    const refreshToken = window.authTokens?.refresh;
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            storeAuthTokens(data.access, refreshToken);
            return data.access;
        } else {
            throw new Error('Token refresh failed');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        // Redirect to login page
        window.location.href = 'index.html';
        throw error;
    }
}

// API helper function for authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
    let token = getAuthToken();
    
    // Check if token needs refresh
    if (isTokenExpired()) {
        try {
            token = await refreshAuthToken();
        } catch (error) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    return fetch(url, { ...options, ...defaultOptions });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (getAuthToken() && !isTokenExpired()) {
        // User is already authenticated, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
    
    // Focus on email input
    emailInput.focus();
});
