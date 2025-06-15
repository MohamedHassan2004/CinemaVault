/**
 * Configuration settings for the Cinema Vault application
 */
const CONFIG = {
    // API base URL - change this to match your API endpoint
    API_BASE_URL: 'https://localhost:7063/api',

    // Alternative API URLs to try if the main one fails
    API_FALLBACK_URLS: [
        'http://localhost:7063/api',
        'https://localhost:5001/api',
        'http://localhost:5000/api'
    ],

    // Base URL for static files (images, etc.)
    get STATIC_BASE_URL() {
        // Extract the base URL from the API URL (remove '/api')
        const apiUrl = localStorage.getItem('cinema_vault_api_url') || this.API_BASE_URL;
        return apiUrl.replace('/api', '');
    },

    // Authentication settings
    AUTH: {
        TOKEN_KEY: 'cinema_vault_token',
        USER_KEY: 'cinema_vault_user'
    },

    // Default counts for movie lists
    MOVIE_COUNTS: {
        LATEST: 8,
        TOP_RATED: 8
    },

    /**
     * Get the full URL for a movie poster
     * @param {string} posterPath - The poster path from the API
     * @returns {string} - The full URL for the poster
     */
    getFullPosterUrl(posterPath) {
        if (!posterPath) {
            return 'https://via.placeholder.com/300x450?text=No+Image';
        }

        // If the path already starts with http:// or https://, return it as is
        if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
            return posterPath;
        }

        // If the path starts with a slash, remove it
        const cleanPath = posterPath.startsWith('/') ? posterPath.substring(1) : posterPath;

        // Return the full URL
        return `${this.STATIC_BASE_URL}/${cleanPath}`;
    }
};
