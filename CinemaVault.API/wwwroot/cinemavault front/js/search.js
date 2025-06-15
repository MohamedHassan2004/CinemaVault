/**
 * Search page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize search forms
    initSearchForms();

    // Update UI based on authentication status
    Auth.updateAuthUI();

    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        // Set search input value
        const searchInput = document.getElementById('searchPageInput');
        if (searchInput) {
            searchInput.value = searchQuery;
        }

        // Perform search
        await performSearch(searchQuery);
    }
});

/**
 * Initialize the search forms
 */
function initSearchForms() {
    // Main search form in navbar
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

    // Search form on search page
    const searchPageForm = document.getElementById('searchPageForm');
    if (searchPageForm) {
        searchPageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchPageInput');
            const searchTerm = searchInput.value.trim();

            if (searchTerm) {
                // Update URL without reloading page
                const url = new URL(window.location);
                url.searchParams.set('q', searchTerm);
                window.history.pushState({}, '', url);

                // Perform search
                await performSearch(searchTerm);
            }
        });
    }
}

/**
 * Perform a search and display results
 * @param {string} searchTerm - The search term
 */
async function performSearch(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!searchResults) return;

    try {
        // Show loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('d-none');

        // Show searching message
        searchResults.innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Searching for "${searchTerm}"...</p>
            </div>
        `;

        console.log('Performing search for term:', searchTerm);

        // Perform search
        const movies = await Movies.searchMovies(searchTerm);
        console.log(`Search complete. Found ${movies.length} results`);

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');

        if (!movies || movies.length === 0) {
            // Show no results message
            searchResults.innerHTML = '';
            if (noResults) {
                noResults.classList.remove('d-none');
                noResults.innerHTML = `
                    <div class="alert alert-info">
                        <h5 class="alert-heading">No Results Found</h5>
                        <p>No movies found matching "${searchTerm}".</p>
                        <hr>
                        <p class="mb-0">Try a different search term or browse by genre.</p>
                    </div>
                `;
            }
            return;
        }

        // Hide no results message
        if (noResults) noResults.classList.add('d-none');

        // Create results container
        searchResults.innerHTML = `
            <h3>Search Results for "${searchTerm}"</h3>
            <p>Found ${movies.length} movie${movies.length !== 1 ? 's' : ''}</p>
            <div class="row" id="movieResults"></div>
        `;

        const movieResults = document.getElementById('movieResults');
        if (!movieResults) return;

        // Render movie cards
        movies.forEach(movie => {
            console.log('Rendering search result:', movie.title);
            const movieCard = Movies.renderMovieCard(movie);
            if (movieCard) {
                movieResults.appendChild(movieCard);
            }
        });

        // Add a note if using mock data
        if (movies.some(m => m.id >= 100)) {
            searchResults.insertAdjacentHTML('beforeend', `
                <div class="alert alert-warning mt-3">
                    <p class="mb-0"><small><i class="fas fa-info-circle me-1"></i> Note: Some results are from sample data as the API connection is currently unavailable.</small></p>
                </div>
            `);
        }
    } catch (error) {
        console.error('Error searching movies:', error);

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');

        // Show error message
        searchResults.innerHTML = `
            <div class="alert alert-danger">
                <h5 class="alert-heading">Search Error</h5>
                <p>${error.message || 'Error searching for movies'}</p>
                <hr>
                <p class="mb-0">Please try again later or contact support if the problem persists.</p>
            </div>
        `;
    }
}
