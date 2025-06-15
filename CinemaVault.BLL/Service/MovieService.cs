using AutoMapper;
using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class MovieService : IMovieService
    {
        private readonly IMovieRepository _movieRepository;
        private readonly ISavedMovieRepository _savedMovieRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IMapper _mapper;
        private readonly IImageStorageService _imageStorageService;

        public MovieService(IMovieRepository movieRepository,
                            ISavedMovieRepository savedMovieRepository,
                            IGenreRepository genreRepository,
                            IMapper mapper,
                            IImageStorageService imageStorageService)
        {
            _movieRepository = movieRepository;
            _savedMovieRepository = savedMovieRepository;
            _genreRepository = genreRepository;
            _mapper = mapper;
            _imageStorageService = imageStorageService;
        }

        private async Task IsSavedMovie(string userId, List<MovieDto> movieDtos)
        {
            if (userId != null)
            {
                foreach (var movieDto in movieDtos)
                {
                    var isSaved = await _savedMovieRepository.IsMovieSavedByUserAsync(movieDto.Id, userId);
                    movieDto.IsSaved = isSaved;
                }
            }
            else
            {
                movieDtos.ForEach(m => m.IsSaved = false);
            }
        }

        private async Task<List<MovieDto>> MapMoviesToDtos(string? userId, IEnumerable<Movie> movies)
        {
            var movieDtos = _mapper.Map<List<MovieDto>>(movies);
            foreach (var movieDto in movieDtos)
            {
                if(movieDto.Genres == null)
                {
                    movieDto.Genres = new List<GenreDto>();
                }
                var genres = await _genreRepository.GetGenresByMovieIdAsync(movieDto.Id);
                movieDto.Genres.AddRange(genres.Select(g => new GenreDto { Id = g.Id, Name = g.Name }));
            }
            /// ????
            await IsSavedMovie(userId, movieDtos);
            return movieDtos;
        }

        public async Task<bool> AddMovie(CreateMovieDto movieDto)
        {
            if (movieDto.PosterImg == null || movieDto.PosterImg.Length == 0)
                throw new ArgumentException("Image is required");

            var posterUrl = await _imageStorageService.UploadImageAsync(movieDto.PosterImg, "MoviePosters");

            var movieEntity = new Movie
            {
                Title = movieDto.Title,
                Description = movieDto.Description,
                PosterUrl = posterUrl,
                TrailerUrl = movieDto.TrailerUrl,
                DirectorName = movieDto.DirectorName,
                ReleaseDate = DateTime.Now
            };
            await _movieRepository.AddAsync(movieEntity);
            return true;
        }

        public async Task<bool> UpdateMovie(UpdateMovieDto movieDto)
        {
            var movieEntity = await _movieRepository.GetByIdAsync(movieDto.Id);

            if (movieEntity == null || movieDto.PosterImg == null || movieDto.PosterImg.Length == 0)
                return false;

            var posterUrl = await _imageStorageService.UpdateImageAsync(movieEntity.PosterUrl, movieDto.PosterImg, "MoviePosters");

            movieEntity.PosterUrl = posterUrl;
            movieEntity.Title = movieDto.Title;
            movieEntity.Description = movieDto.Description;
            movieEntity.TrailerUrl = movieDto.TrailerUrl;
            movieEntity.DirectorName = movieDto.DirectorName;

            await _movieRepository.UpdateAsync(movieEntity);
            return true;
        }

        public async Task<bool> DeleteMovie(int id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie == null)
            {
                return false;
            }
            _imageStorageService.DeleteImage(movie.PosterUrl);
            await _movieRepository.DeleteAsync(movie);
            return true;
        }


        public async Task<MovieDetailsDto> GetMovieDetailsById(int id, string? userId)
        {
            var movie = await _movieRepository.GetMovieDetailsById(id);
            var movieDto = _mapper.Map<MovieDetailsDto>(movie);
            if (userId != null)
            {
                movieDto.IsSaved = await _savedMovieRepository.IsMovieSavedByUserAsync(id, userId);
            }
            return movieDto;
        }

        public async Task<List<MovieDto>> GetAllMovies(string? userId)
        {
            var movies = await _movieRepository.GetAllAsync();
            List<MovieDto> movieDtos = await MapMoviesToDtos(userId, movies);
            return movieDtos;
        }


        public async Task<List<MovieDto>> GetLatestMovies(int count, string? userId)
        {
            var movies = await _movieRepository.GetLatestMoviesAsync(count);
            List<MovieDto> movieDtos = await MapMoviesToDtos(userId, movies);
            return movieDtos;
        }

        public async Task<List<MovieDto>> GetTopRatedMovies(int count, string? userId)
        {
            var movies = await _movieRepository.GetTopRatedMoviesAsync(count);
            List<MovieDto> movieDtos = await MapMoviesToDtos(userId, movies);
            return movieDtos;
        }

        public async Task<List<MovieDto>> SearchMovies(string searchTerm, string? userId)
        {
            var movies = await _movieRepository.GetMoviesByTitleAsync(searchTerm);
            List<MovieDto> movieDtos = await MapMoviesToDtos(userId, movies);
            return movieDtos;
        }

        public async Task<List<MovieDto>> GetMoviesByGenreId(int genreId, string? userId)
        {
            var movies = await _movieRepository.GetMoviesByGenreIdAsync(genreId);
            List<MovieDto> movieDtos = await MapMoviesToDtos(userId, movies);
            return movieDtos;
        }
    }
}
