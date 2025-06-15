using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IGenreMovieRepository
    {
        Task AddAsync(GenreMovie genreMovie);
        Task DeleteAsync(GenreMovie genreMovie);
        Task<IEnumerable<GenreMovie>> GetMoviesByGenreIdAsync(int genreId);
        Task<IEnumerable<GenreMovie>> GetGenresByMovieIdAsync(int movieId);
        Task<GenreMovie> GetByIdAsync(int id);
    }
}
