/**
 * Saved movies page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if not logged in
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize search form
    initSearchForm();

    // Load saved movies
    await loadSavedMovies();
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
 * Load and display saved movies
 */
async function loadSavedMovies() {
    const savedMoviesContainer = document.getElementById('savedMovies');
    const noSavedMoviesMessage = document.getElementById('noSavedMovies');

    if (!savedMoviesContainer) return;

    try {
        // Show loading indicator
        savedMoviesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Get saved movies
        const savedMovies = await Movies.getSavedMovies();

        // Clear loading indicator
        savedMoviesContainer.innerHTML = '';

        if (savedMovies.length === 0) {
            // Show no saved movies message
            if (noSavedMoviesMessage) {
                noSavedMoviesMessage.classList.remove('d-none');
            }
            return;
        }

        // Hide no saved movies message
        if (noSavedMoviesMessage) {
            noSavedMoviesMessage.classList.add('d-none');
        }

        // Create movie cards for each saved movie
        savedMovies.forEach(movie => {
            // Convert saved movie to movie format
            const movieData = {
                id: movie.movieId,
                title: movie.movieTitle,
                posterUrl: movie.moviePoster, // This will be processed by renderMovieCard using CONFIG.getFullPosterUrl
                description: movie.movieDesctription,
                ratingAvg: movie.movieRating,
                isSaved: true,
                genres: movie.genres || []
            };

            const movieCard = Movies.renderMovieCard(movieData);
            if (movieCard) {
                savedMoviesContainer.appendChild(movieCard);

                // Add event listener to save button to handle unsave
                const saveBtn = movieCard.querySelector('.save-movie-btn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', async () => {
                        try {
                            await Movies.unsaveMovie(movie.movieId);

                            // Remove the movie card with animation
                            const cardElement = saveBtn.closest('.col-md-4');
                            if (cardElement) {
                                cardElement.style.transition = 'opacity 0.5s ease';
                                cardElement.style.opacity = '0';

                                setTimeout(() => {
                                    cardElement.remove();

                                    // Check if there are no more saved movies
                                    if (savedMoviesContainer.children.length === 0) {
                                        if (noSavedMoviesMessage) {
                                            noSavedMoviesMessage.classList.remove('d-none');
                                        }
                                    }
                                }, 500);
                            }

                            // Show notification
                            showNotification('Movie removed from your collection');
                        } catch (error) {
                            console.error('Error removing saved movie:', error);
                            showNotification('Error removing movie from your collection', 'error');
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.error('Error loading saved movies:', error);
        savedMoviesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Error loading your saved movies. Please try again later.
                </div>
            </div>
        `;
    }
}

/**
 * Show a notification toast
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success or error)
 */
function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastTitle || !toastMessage) return;

    // Set toast content
    toastTitle.textContent = type === 'success' ? 'Success' : 'Error';
    toastMessage.textContent = message;

    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

