using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class GenreMovieService : IGenreMovieService
    {

        private readonly IGenreMovieRepository _genreMovieRepository;
        private readonly IMovieRepository _movieRepository;
        private readonly IGenreRepository _genreRepository;

        public GenreMovieService(IGenreMovieRepository genreMovieRepository, IMovieRepository movieRepository, IGenreRepository genreRepository)
        {

            _genreMovieRepository = genreMovieRepository;
            _movieRepository = movieRepository;
            _genreRepository = genreRepository;
        }
        public async Task<bool> AddGenreMovie(AddGenreDto genreMovie)
        {
            var movie = await _movieRepository.GetByIdAsync(genreMovie.MovieId);
            if (movie == null)
            {
                return false;
            }
            var genra = await _genreRepository.GetByIdAsync(genreMovie.GenreId);
            if (genra == null)
            {
                return false;
            }
            var isContains = await _genreMovieRepository.GetGenresByMovieIdAsync(genreMovie.MovieId);
            if (isContains.Any(g => g.Id == genreMovie.GenreId))
            {
                return false;
            }
            await _genreMovieRepository.AddAsync(new DAL.Models.GenreMovie { MovieId = genreMovie.MovieId, GenreId = genreMovie.GenreId});
            return true;
        }

        public async Task<bool> DeleteGenreMovie(int id)
        {
            var genreMovie = await _genreMovieRepository.GetByIdAsync(id);
            if (genreMovie == null)
            {
                return false;
            }
            await _genreMovieRepository.DeleteAsync(genreMovie);
            return true;
        }


    }
}
