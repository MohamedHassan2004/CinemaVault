using CinemaVault.BLL.DTOs.Movie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IMovieService
    {
        Task<bool> AddMovie(CreateMovieDto movieDto);
        Task<bool> UpdateMovie(UpdateMovieDto movieDto);
        Task<bool> DeleteMovie(int id);
        Task<MovieDetailsDto> GetMovieDetailsById(int id, string? userId);
        Task<List<MovieDto>> GetAllMovies(string userId);
        Task<List<MovieDto>> GetTopRatedMovies(int count, string? userId);
        Task<List<MovieDto>> GetLatestMovies(int count, string? userId);
        Task<List<MovieDto>> SearchMovies(string searchTerm, string? userId);
        Task<List<MovieDto>> GetMoviesByGenreId(int genreId, string? userId);
    }
}
