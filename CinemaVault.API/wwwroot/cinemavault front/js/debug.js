/**
 * Debug utilities for Cinema Vault
 */
const Debug = {
    /**
     * Enable debug mode
     */
    enable() {
        localStorage.setItem('debug_mode', 'true');
        console.log('Debug mode enabled');
        this.addDebugPanel();
    },

    /**
     * Disable debug mode
     */
    disable() {
        localStorage.setItem('debug_mode', 'false');
        console.log('Debug mode disabled');
        this.removeDebugPanel();
    },

    /**
     * Check if debug mode is enabled
     * @returns {boolean} - Whether debug mode is enabled
     */
    isEnabled() {
        return localStorage.getItem('debug_mode') === 'true';
    },

    /**
     * Log a debug message
     * @param {string} message - The message to log
     * @param {any} data - Optional data to log
     */
    log(message, data = null) {
        if (this.isEnabled()) {
            if (data) {
                console.log(`[DEBUG] ${message}`, data);
                this.addToDebugPanel(`${message}: ${JSON.stringify(data, null, 2)}`);
            } else {
                console.log(`[DEBUG] ${message}`);
                this.addToDebugPanel(message);
            }
        }
    },

    /**
     * Log an API request
     * @param {string} method - The HTTP method
     * @param {string} url - The URL
     * @param {object} data - The request data
     */
    logRequest(method, url, data = null) {
        if (this.isEnabled()) {
            console.log(`[DEBUG] API Request: ${method} ${url}`, data);
            this.addToDebugPanel(`API Request: ${method} ${url}`);
            if (data) {
                this.addToDebugPanel(`Request Data: ${JSON.stringify(data, null, 2)}`);
            }
        }
    },

    /**
     * Log an API response
     * @param {string} method - The HTTP method
     * @param {string} url - The URL
     * @param {object} response - The response data
     */
    logResponse(method, url, response) {
        if (this.isEnabled()) {
            console.log(`[DEBUG] API Response: ${method} ${url}`, response);
            this.addToDebugPanel(`API Response: ${method} ${url}`);
            this.addToDebugPanel(`Response Data: ${JSON.stringify(response, null, 2)}`);

            // Log poster URLs if present in the response
            if (response && Array.isArray(response)) {
                response.forEach(item => {
                    if (item.posterUrl) {
                        this.logImageUrl(item.posterUrl, item.title || 'Unknown');
                    }
                });
            } else if (response && response.posterUrl) {
                this.logImageUrl(response.posterUrl, response.title || 'Unknown');
            }
        }
    },

    /**
     * Log an image URL and its full path
     * @param {string} imageUrl - The image URL from the API
     * @param {string} title - The title or description of the image
     */
    logImageUrl(imageUrl, title) {
        if (this.isEnabled()) {
            const fullUrl = CONFIG.getFullPosterUrl(imageUrl);
            console.log(`[DEBUG] Image URL for "${title}":`, {
                original: imageUrl,
                full: fullUrl
            });
            this.addToDebugPanel(`Image URL for "${title}":`);
            this.addToDebugPanel(`  Original: ${imageUrl}`);
            this.addToDebugPanel(`  Full: ${fullUrl}`);
        }
    },

    /**
     * Log an error
     * @param {string} message - The error message
     * @param {Error} error - The error object
     */
    logError(message, error) {
        if (this.isEnabled()) {
            console.error(`[DEBUG] ERROR: ${message}`, error);
            this.addToDebugPanel(`ERROR: ${message}`);
            if (error) {
                this.addToDebugPanel(`Error Details: ${error.message}`);
                if (error.stack) {
                    this.addToDebugPanel(`Stack Trace: ${error.stack}`);
                }
            }
        }
    },

    /**
     * Add the debug panel to the page
     */
    addDebugPanel() {
        if (document.getElementById('debug-panel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '0';
        panel.style.right = '0';
        panel.style.width = '400px';
        panel.style.height = '300px';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        panel.style.color = '#00ff00';
        panel.style.padding = '10px';
        panel.style.overflow = 'auto';
        panel.style.fontFamily = 'monospace';
        panel.style.fontSize = '12px';
        panel.style.zIndex = '9999';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '10px';

        const title = document.createElement('h3');
        title.textContent = 'Debug Panel';
        title.style.margin = '0';
        title.style.color = '#00ff00';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.backgroundColor = '#333';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.padding = '5px 10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => this.disable();

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.backgroundColor = '#333';
        clearBtn.style.color = '#fff';
        clearBtn.style.border = 'none';
        clearBtn.style.padding = '5px 10px';
        clearBtn.style.marginRight = '5px';
        clearBtn.style.cursor = 'pointer';
        clearBtn.onclick = () => {
            const content = document.getElementById('debug-content');
            if (content) {
                content.innerHTML = '';
            }
        };

        const buttonContainer = document.createElement('div');
        buttonContainer.appendChild(clearBtn);
        buttonContainer.appendChild(closeBtn);

        header.appendChild(title);
        header.appendChild(buttonContainer);

        const content = document.createElement('div');
        content.id = 'debug-content';

        panel.appendChild(header);
        panel.appendChild(content);

        document.body.appendChild(panel);
    },

    /**
     * Remove the debug panel from the page
     */
    removeDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.remove();
        }
    },

    /**
     * Add a message to the debug panel
     * @param {string} message - The message to add
     */
    addToDebugPanel(message) {
        const content = document.getElementById('debug-content');
        if (content) {
            const entry = document.createElement('div');
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            entry.style.borderBottom = '1px solid #333';
            entry.style.paddingBottom = '5px';
            entry.style.marginBottom = '5px';
            content.appendChild(entry);
            content.scrollTop = content.scrollHeight;
        }
    }
};

// Initialize debug mode if enabled
document.addEventListener('DOMContentLoaded', () => {
    if (Debug.isEnabled()) {
        Debug.addDebugPanel();
    }

    // Add keyboard shortcut (Ctrl+Shift+D) to toggle debug mode
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            if (Debug.isEnabled()) {
                Debug.disable();
            } else {
                Debug.enable();
            }
        }
    });
});
