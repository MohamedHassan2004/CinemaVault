/**
 * Registration page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the registration form
    initRegisterForm();
    
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});

/**
 * Initialize the registration form
 */
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerError = document.getElementById('registerError');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Validate form data
            if (!username || !email || !password) {
                showError('Please fill in all required fields.');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            
            // Validate password strength
            if (password.length < 8) {
                showError('Password must be at least 8 characters long.');
                return;
            }
            
            // Show loading overlay
            if (loadingOverlay) loadingOverlay.classList.remove('d-none');
            
            try {
                // Attempt registration
                const result = await Auth.register({
                    username,
                    email,
                    password,
                    role
                });
                
                if (result.success) {
                    // Redirect to login page on success
                    window.location.href = 'login.html?registered=true';
                } else {
                    // Show error message
                    showError(result.error || 'Registration failed. Please try again.');
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
        if (registerError) {
            registerError.textContent = message;
            registerError.classList.remove('d-none');
        }
    }
}
