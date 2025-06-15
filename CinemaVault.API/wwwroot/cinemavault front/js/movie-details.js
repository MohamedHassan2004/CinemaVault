/**
 * Movie details page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Enable debug mode
    if (typeof Debug !== 'undefined') {
        Debug.enable();
    }

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        // Redirect to home if no movie ID is provided
        window.location.href = 'index.html';
        return;
    }

    // Initialize search form
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

        // Load movie details
        await loadMovieDetails(movieId);

        // Initialize rating functionality
        initRating(movieId);
    } catch (error) {
        console.error('API connection error:', error);
        const movieDetailsContainer = document.getElementById('movieDetails');
        if (movieDetailsContainer) {
            movieDetailsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">API Connection Error</h4>
                    <p>Unable to connect to the Cinema Vault API. Please make sure the API is running and accessible at:</p>
                    <p class="mb-0"><code>${CONFIG.API_BASE_URL}</code></p>
                    <hr>
                    <p class="mb-0">Check the browser console for more details.</p>
                </div>
            `;
        }
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
 * Load and display movie details
 * @param {number} movieId - The movie ID
 */
async function loadMovieDetails(movieId) {
    const movieDetailsContainer = document.getElementById('movieDetails');
    if (!movieDetailsContainer) return;

    try {
        // Get movie details
        // Ensure Movies is imported or defined
        const movie = await Movies.getMovieById(movieId);
        console.log('Movie details:', movie);

        if (!movie) {
            movieDetailsContainer.innerHTML = '<div class="alert alert-danger">Movie not found.</div>';
            return;
        }

        // Ensure movie has all required properties
        if (!movie.genres) {
            movie.genres = [];
            console.warn('Movie has no genres property, initializing as empty array');
        }

        if (!movie.ratingAvg && movie.ratingAvg !== 0) {
            movie.ratingAvg = 0;
            console.warn('Movie has no ratingAvg property, initializing as 0');
        }

        // Update page title
        document.title = `${movie.title} - Cinema Vault`;

        // Check if user is admin
        const isAdmin = Auth.isAdmin();

        // Create movie details HTML
        const detailsHTML = `
            <div class="row">
                <div class="col-md-4 mb-4">
                    <img src="${CONFIG.getFullPosterUrl(movie.posterUrl)}" alt="${movie.title} Poster" class="img-fluid rounded movie-detail-poster">
                    <div class="mt-3">
                        <!-- User Controls - Save Button -->
                        ${!isAdmin ? `
                        <button id="saveMovieBtn" class="btn btn-outline-primary w-100 user-control ${movie.isSaved ? 'active' : ''}">
                            <i class="${movie.isSaved ? 'fas' : 'far'} fa-bookmark me-2"></i>
                            ${movie.isSaved ? 'Saved to My Movies' : 'Save to My Movies'}
                        </button>
                        ` : ''}

                        <!-- Admin Controls -->
                        ${isAdmin ? `
                        <div class="admin-controls">
                            <div class="d-grid gap-2">
                                <a href="edit-movie.html?id=${movie.id}" class="btn btn-warning admin-control">
                                    <i class="fas fa-edit me-2"></i>Edit Movie
                                </a>
                                <button id="deleteMovieBtn" class="btn btn-danger admin-control">
                                    <i class="fas fa-trash me-2"></i>Delete Movie
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="col-md-8">
                    <h1 class="mb-3">${movie.title}</h1>
                    <div class="d-flex align-items-center mb-3">
                        <div class="me-3">
                            <span class="badge bg-warning text-dark fs-5">
                                <i class="fas fa-star me-1"></i> ${movie.ratingAvg.toFixed(1)}
                            </span>
                        </div>
                        <div>
                            <p class="text-muted mb-0">Released: ${new Date(movie.releaseDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        ${movie.genres && movie.genres.length > 0
                            ? movie.genres.map(genre => `<span class="badge bg-secondary me-1">${genre.name}</span>`).join('')
                            : '<span class="text-muted">No genres available</span>'}
                    </div>
                    <div class="mb-4">
                        <h5>Director</h5>
                        <p>${movie.directorName || 'Unknown'}</p>
                    </div>
                    <div class="mb-4">
                        <h5>Description</h5>
                        <p>${movie.description || 'No description available.'}</p>
                    </div>
                    ${movie.trailerUrl ? `
                    <div class="mb-4">
                        <h5>Trailer</h5>
                        <div class="trailer-container">
                            <iframe width="560" height="315" src="${getEmbedUrl(movie.trailerUrl)}"
                                title="${movie.title} Trailer" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen></iframe>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Update container with movie details
        movieDetailsContainer.innerHTML = detailsHTML;

        // Initialize save button functionality if user is not admin
        if (!isAdmin) {
            initSaveButton(movie);
        } else {
            // Initialize delete button functionality for admins
            initDeleteButton(movie);
        }

        // Show rating section if user is logged in and not admin
        if (Auth.isLoggedIn() && !isAdmin) {
            const ratingSection = document.getElementById('ratingSection');
            if (ratingSection) {
                ratingSection.classList.remove('d-none');
                document.getElementById('movieId').value = movie.id;
            }
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        movieDetailsContainer.innerHTML = '<div class="alert alert-danger">Error loading movie details. Please try again later.</div>';
    }
}

/**
 * Initialize the save button functionality
 * @param {object} movie - The movie data
 */
function initSaveButton(movie) {
    const saveButton = document.getElementById('saveMovieBtn');
    if (!saveButton) return;

    saveButton.addEventListener('click', async () => {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            if (movie.isSaved) {
                // Unsave the movie
                await Movies.unsaveMovie(movie.id);
                saveButton.innerHTML = '<i class="far fa-bookmark me-2"></i>Save to My Movies';
                saveButton.classList.remove('active');
                movie.isSaved = false;
                showNotification('Movie removed from your collection');
            } else {
                // Save the movie
                await Movies.saveMovie(movie.id);
                saveButton.innerHTML = '<i class="fas fa-bookmark me-2"></i>Saved to My Movies';
                saveButton.classList.add('active');
                movie.isSaved = true;
                showNotification('Movie saved to your collection');
            }
        } catch (error) {
            console.error('Error toggling saved state:', error);
            showNotification('Error updating your collection', 'error');
        }
    });
}

/**
 * Initialize the rating functionality
 * @param {number} movieId - The movie ID
 */
function initRating(movieId) {
    const ratingForm = document.getElementById('ratingForm');
    const ratingButtons = document.querySelectorAll('.rating-btn');
    const ratingValue = document.getElementById('ratingValue');

    if (!ratingForm || !ratingButtons.length || !ratingValue) return;

    // Add click event to rating buttons
    ratingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            ratingButtons.forEach(btn => btn.classList.remove('active', 'btn-warning'));

            // Add active class to clicked button
            button.classList.add('active', 'btn-warning');

            // Set rating value
            ratingValue.value = button.dataset.rating;
        });
    });

    // Handle form submission
    ratingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const rating = parseInt(ratingValue.value);
        if (!rating || rating < 1 || rating > 10) {
            showNotification('Please select a rating between 1 and 10', 'error');
            return;
        }

        try {
            await Movies.rateMovie(movieId, rating);
            showNotification('Rating submitted successfully');

            // Reload the page to show updated rating
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error submitting rating:', error);
            showNotification('Error submitting rating', 'error');
        }
    });
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

/**
 * Initialize the delete button functionality for admins
 * @param {object} movie - The movie data
 */
function initDeleteButton(movie) {
    const deleteButton = document.getElementById('deleteMovieBtn');
    if (!deleteButton) return;

    deleteButton.addEventListener('click', async () => {
        if (!Auth.isAdmin()) {
            showNotification('Admin privileges required', 'error');
            return;
        }

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${movie.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await Movies.deleteMovie(movie.id);

            if (result.success) {
                showNotification(`Movie "${movie.title}" has been deleted successfully`);

                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showNotification(`Failed to delete movie: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            showNotification(`Error deleting movie: ${error.message}`, 'error');
        }
    });
}

/**
 * Convert a YouTube URL to an embed URL
 * @param {string} url - The YouTube URL
 * @returns {string} - The embed URL
 */
function getEmbedUrl(url) {
    if (!url) return '';

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }

    return url;
}

