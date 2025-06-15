using AutoMapper;
using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using CinemaVault.DAL.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class SavedMovieService : ISavedMovieService
    {
        private readonly ISavedMovieRepository _savedMovieRepository;
        private readonly IGenreRepository _genreRepository;
        private readonly IMapper _mapper;

        public SavedMovieService(ISavedMovieRepository savedMovieRepository, IGenreRepository genreRepository, IMapper mapper)
        {
            _savedMovieRepository = savedMovieRepository;
            _genreRepository = genreRepository;
            _mapper = mapper;
        }
        public async Task<bool> SaveMovie(string userId, int movieId)
        {
            var existingSavedMovie = await _savedMovieRepository.IsMovieSavedByUserAsync(movieId, userId);
            if (existingSavedMovie)
            {
                return false;
            }
            var savedMovie = new SavedMovie
            {
                UserId = userId,
                MovieId = movieId,
                SavedAt = DateTime.UtcNow
            };
            await _savedMovieRepository.AddSavedMovieAsync(savedMovie);
            return true;
        }

        public async Task<bool> UnsaveMovie(int savedMovieId)
        {

            var savedMovie = await _savedMovieRepository.GetSavedMovieByIdAsync(savedMovieId);
            if (savedMovie == null)
            {
                return false;
            }
            await _savedMovieRepository.RemoveSavedMovieAsync(savedMovie);
            return true;
        }

        public async Task<List<SavedMovieDto>> GetSavedMoviesByUserId(string userId)
        {
            var savedMovies = await _savedMovieRepository.GetSavedMoviesByUserIdAsync(userId);
            var savedMovieDtos = _mapper.Map<List<SavedMovieDto>>(savedMovies);
            foreach (var movieDto in savedMovieDtos)
            {
                var genres = await _genreRepository.GetGenresByMovieIdAsync(movieDto.Id);
                movieDto.Genres.AddRange(genres.Select(g => new GenreDto { Id = g.Id, Name = g.Name }));
            }
            return savedMovieDtos;
        }

        public async Task<bool> IsMovieSaved(int movieId, string userId)
        {
            return await _savedMovieRepository.IsMovieSavedByUserAsync(movieId, userId);
        }

    }
}
