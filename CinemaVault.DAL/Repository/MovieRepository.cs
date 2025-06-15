using CinemaVault.DAL.Context;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Repository
{
    public class MovieRepository : Repository<Movie> , IMovieRepository
    {
        private readonly CinemaVaultDbContext _context;

        public MovieRepository(CinemaVaultDbContext context) : base(context)
        {
            _context = context;
        }

        private IQueryable<Movie> GetMovieBase()
        {
            return _context.Movies
                .Include(m => m.SavedMovies)
                .Include(m => m.Genres)
                .ThenInclude(g => g.Genre);
        }

        public async Task<IEnumerable<Movie>> GetLatestMoviesAsync(int count)
        {
            return await _context.Movies
                .OrderByDescending(m => m.ReleaseDate)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }


        public async Task<IEnumerable<Movie>> GetMoviesByTitleAsync(string title)
        {
            return await GetMovieBase()
                .Where(m => m.Title.ToLower().Contains(title.ToLower()))
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int count)
        {
            return await GetMovieBase()
                .OrderByDescending(m => m.RatingAvg)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Movie> GetMovieDetailsById(int id)
        {
            return await GetMovieBase()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<Movie>> GetMoviesByGenreIdAsync(int genreId)
        {
            return await GetMovieBase()
                .Where(m => m.Genres.Any(gm => gm.Genre.Id == genreId))
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
