using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IMovieRepository : IRepository<Movie>
    {
        Task<IEnumerable<Movie>> GetMoviesByTitleAsync(string title);
        Task<IEnumerable<Movie>> GetTopRatedMoviesAsync(int count);
        Task<IEnumerable<Movie>> GetLatestMoviesAsync(int count);
        Task<IEnumerable<Movie>> GetMoviesByGenreIdAsync(int genreId);
        Task<Movie> GetMovieDetailsById(int id);
    }
}
