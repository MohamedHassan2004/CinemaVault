/**
 * Add Movie page script for Cinema Vault
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

        // Load genres for checkboxes
        await loadGenres();

        // Initialize form submission
        initAddMovieForm();
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
 * Load genres and create checkboxes
 */
async function loadGenres() {
    const genreCheckboxes = document.getElementById('genreCheckboxes');
    if (!genreCheckboxes) return;

    try {
        // Get all genres
        const genres = await API.get('Genre');

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
 * Show an error message
 * @param {string} message - The error message
 */
function showError(message) {
    const addMovieError = document.getElementById('addMovieError');
    if (addMovieError) {
        addMovieError.textContent = message;
        addMovieError.classList.remove('d-none');

        // Scroll to error message
        addMovieError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show a success message
 * @param {string} message - The success message
 */
function showSuccess(message) {
    const addMovieSuccess = document.getElementById('addMovieSuccess');
    if (addMovieSuccess) {
        addMovieSuccess.textContent = message;
        addMovieSuccess.classList.remove('d-none');

        // Scroll to success message
        addMovieSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Add a new movie
 * @param {FormData} formData - The movie form data
 * @returns {Promise<object>} - The result
 */
async function addMovie(formData) {
    try {
        // Try different API endpoints
        const endpoints = [
            'Movie',
            'Movies',
            'Movie/add',
            'Movies/add',
            'Movie/create',
            'Movies/create'
        ];

        // Try each endpoint
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);

                const token = Auth.getToken();
                if (!token) {
                    return { success: false, error: 'Authentication required' };
                }

                // Log the form data for debugging
                console.log('Form data entries:');
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                // Rename form fields to match what the API expects
                const newFormData = new FormData();

                // Map form fields to API expected fields
                const posterFile = formData.get('posterFile');
                if (posterFile) {
                    newFormData.append('PosterImg', posterFile);
                }

                newFormData.append('Title', formData.get('title') || '');
                newFormData.append('Description', formData.get('description') || '');
                newFormData.append('TrailerUrl', formData.get('trailerUrl') || '');
                newFormData.append('DirectorName', formData.get('directorName') || '');

                // Add genre IDs if present
                const genreIds = formData.getAll('genreIds');
                genreIds.forEach(id => {
                    newFormData.append('GenreIds', id);
                });

                const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: newFormData
                });

                if (response.ok) {
                    console.log(`Endpoint ${endpoint} worked!`);
                    let data = {};
                    try {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            data = await response.json();
                        }
                    } catch (e) {
                        console.warn('Could not parse JSON response:', e);
                    }

                    return {
                        success: true,
                        movieId: data.id || data.movieId || null
                    };
                } else {
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
        console.error('Error adding movie:', error);
        return { success: false, error: error.message || 'Failed to add movie' };
    }
}

function initAddMovieForm() {
    const addMovieForm = document.getElementById('addMovieForm');
    const addMovieError = document.getElementById('addMovieError');
    const addMovieSuccess = document.getElementById('addMovieSuccess');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!addMovieForm) return;

    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous messages
        if (addMovieError) addMovieError.classList.add('d-none');
        if (addMovieSuccess) addMovieSuccess.classList.add('d-none');

        // Show loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('d-none');

        try {
            // Get form data
            const formData = new FormData(addMovieForm);

            // Get selected genre IDs
            const genreCheckboxes = document.querySelectorAll('input[name="genreIds"]:checked');
            if (genreCheckboxes.length === 0) {
                showError('Please select at least one genre');
                if (loadingOverlay) loadingOverlay.classList.add('d-none');
                return;
            }

            // Add selected genre IDs to form data
            genreCheckboxes.forEach(checkbox => {
                formData.append('GenreIds', checkbox.value);
            });

            // Add movie using direct fetch to try different endpoints
            const result = await addMovie(formData);

            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.classList.add('d-none');

            if (result.success) {
                // Show success message
                showSuccess('Movie added successfully!');

                // Reset form
                addMovieForm.reset();

                // Redirect to movie details page after a delay
                if (result.movieId) {
                    setTimeout(() => {
                        window.location.href = `movie-details.html?id=${result.movieId}`;
                    }, 2000);
                } else {
                    // If no movie ID is returned, redirect to home page
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }
            } else {
                // Show error message
                showError(result.error || 'Failed to add movie. Please try again.');
            }
        } catch (error) {
            console.error('Error adding movie:', error);

            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.classList.add('d-none');

            // Show error message
            showError(error.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
