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
    public class GenreMovieRepository : IGenreMovieRepository
    {
        private readonly CinemaVaultDbContext _context;

        public GenreMovieRepository(CinemaVaultDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(GenreMovie genreMovie)
        {
            await _context.GenreMovies.AddAsync(genreMovie);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(GenreMovie genreMovie)
        {
            _context.GenreMovies.Remove(genreMovie); 
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<GenreMovie>> GetGenresByMovieIdAsync(int movieId)
        {
            return await _context.GenreMovies
                .Include(gm => gm.Genre)
                .Include(gm => gm.Movie)
                .Where(gm => gm.MovieId == movieId)
                .ToListAsync();
        }

        public async Task<IEnumerable<GenreMovie>> GetMoviesByGenreIdAsync(int genreId)
        {
            return await _context.GenreMovies
                .Include(gm => gm.Genre)
                .Include(gm => gm.Movie)
                .Where(gm => gm.GenreId == genreId)
                .ToListAsync();
        }

        public async Task<GenreMovie> GetByIdAsync(int id)
        {
            return await _context.GenreMovies
                .FirstOrDefaultAsync(gm => gm.Id == id);
        }
    }
}
