/**
 * Login page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the login form
    initLoginForm();
    
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});

/**
 * Initialize the login form
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate form data
            if (!username || !password) {
                showError('Please enter both username and password.');
                return;
            }
            
            // Show loading overlay
            if (loadingOverlay) loadingOverlay.classList.remove('d-none');
            
            try {
                // Attempt login
                const result = await Auth.login(username, password);
                
                if (result.success) {
                    // Redirect to home page on success
                    window.location.href = 'index.html';
                } else {
                    // Show error message
                    showError(result.error || 'Login failed. Please try again.');
                }
            } catch (error) {
                showError(error.message || 'An unexpected error occurred. Please try again.');
            } finally {
                // Hide loading overlay
                if (loadingOverlay) loadingOverlay.classList.add('d-none');
            }
        });
    }
    
    /**
     * Show an error message
     * @param {string} message - The error message
     */
    function showError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.classList.remove('d-none');
        }
    }
}
