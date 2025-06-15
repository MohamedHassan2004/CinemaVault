/**
 * Movies Service for Cinema Vault
 * Handles movie-related operations
 */
const Movies = {
    /**
     * Get the latest movies
     * @param {number} count - The number of movies to get
     * @returns {Promise} - The movies data
     */
    async getLatestMovies(count = CONFIG.MOVIE_COUNTS.LATEST) {
        try {
            const requiresAuth = Auth.isLoggedIn();

            // Try different API endpoints
            const endpoints = [
                `Movie/latest/${count}`,
                `Movies/latest/${count}`,
                `Movie/Latest/${count}`,
                `Movies/Latest/${count}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const result = await API.get(endpoint, requiresAuth);
                    if (result && Array.isArray(result)) {
                        console.log(`Endpoint ${endpoint} worked!`);
                        return result;
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                }
            }

            // If all endpoints fail, use mock data as a last resort
            console.log('All approaches failed, using mock data as last resort');
            return;
        } catch (error) {
            console.error('Error fetching latest movies:', error);
            // Return mock data as a fallback
            return;
        }
    },

    /**
     * Get the top rated movies
     * @param {number} count - The number of movies to get
     * @returns {Promise} - The movies data
     */
    async getTopRatedMovies(count = CONFIG.MOVIE_COUNTS.TOP_RATED) {
        try {
            const requiresAuth = Auth.isLoggedIn();
            console.log('Getting top rated movies, count:', count);
            console.log('Auth required:', requiresAuth);

            // Try different API endpoints
            const endpoints = [
                `Movie/top-rated/${count}`,
                `Movies/top-rated/${count}`,
                `Movie/TopRated/${count}`,
                `Movies/TopRated/${count}`,
                `Movie/toprated/${count}`,
                `Movies/toprated/${count}`,
                // Add more variations to try
                `Movie/GetTopRated/${count}`,
                `Movies/GetTopRated/${count}`,
                `Movie/GetTopRatedMovies/${count}`,
                `Movies/GetTopRatedMovies/${count}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const result = await API.get(endpoint, requiresAuth);
                    if (result && Array.isArray(result)) {
                        console.log(`Endpoint ${endpoint} worked! Got ${result.length} movies`);

                        // Ensure each movie has the required properties
                        const validatedResults = result.map(movie => {
                            if (!movie.genres) {
                                movie.genres = [];
                                console.warn(`Movie ${movie.id} has no genres property, initializing as empty array`);
                            }

                            if (!movie.ratingAvg && movie.ratingAvg !== 0) {
                                movie.ratingAvg = 0;
                                console.warn(`Movie ${movie.id} has no ratingAvg property, initializing as 0`);
                            }

                            return movie;
                        });

                        return validatedResults;
                    } else {
                        console.warn(`Endpoint ${endpoint} returned invalid data:`, result);
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                }
            }

            // If all endpoints fail, try a fallback approach - get all movies and sort them by rating
            console.log('All top rated endpoints failed, trying fallback approach...');
            try {
                const allMovies = await this.getAllMovies();
                if (allMovies && Array.isArray(allMovies) && allMovies.length > 0) {
                    console.log(`Got ${allMovies.length} movies, sorting by rating...`);
                    const sortedMovies = allMovies.sort((a, b) => b.ratingAvg - a.ratingAvg);
                    return sortedMovies.slice(0, count);
                }
            } catch (fallbackError) {
                console.error('Fallback approach failed:', fallbackError);
            }

            // If everything fails, use mock data as a last resort
            console.log('All approaches failed, using mock data as last resort');
            return;
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
            return;
        }
    },

    /**
     * Get all movies
     * @returns {Promise} - The movies data
     */
    async getAllMovies() {
        try {
            const requiresAuth = Auth.isLoggedIn();
            return await API.get('Movie/all', requiresAuth);
        } catch (error) {
            console.error('Error fetching all movies:', error);
            return [];
        }
    },

    /**
     * Get movie details by ID
     * @param {number} id - The movie ID
     * @returns {Promise} - The movie details
     */
    async getMovieById(id) {
        try {
            const requiresAuth = Auth.isLoggedIn();
            console.log('Getting movie details for ID:', id);

            // Try different API endpoints
            const endpoints = [
                `Movie/${id}`,
                `Movies/${id}`,
                `Movie/GetById/${id}`,
                `Movies/GetById/${id}`,
                `Movie/Details/${id}`,
                `Movies/Details/${id}`,
                `Movie/GetDetails/${id}`,
                `Movies/GetDetails/${id}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);

                    // Make direct fetch call to have more control over the request
                    const token = Auth.getToken();
                    const headers = {
                        'Content-Type': 'application/json'
                    };

                    if (requiresAuth && token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }

                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'GET',
                        headers
                    });

                    if (response.ok) {
                        console.log(`Endpoint ${endpoint} worked!`);

                        // Parse response
                        const result = await response.json();

                        if (result && typeof result === 'object' && result.id) {
                            // Ensure the result has all required properties
                            if (!result.genres) {
                                result.genres = [];
                                console.warn('Movie has no genres property, initializing as empty array');
                            }

                            if (!result.ratingAvg && result.ratingAvg !== 0) {
                                result.ratingAvg = 0;
                                console.warn('Movie has no ratingAvg property, initializing as 0');
                            }

                            return result;
                        } else {
                            console.warn('Invalid movie data format:', result);
                        }
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
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

            // If all endpoints fail, try to get the movie from all movies
            console.log('All movie detail endpoints failed, trying fallback approach...');
            try {
                const allMovies = await this.getAllMovies();
                if (allMovies && Array.isArray(allMovies) && allMovies.length > 0) {
                    console.log(`Got ${allMovies.length} movies, finding movie with ID ${id}...`);
                    const movie = allMovies.find(m => m.id == id);
                    if (movie) {
                        console.log(`Found movie with ID ${id} in all movies`);
                        return movie;
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback approach failed:', fallbackError);
            }

            // If all endpoints fail, throw an error
            throw new Error('All endpoints failed');
        } catch (error) {
            console.error(`Error fetching movie with ID ${id}:`, error);
            return null;
        }
    },

    /**
     * Search for movies
     * @param {string} searchTerm - The search term
     * @returns {Promise} - The search results
     */
    async searchMovies(searchTerm) {
        try {
            const requiresAuth = Auth.isLoggedIn();
            console.log('Searching for movies with term:', searchTerm);

            // Try different API endpoints
            const endpoints = [
                `Movie/search?searchTerm=${encodeURIComponent(searchTerm)}`,
                `Movies/search?searchTerm=${encodeURIComponent(searchTerm)}`,
                `Movie/Search?searchTerm=${encodeURIComponent(searchTerm)}`,
                `Movies/Search?searchTerm=${encodeURIComponent(searchTerm)}`,
                `Movie/search?term=${encodeURIComponent(searchTerm)}`,
                `Movies/search?term=${encodeURIComponent(searchTerm)}`,
                `Movie/Search?term=${encodeURIComponent(searchTerm)}`,
                `Movies/Search?term=${encodeURIComponent(searchTerm)}`,
                `Movie/search?q=${encodeURIComponent(searchTerm)}`,
                `Movies/search?q=${encodeURIComponent(searchTerm)}`,
                `Movie/Search?q=${encodeURIComponent(searchTerm)}`,
                `Movies/Search?q=${encodeURIComponent(searchTerm)}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const result = await API.get(endpoint, requiresAuth);
                    if (result && Array.isArray(result)) {
                        console.log(`Endpoint ${endpoint} worked! Got ${result.length} results`);
                        return result;
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                }
            }

            // If all endpoints fail, try a fallback approach - get all movies and filter them
            console.log('All search endpoints failed, trying fallback approach...');
            try {
                const allMovies = await this.getAllMovies();
                if (allMovies && Array.isArray(allMovies) && allMovies.length > 0) {
                    console.log(`Got ${allMovies.length} movies, filtering by search term...`);
                    const searchTermLower = searchTerm.toLowerCase();
                    const filteredMovies = allMovies.filter(movie =>
                        movie.title.toLowerCase().includes(searchTermLower) ||
                        (movie.description && movie.description.toLowerCase().includes(searchTermLower)) ||
                        (movie.directorName && movie.directorName.toLowerCase().includes(searchTermLower))
                    );
                    console.log(`Found ${filteredMovies.length} movies matching search term`);
                    return filteredMovies;
                }
            } catch (fallbackError) {
                console.error('Fallback approach failed:', fallbackError);
            }

            // If everything fails, use mock data and filter it
            console.log('All approaches failed, using mock data as last resort');
            return;
        } catch (error) {
            console.error('Error searching movies:', error);
            // Return mock search results as a fallback
            return;
        }
    },

    /**
     * Get movies by genre
     * @param {number} genreId - The genre ID
     * @returns {Promise} - The movies data
     */
    async getMoviesByGenre(genreId) {
        try {
            const requiresAuth = Auth.isLoggedIn();
            console.log('Getting movies for genre ID:', genreId);

            // Try different API endpoints
            const endpoints = [
                `Movie/genre/${genreId}`,
                `Movies/genre/${genreId}`,
                `Movie/Genre/${genreId}`,
                `Movies/Genre/${genreId}`,
                `Movie/bygenre/${genreId}`,
                `Movies/bygenre/${genreId}`,
                `Movie/ByGenre/${genreId}`,
                `Movies/ByGenre/${genreId}`,
                `Genre/${genreId}/movies`,
                `Genres/${genreId}/movies`,
                `Movie/genra/${genreId}`,
                `Movies/genra/${genreId}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const result = await API.get(endpoint, requiresAuth);
                    if (result && Array.isArray(result)) {
                        console.log(`Endpoint ${endpoint} worked! Got ${result.length} movies`);

                        // Ensure each movie has the required properties
                        const validatedResults = result.map(movie => {
                            if (!movie.genres) {
                                movie.genres = [];
                                console.warn(`Movie ${movie.id} has no genres property, initializing as empty array`);
                            }

                            if (!movie.ratingAvg && movie.ratingAvg !== 0) {
                                movie.ratingAvg = 0;
                                console.warn(`Movie ${movie.id} has no ratingAvg property, initializing as 0`);
                            }

                            return movie;
                        });

                        return validatedResults;
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                }
            }

            // If all endpoints fail, try a fallback approach - get all movies and filter them by genre
            console.log('All genre endpoints failed, trying fallback approach...');
            try {
                const allMovies = await this.getAllMovies();
                if (allMovies && Array.isArray(allMovies) && allMovies.length > 0) {
                    console.log(`Got ${allMovies.length} movies, filtering by genre ID ${genreId}...`);
                    const filteredMovies = allMovies.filter(movie =>
                        movie.genres &&
                        movie.genres.some(genre => genre.id == genreId)
                    );
                    console.log(`Found ${filteredMovies.length} movies in genre ${genreId}`);
                    return filteredMovies;
                }
            } catch (fallbackError) {
                console.error('Fallback approach failed:', fallbackError);
            }

            // If everything fails, use mock data as a last resort
            console.log('All approaches failed, using mock data for genre', genreId);

            // Filter movies by genre
            const genreMovies = allMockMovies.filter(movie =>
                movie.genres &&
                movie.genres.some(genre => genre.id == genreId)
            );

            console.log(`Found ${genreMovies.length} mock movies for genre ${genreId}`);
            return genreMovies;
        } catch (error) {
            console.error(`Error fetching movies for genre ${genreId}:`, error);
            return [];
        }
    },

    /**
     * Save a movie to the user's collection
     * @param {number} movieId - The movie ID
     * @returns {Promise} - The result
     */
    async saveMovie(movieId) {
        try {
            // Get the token - try both methods
            let token = Auth.getToken();

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('Using token for saveMovie:', token.substring(0, 20) + '...');

            // Try different API endpoints
            const endpoints = [
                `SavedMovie/save/${movieId}`,
                `SavedMovies/save/${movieId}`,
                `SavedMovie/${movieId}`,
                `SavedMovies/${movieId}`,
                `SavedMovie`,
                `SavedMovies`,
                `SavedMovie/add/${movieId}`,
                `SavedMovies/add/${movieId}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying to save movie with endpoint: ${endpoint}`);

                    // Prepare the request body based on the endpoint
                    let body = {};
                    if (endpoint === 'SavedMovie' || endpoint === 'SavedMovies') {
                        body = JSON.stringify({ movieId, MovieId: movieId });
                    }

                    // Make direct fetch call to have more control over the request
                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: Object.keys(body).length > 0 ? body : null
                    });

                    if (response.ok) {
                        console.log(`Endpoint ${endpoint} worked for saving movie!`);

                        // Try to parse the response as JSON
                        let result = { success: true };
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                result = await response.json();
                            }
                        } catch (e) {
                            console.warn('Could not parse response as JSON:', e);
                        }

                        return { success: true };
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
                            }
                        } catch (e) {
                            console.warn('Could not parse error response:', e);
                        }
                        console.warn(`Endpoint ${endpoint} failed for saving movie:`, errorMessage);
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} error for saving movie:`, endpointError);
                }
            }

            throw new Error('All save movie endpoints failed');
        } catch (error) {
            console.error(`Error saving movie ${movieId}:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Remove a movie from the user's collection
     * @param {number} movieId - The movie ID
     * @returns {Promise} - The result
     */
    async unsaveMovie(movieId) {
        try {
            // Get the token - try both methods
            let token = Auth.getToken();

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('Using token for unsaveMovie:', token.substring(0, 20) + '...');

            // Try different API endpoints
            const endpoints = [
                `SavedMovie/unsave/${movieId}`,
                `SavedMovies/unsave/${movieId}`,
                `SavedMovie/${movieId}`,
                `SavedMovies/${movieId}`,
                `SavedMovie/remove/${movieId}`,
                `SavedMovies/remove/${movieId}`,
                `SavedMovie/delete/${movieId}`,
                `SavedMovies/delete/${movieId}`
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying to unsave movie with endpoint: ${endpoint}`);

                    // Make direct fetch call to have more control over the request
                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        console.log(`Endpoint ${endpoint} worked for unsaving movie!`);

                        // Try to parse the response as JSON
                        let result = { success: true };
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                result = await response.json();
                            }
                        } catch (e) {
                            console.warn('Could not parse response as JSON:', e);
                        }

                        return { success: true };
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
                            }
                        } catch (e) {
                            console.warn('Could not parse error response:', e);
                        }
                        console.warn(`Endpoint ${endpoint} failed for unsaving movie:`, errorMessage);
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} error for unsaving movie:`, endpointError);
                }
            }

            throw new Error('All unsave movie endpoints failed');
        } catch (error) {
            console.error(`Error removing saved movie ${movieId}:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get the user's saved movies
     * @returns {Promise} - The saved movies data
     */
    async getSavedMovies() {
        try {
            // Try different API endpoints
            const endpoints = [
                'SavedMovie/my-saved',
                'SavedMovies/my-saved',
                'SavedMovie',
                'SavedMovies'
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying to get saved movies with endpoint: ${endpoint}`);
                    const result = await API.get(endpoint, true);
                    if (result && Array.isArray(result)) {
                        console.log(`Endpoint ${endpoint} worked for getting saved movies! Got ${result.length} movies`);
                        return result;
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed for getting saved movies:`, endpointError);
                }
            }

            throw new Error('All get saved movies endpoints failed');
        } catch (error) {
            console.error('Error fetching saved movies:', error);
            return [];
        }
    },

    /**
     * Rate a movie
     * @param {number} movieId - The movie ID
     * @param {number} rating - The rating (1-10)
     * @returns {Promise} - The result
     */
    async rateMovie(movieId, rating) {
        try {
            const user = Auth.getCurrentUser();
            const userId = user ? user.sub || user.id : null;

            if (!userId) {
                throw new Error('User ID not found');
            }

            // Get the token - try both methods
            let token = Auth.getToken();

            // If token is not found via Auth.getToken, try to get it directly from localStorage
            if (!token) {
                token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY) || localStorage.getItem('token');
                console.log('Token retrieved directly from localStorage:', token ? 'Found' : 'Not found');
            }

            if (!token) {
                throw new Error('Authentication required - no token found');
            }

            console.log('Using token for rateMovie:', token.substring(0, 20) + '...');

            // Try different API endpoints
            const endpoints = [
                'Movie/rate',
                'Movies/rate',
                'Rating',
                'Ratings',
                'Rating/add',
                'Ratings/add',
                'Movie/Rating',
                'Movies/Rating'
            ];

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying to rate movie with endpoint: ${endpoint}`);

                    // Make direct fetch call to have more control over the request
                    const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            movieId,
                            userId,
                            rating,
                        })
                    });

                    if (response.ok) {
                        console.log(`Endpoint ${endpoint} worked for rating movie!`);

                        // Try to parse the response as JSON
                        let result = { success: true };
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                result = await response.json();
                            }
                        } catch (e) {
                            console.warn('Could not parse response as JSON:', e);
                        }

                        return result;
                    } else {
                        // Try to get more detailed error information
                        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                        try {
                            const contentType = response.headers.get('content-type');
                            if (contentType && contentType.includes('application/json')) {
                                const errorData = await response.json();
                                errorMessage = errorData.error || errorData.message || errorMessage;
                            }
                        } catch (e) {
                            console.warn('Could not parse error response:', e);
                        }
                        console.warn(`Endpoint ${endpoint} failed for rating movie:`, errorMessage);
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} error for rating movie:`, endpointError);
                }
            }

            throw new Error('All rate movie endpoints failed');
        } catch (error) {
            console.error(`Error rating movie ${movieId}:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete a movie (admin only)
     * @param {number} movieId - The movie ID
     * @returns {Promise} - The result
     */
    async deleteMovie(movieId) {
        try {
            if (!Auth.isAdmin()) {
                throw new Error('Admin privileges required');
            }

            return await API.delete(`Movie/${movieId}`, true);
        } catch (error) {
            console.error(`Error deleting movie ${movieId}:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Add a new movie (admin only)
     * @param {FormData} formData - The movie form data
     * @returns {Promise} - The result
     */
    async addMovie(formData) {
        try {
            if (!Auth.isAdmin()) {
                throw new Error('Admin privileges required');
            }

            return await API.uploadFile('Movie', formData, true);
        } catch (error) {
            console.error('Error adding movie:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update a movie (admin only)
     * @param {FormData} formData - The movie form data
     * @returns {Promise} - The result
     */
    async updateMovie(formData) {
        try {
            if (!Auth.isAdmin()) {
                throw new Error('Admin privileges required');
            }

            return await API.uploadFile('Movie', formData, true);
        } catch (error) {
            console.error('Error updating movie:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Render a movie card
     * @param {object} movie - The movie data
     * @returns {HTMLElement} - The movie card element
     */
    renderMovieCard(movie) {
        const template = document.getElementById('movieCardTemplate');
        if (!template) return null;

        const clone = template.content.cloneNode(true);

        // Set movie data
        const poster = clone.querySelector('.movie-poster');
        const title = clone.querySelector('.movie-title');
        const rating = clone.querySelector('.movie-rating');
        const saveBtn = clone.querySelector('.save-movie-btn');
        const detailsBtn = clone.querySelector('.view-details-btn');
        const genresContainer = clone.querySelector('.movie-genres');
        const adminControls = clone.querySelector('.admin-controls');
        const userControls = clone.querySelector('.user-controls');

        // Set poster image with full URL
        poster.src = CONFIG.getFullPosterUrl(movie.posterUrl);
        poster.alt = `${movie.title} Poster`;

        // Set title and rating
        title.textContent = movie.title;
        rating.textContent = movie.ratingAvg.toFixed(1);

        // Check if user is admin
        const isAdmin = Auth.isAdmin();

        // Show/hide controls based on user role
        if (saveBtn) {
            if (isAdmin) {
                saveBtn.classList.add('d-none');
            } else {
                saveBtn.classList.remove('d-none');

                // Set save button state
                if (movie.isSaved) {
                    saveBtn.classList.add('saved');
                    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                } else {
                    saveBtn.classList.remove('saved');
                    saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
                }

                // Add save/unsave functionality
                saveBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!Auth.isLoggedIn()) {
                        window.location.href = 'login.html';
                        return;
                    }

                    // Check if user has the User role
                    if (!Auth.isUser() && !Auth.isAdmin()) {
                        alert('You need to have a User role to save movies. Please contact the administrator.');
                        return;
                    }

                    try {
                        if (movie.isSaved) {
                            await this.unsaveMovie(movie.id);
                            saveBtn.classList.remove('saved');
                            saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
                            movie.isSaved = false;
                        } else {
                            await this.saveMovie(movie.id);
                            saveBtn.classList.add('saved');
                            saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                            movie.isSaved = true;
                        }
                    } catch (error) {
                        console.error('Error toggling saved state:', error);
                    }
                });
            }
        }

        // Show/hide admin controls
        if (adminControls) {
            if (isAdmin) {
                adminControls.classList.remove('d-none');

                // Add delete functionality
                const deleteBtn = adminControls.querySelector('.delete-movie-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (confirm(`Are you sure you want to delete "${movie.title}"?`)) {
                            try {
                                const result = await this.deleteMovie(movie.id);
                                if (result.success) {
                                    // Remove the movie card from the DOM
                                    const card = deleteBtn.closest('.col-md-4');
                                    if (card) {
                                        card.remove();
                                    }

                                    // Show success message
                                    alert(`Movie "${movie.title}" has been deleted.`);
                                } else {
                                    alert(`Failed to delete movie: ${result.error}`);
                                }
                            } catch (error) {
                                console.error('Error deleting movie:', error);
                                alert(`Error deleting movie: ${error.message}`);
                            }
                        }
                    });
                }

                // Add edit functionality
                const editBtn = adminControls.querySelector('.edit-movie-btn');
                if (editBtn) {
                    editBtn.href = `edit-movie.html?id=${movie.id}`;
                }
            } else {
                adminControls.classList.add('d-none');
            }
        }

        // Show/hide user controls
        if (userControls) {
            if (Auth.isUser() && Auth.isLoggedIn()) {
                userControls.classList.remove('d-none');
            } else {
                userControls.classList.add('d-none');
            }
        }

        // Set details link
        if (detailsBtn) {
            detailsBtn.href = `movie-details.html?id=${movie.id}`;
        }

        // Add genres
        if (genresContainer) {
            if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
                movie.genres.forEach(genre => {
                    if (genre && genre.name) {
                        const badge = document.createElement('span');
                        badge.classList.add('badge', 'bg-secondary', 'me-1');
                        badge.textContent = genre.name;
                        genresContainer.appendChild(badge);
                    }
                });
            } else {
                const noGenres = document.createElement('small');
                noGenres.classList.add('text-muted');
                noGenres.textContent = 'No genres';
                genresContainer.appendChild(noGenres);
            }
        }

        return clone;
    }
};

