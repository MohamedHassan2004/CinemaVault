using CinemaVault.BLL.DTOs.Movie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface ISavedMovieService
    {
        Task<bool> SaveMovie(string userId, int movieId);
        Task<bool> UnsaveMovie(int savedMovieId);
        Task<bool> IsMovieSaved(int movieId, string userId);
        Task<List<SavedMovieDto>> GetSavedMoviesByUserId(string userId);
    }
}
