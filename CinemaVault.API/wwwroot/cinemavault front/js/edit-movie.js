/**
 * Edit Movie page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Enable debug mode
    if (typeof Debug !== 'undefined') {
        Debug.enable();
    }

    // Redirect if not logged in or not admin
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize search form
    initSearchForm();

    // Update UI based on authentication status
    Auth.updateAuthUI();

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        // Redirect to manage movies if no movie ID is provided
        window.location.href = 'manage-movies.html';
        return;
    }

    // Set cancel button href
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.href = `movie-details.html?id=${movieId}`;
    }

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

        // Load genres for checkboxes
        await loadGenres(movieId);

        // Initialize form submission
        initEditMovieForm(movieId);
    } catch (error) {
        console.error('API connection error:', error);
        showError('Unable to connect to the API. Please try again later.');
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
 * Load movie details and populate the form
 * @param {number} movieId - The movie ID
 */
async function loadMovieDetails(movieId) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('d-none');

    try {
        // Get movie details
        const movie = await Movies.getMovieById(movieId);

        if (!movie) {
            showError('Movie not found.');
            return;
        }

        // Populate form fields
        document.getElementById('movieId').value = movie.id;
        document.getElementById('title').value = movie.title;
        document.getElementById('description').value = movie.description;

        // Format release date for input field (YYYY-MM-DD)
        const releaseDate = new Date(movie.releaseDate);
        const formattedDate = releaseDate.toISOString().split('T')[0];
        document.getElementById('releaseDate').value = formattedDate;

        document.getElementById('directorName').value = movie.directorName || '';
        document.getElementById('trailerUrl').value = movie.trailerUrl || '';

        // Set current poster
        const currentPoster = document.getElementById('currentPoster');
        if (currentPoster) {
            currentPoster.src = CONFIG.getFullPosterUrl(movie.posterUrl);
            currentPoster.alt = `${movie.title} Poster`;
        }

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Error loading movie details. Please try again later.');

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.add('d-none');
    }
}

/**
 * Load genres and create checkboxes
 * @param {number} movieId - The movie ID to check selected genres
 */
async function loadGenres(movieId) {
    const genreCheckboxes = document.getElementById('genreCheckboxes');
    if (!genreCheckboxes) return;

    try {
        // Get all genres
        const genres = await API.get('Genre');

        // Get movie details to check selected genres
        const movie = await Movies.getMovieById(movieId);

        // Clear loading indicator
        genreCheckboxes.innerHTML = '';

        if (genres.length === 0) {
            genreCheckboxes.innerHTML = '<div class="col-12"><p class="text-danger">No genres found. Please add genres first.</p></div>';
            return;
        }

        // Create checkboxes for each genre
        genres.forEach(genre => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-2';

            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.id = `genre-${genre.id}`;
            checkbox.name = 'genreIds';
            checkbox.value = genre.id;

            // Check if this genre is selected for the movie
            if (movie && movie.genres && movie.genres.some(g => g.id === genre.id)) {
                checkbox.checked = true;
            }

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `genre-${genre.id}`;
            label.textContent = genre.name;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            col.appendChild(checkboxDiv);
            genreCheckboxes.appendChild(col);
        });
    } catch (error) {
        console.error('Error loading genres:', error);
        genreCheckboxes.innerHTML = '<div class="col-12"><p class="text-danger">Error loading genres. Please try again later.</p></div>';
    }
}

/**
 * Initialize the edit movie form
 * @param {number} movieId - The movie ID
 */
function initEditMovieForm(movieId) {
    const editMovieForm = document.getElementById('editMovieForm');
    const editMovieError = document.getElementById('editMovieError');
    const editMovieSuccess = document.getElementById('editMovieSuccess');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!editMovieForm) return;

    editMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous messages
        if (editMovieError) editMovieError.classList.add('d-none');
        if (editMovieSuccess) editMovieSuccess.classList.add('d-none');

        // Show loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('d-none');

        try {
            // Get form data
            const formData = new FormData(editMovieForm);

            // Get selected genre IDs
            const genreCheckboxes = document.querySelectorAll('input[name="genreIds"]:checked');
            if (genreCheckboxes.length === 0) {
                showError('Please select at least one genre');
                return;
            }

            // Add selected genre IDs to form data
            genreCheckboxes.forEach(checkbox => {
                formData.append('GenreIds', checkbox.value);
            });

            // Update movie
            const result = await updateMovie(movieId, formData);

            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.classList.add('d-none');

            if (result.success) {
                // Show success message
                showSuccess('Movie updated successfully!');

                // Redirect to movie details page after a delay
                setTimeout(() => {
                    window.location.href = `movie-details.html?id=${movieId}`;
                }, 2000);
            } else {
                // Show error message
                showError(result.error || 'Failed to update movie. Please try again.');
            }
        } catch (error) {
            console.error('Error updating movie:', error);

            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.classList.add('d-none');

            // Show error message
            showError(error.message || 'An unexpected error occurred. Please try again.');
        }
    });
}

/**
 * Update a movie
 * @param {number} movieId - The movie ID
 * @param {FormData} formData - The form data
 * @returns {Promise<object>} - The result
 */
async function updateMovie(movieId, formData) {
    try {
        // Try different API endpoints
        const endpoints = [
            'Movie',
            'Movies',
            `Movie/${movieId}`,
            `Movies/${movieId}`,
            `Movie/update/${movieId}`,
            `Movies/update/${movieId}`,
            `Movie/Edit/${movieId}`,
            `Movies/Edit/${movieId}`
        ];

        // Log the form data for debugging
        console.log('Form data entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        // Rename form fields to match what the API expects
        const newFormData = new FormData();

        // Map form fields to API expected fields
        newFormData.append('Id', movieId);
        newFormData.append('Title', formData.get('title') || '');
        newFormData.append('Description', formData.get('description') || '');
        newFormData.append('TrailerUrl', formData.get('trailerUrl') || '');
        newFormData.append('DirectorName', formData.get('directorName') || '');

        // Add poster image if provided
        const posterFile = formData.get('posterFile');
        if (posterFile && posterFile.size > 0) {
            newFormData.append('PosterImg', posterFile);
        }

        // Add genre IDs if present
        const genreIds = formData.getAll('genreIds');
        genreIds.forEach(id => {
            newFormData.append('GenreIds', id);
        });

        // Try each endpoint
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);

                const token = Auth.getToken();
                if (!token) {
                    return { success: false, error: 'Authentication required' };
                }

                const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: newFormData
                });

                if (response.ok) {
                    console.log(`Endpoint ${endpoint} worked!`);
                    return { success: true, movieId };
                } else {
                    // Try to get more detailed error information
                    let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                    try {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const errorData = await response.json();
                            errorMessage = errorData.error || errorData.message || errorMessage;
                        } else {
                            const textError = await response.text();
                            if (textError) errorMessage = textError;
                        }
                    } catch (e) {
                        console.warn('Could not parse error response:', e);
                    }
                    console.warn(`Endpoint ${endpoint} failed:`, errorMessage);
                }
            } catch (endpointError) {
                console.warn(`Endpoint ${endpoint} error:`, endpointError);
            }
        }

        // If all endpoints fail, throw an error
        throw new Error('All endpoints failed');
    } catch (error) {
        console.error('Error updating movie:', error);
        return { success: false, error: error.message || 'Failed to update movie' };
    }
}

/**
 * Show an error message
 * @param {string} message - The error message
 */
function showError(message) {
    const editMovieError = document.getElementById('editMovieError');
    if (editMovieError) {
        editMovieError.textContent = message;
        editMovieError.classList.remove('d-none');

        // Scroll to error message
        editMovieError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show a success message
 * @param {string} message - The success message
 */
function showSuccess(message) {
    const editMovieSuccess = document.getElementById('editMovieSuccess');
    if (editMovieSuccess) {
        editMovieSuccess.textContent = message;
        editMovieSuccess.classList.remove('d-none');

        // Scroll to success message
        editMovieSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
