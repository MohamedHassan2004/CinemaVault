using CinemaVault.BLL.DTOs.Genre;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IGenreService
    {
        Task<bool> CreateGenre(CreateGenreDto genre);
        Task<bool> UpdateGenre(GenreDto genre);
        Task<bool> DeleteGenre(int id);
        Task<List<GenreDto>> GetAllGenres();
    }
}
