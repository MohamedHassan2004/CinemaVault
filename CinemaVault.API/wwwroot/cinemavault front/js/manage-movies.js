/**
 * Manage Movies page script for Cinema Vault
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if not logged in or not admin
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize search form
    initSearchForm();
    
    // Load genres for filter dropdown
    await loadGenres();
    
    // Load all movies
    await loadMovies();
    
    // Initialize filter and sort controls
    initFilterControls();
    
    // Initialize delete modal
    initDeleteModal();
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
 * Load genres for the filter dropdown
 */
async function loadGenres() {
    const filterGenre = document.getElementById('filterGenre');
    if (!filterGenre) return;
    
    try {
        // Get all genres
        const genres = await API.get('Genre');
        
        if (genres.length === 0) {
            return;
        }
        
        // Add genre options to dropdown
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            filterGenre.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// Store all movies for filtering
let allMovies = [];

/**
 * Load all movies
 */
async function loadMovies() {
    const moviesTableBody = document.getElementById('moviesTableBody');
    const noMoviesMessage = document.getElementById('noMoviesMessage');
    
    if (!moviesTableBody) return;
    
    try {
        // Get all movies
        allMovies = await Movies.getAllMovies();
        
        // Clear loading indicator
        moviesTableBody.innerHTML = '';
        
        if (allMovies.length === 0) {
            // Show no movies message
            if (noMoviesMessage) noMoviesMessage.classList.remove('d-none');
            moviesTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No movies found.</td></tr>';
            return;
        }
        
        // Hide no movies message
        if (noMoviesMessage) noMoviesMessage.classList.add('d-none');
        
        // Render movies
        renderMovies(allMovies);
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Error loading movies. Please try again later.</td></tr>';
    }
}

/**
 * Render movies in the table
 * @param {Array} movies - The movies to render
 */
function renderMovies(movies) {
    const moviesTableBody = document.getElementById('moviesTableBody');
    if (!moviesTableBody) return;
    
    // Clear table
    moviesTableBody.innerHTML = '';
    
    // Add movie rows
    movies.forEach(movie => {
        const row = document.createElement('tr');
        
        // Format release date
        const releaseDate = new Date(movie.releaseDate).toLocaleDateString();
        
        // Create row HTML
        row.innerHTML = `
            <td>${movie.id}</td>
            <td>
                <img src="${movie.posterUrl}" alt="${movie.title}" class="img-thumbnail" style="width: 60px; height: 80px; object-fit: cover;">
            </td>
            <td>
                <a href="movie-details.html?id=${movie.id}" class="text-decoration-none">
                    ${movie.title}
                </a>
                <div class="small text-muted">
                    ${movie.genres.map(g => g.name).join(', ')}
                </div>
            </td>
            <td>${movie.directorName || 'Unknown'}</td>
            <td>${releaseDate}</td>
            <td>
                <span class="badge bg-warning text-dark">
                    <i class="fas fa-star me-1"></i> ${movie.ratingAvg.toFixed(1)}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="movie-details.html?id=${movie.id}" class="btn btn-outline-primary" title="View">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="edit-movie.html?id=${movie.id}" class="btn btn-outline-warning" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn btn-outline-danger delete-movie-btn" data-id="${movie.id}" data-title="${movie.title}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add delete button event listener
        const deleteBtn = row.querySelector('.delete-movie-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                showDeleteModal(movie.id, movie.title);
            });
        }
        
        moviesTableBody.appendChild(row);
    });
}

/**
 * Initialize filter and sort controls
 */
function initFilterControls() {
    const filterTitle = document.getElementById('filterTitle');
    const filterGenre = document.getElementById('filterGenre');
    const sortBy = document.getElementById('sortBy');
    
    // Add event listeners
    if (filterTitle) {
        filterTitle.addEventListener('input', applyFilters);
    }
    
    if (filterGenre) {
        filterGenre.addEventListener('change', applyFilters);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
}

/**
 * Apply filters and sorting to movies
 */
function applyFilters() {
    const filterTitle = document.getElementById('filterTitle');
    const filterGenre = document.getElementById('filterGenre');
    const sortBy = document.getElementById('sortBy');
    
    // Get filter values
    const titleFilter = filterTitle ? filterTitle.value.trim().toLowerCase() : '';
    const genreFilter = filterGenre ? filterGenre.value : '';
    const sortOption = sortBy ? sortBy.value : 'title';
    
    // Filter movies
    let filteredMovies = [...allMovies];
    
    // Apply title filter
    if (titleFilter) {
        filteredMovies = filteredMovies.filter(movie => 
            movie.title.toLowerCase().includes(titleFilter)
        );
    }
    
    // Apply genre filter
    if (genreFilter) {
        filteredMovies = filteredMovies.filter(movie => 
            movie.genres.some(genre => genre.id.toString() === genreFilter)
        );
    }
    
    // Apply sorting
    switch (sortOption) {
        case 'title':
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            filteredMovies.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'date':
            filteredMovies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            break;
        case 'date_asc':
            filteredMovies.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
            break;
        case 'rating':
            filteredMovies.sort((a, b) => b.ratingAvg - a.ratingAvg);
            break;
        case 'rating_asc':
            filteredMovies.sort((a, b) => a.ratingAvg - b.ratingAvg);
            break;
    }
    
    // Render filtered movies
    renderMovies(filteredMovies);
}

/**
 * Initialize delete confirmation modal
 */
function initDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (!deleteModal || !confirmDeleteBtn) return;
    
    // Store movie ID to delete
    let movieIdToDelete = null;
    
    // Add event listener to confirm delete button
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!movieIdToDelete) return;
        
        try {
            // Show loading overlay
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) loadingOverlay.classList.remove('d-none');
            
            // Delete movie
            const result = await Movies.deleteMovie(movieIdToDelete);
            
            // Hide loading overlay
            if (loadingOverlay) loadingOverlay.classList.add('d-none');
            
            // Hide modal
            const bsModal = bootstrap.Modal.getInstance(deleteModal);
            if (bsModal) bsModal.hide();
            
            if (result.success) {
                // Remove movie from array
                allMovies = allMovies.filter(movie => movie.id !== movieIdToDelete);
                
                // Re-render movies
                applyFilters();
                
                // Show success message
                alert('Movie deleted successfully');
            } else {
                // Show error message
                alert(`Failed to delete movie: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            
            // Hide loading overlay
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) loadingOverlay.classList.add('d-none');
            
            // Show error message
            alert(`Error deleting movie: ${error.message}`);
        }
    });
    
    /**
     * Show delete confirmation modal
     * @param {number} movieId - The movie ID to delete
     * @param {string} movieTitle - The movie title
     */
    window.showDeleteModal = function(movieId, movieTitle) {
        // Set movie ID to delete
        movieIdToDelete = movieId;
        
        // Set movie title in modal
        const deleteMovieTitle = document.getElementById('deleteMovieTitle');
        if (deleteMovieTitle) deleteMovieTitle.textContent = movieTitle;
        
        // Show modal
        const bsModal = new bootstrap.Modal(deleteModal);
        bsModal.show();
    };
}
