/**
 * API Tester for Cinema Vault
 * Tests different API URLs to find a working one
 */
const ApiTester = {
    /**
     * Test all API URLs and use the first working one
     * @returns {Promise<string>} - The working API URL
     */
    async findWorkingApiUrl() {
        // Start with the main URL
        const urls = [CONFIG.API_BASE_URL, ...CONFIG.API_FALLBACK_URLS];

        // Create a div to show testing progress
        this.createTestingUI();

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            // Update testing UI
            this.updateTestingUI(url, 'Testing...');

            try {
                console.log(`Testing API URL: ${url}`);
                // Try to fetch the API info
                const response = await fetch(`${url}/Movie/latest/1`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Set a timeout to avoid waiting too long
                    signal: AbortSignal.timeout(5000)
                });

                if (response.ok) {
                    // Update testing UI
                    this.updateTestingUI(url, 'Success!', true);

                    // Update the API base URL
                    CONFIG.API_BASE_URL = url;

                    // Save the working URL to localStorage
                    localStorage.setItem('cinema_vault_api_url', url);

                    // Remove testing UI after a delay
                    setTimeout(() => {
                        this.removeTestingUI();
                    }, 1000);

                    return url;
                } else {
                    // Update testing UI
                    this.updateTestingUI(url, `Failed: ${response.status} ${response.statusText}`, false);
                }
            } catch (error) {
                // Update testing UI
                this.updateTestingUI(url, `Error: ${error.message}`, false);
            }
        }

        // If no URL works, show an error message
        this.showErrorMessage();

        // Return the original URL
        return CONFIG.API_BASE_URL;
    },

    /**
     * Create the testing UI
     */
    createTestingUI() {
        // Remove any existing testing UI
        this.removeTestingUI();

        // Create the testing container
        const container = document.createElement('div');
        container.id = 'api-testing-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.color = '#fff';
        container.style.padding = '10px';
        container.style.zIndex = '9999';
        container.style.fontFamily = 'monospace';
        container.style.fontSize = '14px';

        // Create the title
        const title = document.createElement('div');
        title.textContent = 'Testing API URLs...';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';

        // Create the results container
        const results = document.createElement('div');
        results.id = 'api-testing-results';

        // Add elements to the container
        container.appendChild(title);
        container.appendChild(results);

        // Add the container to the body
        document.body.appendChild(container);
    },

    /**
     * Update the testing UI
     * @param {string} url - The URL being tested
     * @param {string} status - The status of the test
     * @param {boolean} success - Whether the test was successful
     */
    updateTestingUI(url, status, success = null) {
        const results = document.getElementById('api-testing-results');
        if (!results) return;

        // Check if the URL is already in the results
        const existingResult = document.getElementById(`api-test-${this.urlToId(url)}`);

        if (existingResult) {
            // Update the existing result
            const statusSpan = existingResult.querySelector('.api-test-status');
            if (statusSpan) {
                statusSpan.textContent = status;

                // Update the status color
                if (success === true) {
                    statusSpan.style.color = '#4caf50';
                } else if (success === false) {
                    statusSpan.style.color = '#f44336';
                } else {
                    statusSpan.style.color = '#ffeb3b';
                }
            }
        } else {
            // Create a new result
            const result = document.createElement('div');
            result.id = `api-test-${this.urlToId(url)}`;
            result.style.marginBottom = '5px';

            // Create the URL span
            const urlSpan = document.createElement('span');
            urlSpan.textContent = url;
            urlSpan.style.marginRight = '10px';

            // Create the status span
            const statusSpan = document.createElement('span');
            statusSpan.textContent = status;
            statusSpan.className = 'api-test-status';

            // Set the status color
            if (success === true) {
                statusSpan.style.color = '#4caf50';
            } else if (success === false) {
                statusSpan.style.color = '#f44336';
            } else {
                statusSpan.style.color = '#ffeb3b';
            }

            // Add spans to the result
            result.appendChild(urlSpan);
            result.appendChild(statusSpan);

            // Add the result to the results container
            results.appendChild(result);
        }
    },

    /**
     * Remove the testing UI
     */
    removeTestingUI() {
        const container = document.getElementById('api-testing-container');
        if (container) {
            container.remove();
        }
    },

    /**
     * Show an error message
     */
    showErrorMessage() {
        // Create the error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger';
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.padding = '20px';
        errorMessage.style.borderRadius = '5px';
        errorMessage.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        errorMessage.style.zIndex = '9999';
        errorMessage.style.maxWidth = '500px';
        errorMessage.style.width = '90%';

        // Add the error message content
        errorMessage.innerHTML = `
            <h4>API Connection Error</h4>
            <p>Unable to connect to the Cinema Vault API. Please make sure the API is running and accessible.</p>
            <p>Tried the following URLs:</p>
            <ul>
                <li>${CONFIG.API_BASE_URL}</li>
                ${CONFIG.API_FALLBACK_URLS.map(url => `<li>${url}</li>`).join('')}
            </ul>
            <p>Please check your API server and try again.</p>
            <button id="api-error-close" class="btn btn-primary">Close</button>
        `;

        // Add the error message to the body
        document.body.appendChild(errorMessage);

        // Add event listener to the close button
        const closeButton = document.getElementById('api-error-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                errorMessage.remove();
            });
        }
    },

    /**
     * Convert a URL to an ID
     * @param {string} url - The URL to convert
     * @returns {string} - The ID
     */
    urlToId(url) {
        return url.replace(/[^a-z0-9]/gi, '_');
    }
};
