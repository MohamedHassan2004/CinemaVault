using CinemaVault.BLL.DTOs.Movie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IGenreMovieService
    {
        Task<bool> AddGenreMovie(AddGenreDto genreMovie);
        Task<bool> DeleteGenreMovie(int id);
    }
}
