/**
 * Authentication Service for Cinema Vault
 * Handles user authentication, registration, and session management
 */
const Auth = {
    /**
     * Check if the user is logged in
     * @returns {boolean} - Whether the user is logged in
     */
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    },

    /**
     * Get the current user information
     * @returns {object|null} - The user information or null if not logged in
     */
    getCurrentUser() {
        const userJson = localStorage.getItem(CONFIG.AUTH.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    /**
     * Get the authentication token
     * @returns {string|null} - The JWT token or null if not logged in
     */
    getToken() {
        const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
        console.log('Token from localStorage:', token);
        console.log('Token key used:', CONFIG.AUTH.TOKEN_KEY);

        // If token is null, try to check if there are any other tokens in localStorage
        if (!token) {
            console.log('Token not found, checking all localStorage items:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                console.log(`${key}: ${value ? value.substring(0, 20) + '...' : 'null'}`);
            }
        }

        return token;
    },

    /**
     * Check if the current user is an admin
     * @returns {boolean} - Whether the user is an admin
     */
    isAdmin() {
        if (!this.isLoggedIn()) return false;

        const user = this.getCurrentUser();
        if (!user) return false;

        // Check for admin role in the JWT claims
        // The role claim might be in different properties depending on your JWT structure
        return user.role === 'Admin' ||
               (user.role && user.role.includes('Admin')) ||
               (user.roles && user.roles.includes('Admin')) ||
               (user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin') ||
               (Array.isArray(user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) &&
                user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('Admin'));
    },

    /**
     * Check if the current user has the User role
     * @returns {boolean} - Whether the user has the User role
     */
    isUser() {
        if (!this.isLoggedIn()) return false;

        const user = this.getCurrentUser();
        if (!user) return false;

        // Check for User role in the JWT claims
        // The role claim might be in different properties depending on your JWT structure
        return user.role === 'User' ||
               (user.role && user.role.includes('User')) ||
               (user.roles && user.roles.includes('User')) ||
               (user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'User') ||
               (Array.isArray(user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) &&
                user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('User')) ||
               // Also check for Customer role for backward compatibility
               user.role === 'User' ||
               (user.role && user.role.includes('User')) ||
               (user.roles && user.roles.includes('User')) ||
               (user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'User') ||
               (Array.isArray(user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) &&
                user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].includes('User'));
    },

    /**
     * Login a user
     * @param {string} username - The username
     * @param {string} password - The password
     * @returns {Promise} - The login result
     */
    async login(username, password) {
        try {
            // Try different API endpoints
            const endpoints = [
                'Auth/login',
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying login with endpoint: ${endpoint}`);

                    // Make direct fetch call to have more control over the request
                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });

                    if (response.ok) {
                        console.log(`Login endpoint ${endpoint} worked!`);

                        // Parse response
                        const data = await response.json();

                        if (data && data.token) {
                            console.log('Received token from server:', data.token.substring(0, 20) + '...');
                            console.log('Storing token with key:', CONFIG.AUTH.TOKEN_KEY);

                            // Store the token in localStorage
                            localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, data.token);

                            // Verify the token was stored correctly
                            const storedToken = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
                            console.log('Verified stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');

                            // Parse the JWT token to get user info
                            const user = this.parseJwt(data.token);
                            console.log('Parsed user info:', user);
                            localStorage.setItem(CONFIG.AUTH.USER_KEY, JSON.stringify(user));

                            // Also store the token with a simpler key as a backup
                            localStorage.setItem('token', data.token);

                            return { success: true };
                        } else {
                            // Check if the token might be in a different property
                            console.log('Login response data:', data);

                            // Try to find the token in the response
                            let token = null;
                            if (data) {
                                if (data.accessToken) token = data.accessToken;
                                else if (data.access_token) token = data.access_token;
                                else if (data.jwt) token = data.jwt;
                                else if (data.auth && data.auth.token) token = data.auth.token;
                                else if (typeof data === 'string' && data.startsWith('ey')) token = data;
                            }

                            if (token) {
                                console.log('Found token in alternative property:', token.substring(0, 20) + '...');
                                localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, token);
                                localStorage.setItem('token', token);

                                // Parse the JWT token to get user info
                                const user = this.parseJwt(token);
                                localStorage.setItem(CONFIG.AUTH.USER_KEY, JSON.stringify(user));

                                return { success: true };
                            }

                            console.warn('Login response missing token:', data);
                        }
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
                            }
                        } catch (e) {
                            console.warn('Could not parse error response:', e);
                        }
                        console.warn(`Login endpoint ${endpoint} failed:`, errorMessage);
                    }
                } catch (endpointError) {
                    console.warn(`Login endpoint ${endpoint} error:`, endpointError);
                }
            }

            // If all endpoints fail, throw an error
            throw new Error('All login endpoints failed');
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Register a new user
     * @param {object} userData - The user data
     * @returns {Promise} - The registration result
     */
    async register(userData) {
        try {
            // Try different API endpoints
            const endpoints = [
                'Auth/register',
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying register with endpoint: ${endpoint}`);

                    // Make direct fetch call to have more control over the request
                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData)
                    });

                    if (response.ok) {
                        console.log(`Register endpoint ${endpoint} worked!`);
                        return { success: true };
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
                            }
                        } catch (e) {
                            console.warn('Could not parse error response:', e);
                        }
                        console.warn(`Register endpoint ${endpoint} failed:`, errorMessage);
                    }
                } catch (endpointError) {
                    console.warn(`Register endpoint ${endpoint} error:`, endpointError);
                }
            }

            // If all endpoints fail, throw an error
            throw new Error('All register endpoints failed');
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Logout the current user
     */
    logout() {
        localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH.USER_KEY);
        window.location.href = 'index.html';
    },

    /**
     * Parse a JWT token
     * @param {string} token - The JWT token
     * @returns {object} - The decoded token payload
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            return {};
        }
    },

    /**
     * Update the UI based on authentication status
     */
    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const adminMenu = document.getElementById('adminMenu');
        const adminControls = document.querySelectorAll('.admin-control');
        const userControls = document.querySelectorAll('.user-control');

        const isLoggedIn = this.isLoggedIn();
        const isAdmin = this.isAdmin();

        // Update auth buttons and user menu
        if (isLoggedIn) {
            // User is logged in
            if (authButtons) authButtons.classList.add('d-none');
            if (userMenu) {
                userMenu.classList.remove('d-none');
                const user = this.getCurrentUser();
                const usernameElement = document.getElementById('username');
                if (usernameElement && user) {
                    usernameElement.textContent = user.name || user.sub || 'User';
                }

                // Add admin badge if user is admin
                if (isAdmin && usernameElement) {
                    const adminBadge = document.createElement('span');
                    adminBadge.className = 'badge bg-danger ms-1';
                    adminBadge.textContent = 'Admin';
                    usernameElement.appendChild(adminBadge);
                }
            }
        } else {
            // User is not logged in
            if (authButtons) authButtons.classList.remove('d-none');
            if (userMenu) userMenu.classList.add('d-none');
        }

        // Show/hide admin menu
        if (adminMenu) {
            if (isLoggedIn && isAdmin) {
                adminMenu.classList.remove('d-none');
            } else {
                adminMenu.classList.add('d-none');
            }
        }

        // Show/hide admin controls
        adminControls.forEach(control => {
            if (isLoggedIn && isAdmin) {
                control.classList.remove('d-none');
            } else {
                control.classList.add('d-none');
            }
        });

        // Show/hide user controls
        userControls.forEach(control => {
            if (isLoggedIn && this.isUser()) {
                control.classList.remove('d-none');
            } else {
                control.classList.add('d-none');
            }
        });

        // Add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
};

// Update the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateAuthUI();
});



