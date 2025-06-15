/**
 * Main application script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Enable debug mode
    if (typeof Debug !== 'undefined') {
        Debug.enable();
    }

    // Initialize the search form
    initSearchForm();

    // Update UI based on authentication status
    Auth.updateAuthUI();

    // Check if we have a saved API URL
    const savedApiUrl = localStorage.getItem('cinema_vault_api_url');
    if (savedApiUrl) {
        CONFIG.API_BASE_URL = savedApiUrl;
        console.log('Using saved API URL:', CONFIG.API_BASE_URL);
    }

    // Test API connection and find a working URL
    try {
        // Find a working API URL
        const workingUrl = await ApiTester.findWorkingApiUrl();
        console.log('Working API URL:', workingUrl);

        // Load latest movies
        await loadLatestMovies();

        // Load top rated movies
        await loadTopRatedMovies();
    } catch (error) {
        console.error('API connection error:', error);
        showApiError();
    }
});

/**
 * Initialize the search form
 */
function initSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput.value.trim();

            if (searchTerm) {
                window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
}

/**
 * Load and display the latest movies
 */
async function loadLatestMovies() {
    const latestMoviesContainer = document.getElementById('latestMovies');
    if (!latestMoviesContainer) return;

    try {
        // Show loading indicator
        latestMoviesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading latest movies...</span>
                </div>
                <p class="mt-2">Loading latest movies...</p>
            </div>
        `;

        console.log('Loading latest movies...');

        // Get latest movies
        const movies = await Movies.getLatestMovies();
        console.log('Latest movies loaded:', movies);

        // Clear loading indicator
        latestMoviesContainer.innerHTML = '';

        if (!movies || movies.length === 0) {
            latestMoviesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <p class="text-center mb-0">No latest movies found.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render movie cards
        movies.forEach(movie => {
            console.log('Rendering movie card for:', movie.title);
            const movieCard = Movies.renderMovieCard(movie);
            if (movieCard) {
                latestMoviesContainer.appendChild(movieCard);
            }
        });
    } catch (error) {
        console.error('Error loading latest movies:', error);
        latestMoviesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5 class="alert-heading">Error Loading Latest Movies</h5>
                    <p>${error.message || 'An unknown error occurred'}</p>
                    <hr>
                    <p class="mb-0">Please try again later or contact support if the problem persists.</p>
                </div>
            </div>
        `;
    }
}

/**
 * Load and display the top rated movies
 */
async function loadTopRatedMovies() {
    const topRatedMoviesContainer = document.getElementById('topRatedMovies');
    if (!topRatedMoviesContainer) return;

    try {
        // Show loading indicator
        topRatedMoviesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading top rated movies...</span>
                </div>
                <p class="mt-2">Loading top rated movies...</p>
            </div>
        `;

        console.log('Loading top rated movies...');

        // Get top rated movies
        const movies = await Movies.getTopRatedMovies();
        console.log('Top rated movies loaded:', movies);

        // Clear loading indicator
        topRatedMoviesContainer.innerHTML = '';

        if (!movies || movies.length === 0) {
            topRatedMoviesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <p class="text-center mb-0">No top rated movies found. Rate some movies to see them here!</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render movie cards
        movies.forEach(movie => {
            console.log('Rendering movie card for:', movie.title);
            const movieCard = Movies.renderMovieCard(movie);
            if (movieCard) {
                topRatedMoviesContainer.appendChild(movieCard);
            }
        });
    } catch (error) {
        console.error('Error loading top rated movies:', error);
        topRatedMoviesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5 class="alert-heading">Error Loading Top Rated Movies</h5>
                    <p>${error.message || 'An unknown error occurred'}</p>
                    <hr>
                    <p class="mb-0">Please try again later or contact support if the problem persists.</p>
                </div>
            </div>
        `;
    }
}

/**
 * Show API connection error message
 */
function showApiError() {
    const latestMoviesContainer = document.getElementById('latestMovies');
    const topRatedMoviesContainer = document.getElementById('topRatedMovies');

    const errorHTML = `
        <div class="col-12">
            <div class="alert alert-danger">
                <h4 class="alert-heading">API Connection Error</h4>
                <p>Unable to connect to the Cinema Vault API. Please make sure the API is running and accessible at:</p>
                <p class="mb-0"><code>${CONFIG.API_BASE_URL}</code></p>
                <hr>
                <p class="mb-0">Check the browser console for more details.</p>
            </div>
        </div>
    `;

    if (latestMoviesContainer) {
        latestMoviesContainer.innerHTML = errorHTML;
    }

    if (topRatedMoviesContainer) {
        topRatedMoviesContainer.innerHTML = errorHTML;
    }
}
