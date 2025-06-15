using CinemaVault.DAL.Context;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Repository
{
    public class GenreRepository : Repository<Genre> , IGenreRepository
    {
        private readonly CinemaVaultDbContext _context;

        public GenreRepository(CinemaVaultDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Genre>> GetAllGenresWithMoviesAsync()
        {
            return await _context.Genres
                .Include(g => g.Movies).AsNoTracking()
                .ToListAsync();
        }

        public async Task<Genre> GetGenreByIdWithMoviesAsync(int genreId)
        {
            return await _context.Genres
                .Include(g => g.Movies)
                .FirstOrDefaultAsync(g => g.Id == genreId);
        }

        public async Task<IEnumerable<Genre>> GetGenresByMovieIdAsync(int movieId)
        {
            return await _context.Genres
                .Include(g => g.Movies)
                .Where(g => g.Movies.Any(m => m.Id == movieId))
                .ToListAsync();
        }
    }
}
