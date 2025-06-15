using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IGenreRepository : IRepository<Genre>
    {
        Task<IEnumerable<Genre>> GetAllGenresWithMoviesAsync();
        Task<Genre> GetGenreByIdWithMoviesAsync(int genreId);
        Task<IEnumerable<Genre>> GetGenresByMovieIdAsync(int movieId);
    }
}
