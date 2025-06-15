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
    public class SavedMovieRepository : ISavedMovieRepository
    {
        private readonly CinemaVaultDbContext _context;
        public SavedMovieRepository(CinemaVaultDbContext context)
        {
            _context = context;
        }

        public async Task AddSavedMovieAsync(SavedMovie savedMovie)
        {
            await _context.SavedMovies.AddAsync(savedMovie);
            await _context.SaveChangesAsync();
        }

        public async Task<SavedMovie> GetSavedMovieByIdAsync(int savedMovieId)
        {
            return await _context.SavedMovies.FindAsync(savedMovieId);
        }

        public async Task<IEnumerable<SavedMovie>> GetSavedMoviesByUserIdAsync(string userId)
        {
            return await _context.SavedMovies.Include(sm => sm.Movie).Where(sm => sm.UserId == userId).ToListAsync();
        }

        public async Task<bool> IsMovieSavedByUserAsync(int movieId, string userId)
        {
            return await _context.SavedMovies
                .AnyAsync(sm => sm.MovieId == movieId && sm.UserId == userId);
        }

        public async Task RemoveSavedMovieAsync(SavedMovie savedMovie)
        {
            _context.SavedMovies.Remove(savedMovie);
            await _context.SaveChangesAsync();
        }
    }
}
