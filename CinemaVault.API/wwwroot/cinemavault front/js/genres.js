/**
 * Genres page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize search form
    initSearchForm();

    // Load genres
    await loadGenres();

    // Check for genre ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const genreId = urlParams.get('id');

    if (genreId) {
        // Load movies for the selected genre
        await loadGenreMovies(genreId);
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
 * Load and display all genres
 */
async function loadGenres() {
    const genresContainer = document.getElementById('genresList');
    if (!genresContainer) return;

    try {
        // Show loading indicator
        genresContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading genres...</span>
                </div>
                <p class="mt-2">Loading genres...</p>
            </div>
        `;

        console.log('Loading genres...');

        // Try to get genres from API
        let genres = [];
        try {
            genres = await API.get('Genre');
            console.log('Genres loaded from API:', genres);
        } catch (apiError) {
            console.error('Error loading genres from API:', apiError);
        }

        // Clear loading indicator
        genresContainer.innerHTML = '';

        if (!genres || genres.length === 0) {
            genresContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <p class="text-center mb-0">No genres found.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render genre cards
        genres.forEach(genre => {
            console.log('Rendering genre card for:', genre.name);
            const genreCard = renderGenreCard(genre);
            if (genreCard) {
                genresContainer.appendChild(genreCard);
            }
        });
    } catch (error) {
        console.error('Error loading genres:', error);
        genresContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5 class="alert-heading">Error Loading Genres</h5>
                    <p>${error.message || 'An unknown error occurred'}</p>
                    <hr>
                    <p class="mb-0">Please try again later or contact support if the problem persists.</p>
                </div>
            </div>
        `;
    }
}

/**
 * Render a genre card
 * @param {object} genre - The genre data
 * @returns {HTMLElement} - The genre card element
 */
function renderGenreCard(genre) {
    const template = document.getElementById('genreCardTemplate');
    if (!template) return null;

    const clone = template.content.cloneNode(true);

    // Set genre data
    const genreName = clone.querySelector('.genre-name');
    const viewGenreBtn = clone.querySelector('.view-genre-btn');

    if (genreName) genreName.textContent = genre.name;

    if (viewGenreBtn) {
        viewGenreBtn.addEventListener('click', () => {
            // Update URL without reloading page
            const url = new URL(window.location);
            url.searchParams.set('id', genre.id);
            window.history.pushState({}, '', url);

            // Load movies for this genre
            loadGenreMovies(genre.id);
        });
    }

    return clone;
}

/**
 * Get mock genres data (for fallback when API is unavailable)
 * @returns {Array} - The mock genres data
 */
function getMockGenres() {
    console.log('Using mock genres data');
    return [
        { id: 1, name: "Drama" },
        { id: 2, name: "Crime" },
        { id: 3, name: "Action" },
        { id: 4, name: "Adventure" },
        { id: 5, name: "Sci-Fi" },
        { id: 6, name: "Comedy" },
        { id: 7, name: "History" },
        { id: 8, name: "War" },
        { id: 9, name: "Fantasy" },
        { id: 10, name: "Animation" },
        { id: 11, name: "Thriller" },
        { id: 12, name: "Horror" },
        { id: 13, name: "Romance" },
        { id: 14, name: "Biography" },
        { id: 15, name: "Documentary" }
    ];
}

/**
 * Get mock movies for a specific genre (for fallback when API is unavailable)
 * @param {number} genreId - The genre ID
 * @returns {Array} - The mock movies data
 */
function getMockMoviesByGenre(genreId) {
    console.log('Using mock movies data for genre:', genreId);

    // Get all mock movies
    const allMockMovies = [
        ...Movies.getMockTopRatedMovies(20),
        ...Movies.getMockLatestMovies(20)
    ];

    // Filter movies by genre
    return allMockMovies.filter(movie =>
        movie.genres &&
        movie.genres.some(genre => genre.id === parseInt(genreId))
    );
}

/**
 * Load and display movies for a specific genre
 * @param {number} genreId - The genre ID
 */
async function loadGenreMovies(genreId) {
    const selectedGenreSection = document.getElementById('selectedGenreSection');
    const selectedGenreName = document.getElementById('selectedGenreName');
    const genreMoviesContainer = document.getElementById('genreMovies');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!selectedGenreSection || !selectedGenreName || !genreMoviesContainer) return;

    try {
        // Show loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('d-none');

        // Get genre details
        let genre = null;
        try {
            const genres = await API.get('Genre');
            genre = genres.find(g => g.id == genreId);
        } catch (apiError) {
            console.error('Error loading genres from API:', apiError);
            // Use mock data as fallback
            const mockGenres = getMockGenres();
            genre = mockGenres.find(g => g.id == genreId);
        }

        if (!genre) {
            // If genre is still not found, create a generic one
            genre = { id: genreId, name: `Genre ${genreId}` };
            console.warn('Genre not found, using generic name');
        }

        // Set genre name
        selectedGenreName.textContent = `${genre.name} Movies`;

        // Show selected genre section
        selectedGenreSection.classList.remove('d-none');

        // Clear previous movies and show loading
        genreMoviesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading movies...</span>
                </div>
                <p class="mt-2">Loading ${genre.name} movies...</p>
            </div>
        `;

        // Get movies for this genre
        let movies = [];
        try {
            movies = await Movies.getMoviesByGenre(genreId);
            console.log(`Loaded ${movies.length} movies for genre ${genre.name}`);
        } catch (moviesError) {
            console.error(`Error loading movies for genre ${genreId}:`, moviesError);
            // Use mock data as fallback
            movies = getMockMoviesByGenre(genreId);
            console.log(`Using ${movies.length} mock movies for genre ${genre.name}`);
        }

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');

        // Clear loading indicator
        genreMoviesContainer.innerHTML = '';

        if (!movies || movies.length === 0) {
            genreMoviesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <p class="text-center mb-0">No movies found in the ${genre.name} genre.</p>
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
                genreMoviesContainer.appendChild(movieCard);
            }
        });

        // Scroll to the selected genre section
        selectedGenreSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error(`Error loading movies for genre ${genreId}:`, error);

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');

        // Show error message
        if (genreMoviesContainer) {
            genreMoviesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5 class="alert-heading">Error Loading Movies</h5>
                        <p>${error.message || 'An unknown error occurred'}</p>
                        <hr>
                        <p class="mb-0">Please try again later or contact support if the problem persists.</p>
                    </div>
                </div>
            `;
        }
    }
}
