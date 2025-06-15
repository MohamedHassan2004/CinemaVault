/**
 * API Service for Cinema Vault
 * Handles all API requests to the backend
 */
const API = {
    /**
     * Make a GET request to the API
     * @param {string} endpoint - The API endpoint
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise} - The response data
     */
    async get(endpoint, requiresAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            // Try to get token from Auth.getToken if available
            let token = null;
            if (typeof Auth !== 'undefined' && typeof Auth.getToken === 'function') {
                token = Auth.getToken();
            }

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('API.get: Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('API.get: Using token:', token.substring(0, 20) + '...');
            headers['Authorization'] = `Bearer ${token}`;
        }

        const url = `${CONFIG.API_BASE_URL}/${endpoint}`;
        Debug.logRequest('GET', url);

        try {
            // Add a timeout to avoid waiting too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: controller.signal
            });

            // Clear the timeout
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `API error: ${response.status} ${response.statusText}`;

                // Try to get more detailed error information
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        if (errorData && errorData.error) {
                            errorMessage = errorData.error;
                        } else if (errorData && errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData && typeof errorData === 'string') {
                            errorMessage = errorData;
                        }
                    }
                } catch (parseError) {
                    console.warn('Error parsing error response:', parseError);
                }

                Debug.logError(errorMessage, new Error(errorMessage));
                throw new Error(errorMessage);
            }

            // Check if there's content to parse
            const contentType = response.headers.get('content-type');
            let responseData;

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = { success: true };
            }

            Debug.logResponse('GET', url, responseData);
            return responseData;
        } catch (error) {
            // Handle abort errors (timeout)
            if (error.name === 'AbortError') {
                const timeoutError = new Error(`Request timeout for ${url}`);
                Debug.logError(`Request timeout for ${url}`, timeoutError);
                throw timeoutError;
            }

            // Handle network errors
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                const networkError = new Error(`Network error while fetching ${url}`);
                Debug.logError(`Network error while fetching ${url}`, networkError);
                throw networkError;
            }

            // Rethrow other errors
            Debug.logError(`Error fetching ${url}: ${error.message}`, error);
            throw error;
        }
    },

    /**
     * Make a POST request to the API
     * @param {string} endpoint - The API endpoint
     * @param {object} data - The data to send
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise} - The response data
     */
    async post(endpoint, data, requiresAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            // Try to get token from Auth.getToken if available
            let token = null;
            if (typeof Auth !== 'undefined' && typeof Auth.getToken === 'function') {
                token = Auth.getToken();
            }

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('API.post: Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('API.post: Using token:', token.substring(0, 20) + '...');
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    }
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Check if there's content to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true };
        }
    },

    /**
     * Make a PUT request to the API
     * @param {string} endpoint - The API endpoint
     * @param {object} data - The data to send
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise} - The response data
     */
    async put(endpoint, data, requiresAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            // Try to get token from Auth.getToken if available
            let token = null;
            if (typeof Auth !== 'undefined' && typeof Auth.getToken === 'function') {
                token = Auth.getToken();
            }

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('API.put: Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('API.put: Using token:', token.substring(0, 20) + '...');
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    }
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Check if there's content to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true };
        }
    },

    /**
     * Make a DELETE request to the API
     * @param {string} endpoint - The API endpoint
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise} - The response data
     */
    async delete(endpoint, requiresAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
            if (!token) {
                throw new Error('Authentication required');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    }
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Check if there's content to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true };
        }
    },

    /**
     * Upload a file to the API
     * @param {string} endpoint - The API endpoint
     * @param {FormData} formData - The form data to send
     * @param {boolean} requiresAuth - Whether the request requires authentication
     * @returns {Promise} - The response data
     */
    async uploadFile(endpoint, formData, requiresAuth = false) {
        const headers = {};

        if (requiresAuth) {
            const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
            if (!token) {
                throw new Error('Authentication required');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    }
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Check if there's content to parse
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return { success: true };
        }
    }
};
