using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface ISavedMovieRepository
    {
        Task AddSavedMovieAsync(SavedMovie savedMovie);
        Task RemoveSavedMovieAsync(SavedMovie savedMovie);
        Task<IEnumerable<SavedMovie>> GetSavedMoviesByUserIdAsync(string userId);
        Task<SavedMovie> GetSavedMovieByIdAsync(int savedMovieId);
        Task<bool> IsMovieSavedByUserAsync(int movieId, string userId);
    }
}
