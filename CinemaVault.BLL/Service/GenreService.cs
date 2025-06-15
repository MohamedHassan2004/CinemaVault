using AutoMapper;
using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;

namespace CinemaVault.BLL.Service
{
    public class GenreService : IGenreService
    {
        private readonly IGenreRepository _genreRepository;
        private readonly IMapper _mapper;

        public GenreService(IGenreRepository genreRepository, IMapper mapper)
        {
            _genreRepository = genreRepository;
            _mapper = mapper;
        }
        public async Task<bool> CreateGenre(CreateGenreDto genre)
        {
            var GenreEntity = new Genre { Name = genre.Name };
            await _genreRepository.AddAsync(GenreEntity);
            return true;
        }

        public async Task<bool> DeleteGenre(int id)
        {
            var GenreEntity = await _genreRepository.GetByIdAsync(id);
            if (GenreEntity == null)
            {
                return false;
            }
            await _genreRepository.DeleteAsync(GenreEntity);
            return true;
        }

        public async Task<bool> UpdateGenre(GenreDto genre)
        {
            var GenreEntity = await _genreRepository.GetByIdAsync(genre.Id);
            if (GenreEntity == null)
            {
                return false;
            }
            GenreEntity.Name = genre.Name;
            await _genreRepository.UpdateAsync(GenreEntity);
            return true;
        }

        public async Task<List<GenreDto>> GetAllGenres()
        {
            var genreEntities = await _genreRepository.GetAllAsync();
            var genreDtos = _mapper.Map<List<GenreDto>>(genreEntities);
            return genreDtos;
        }

    }
}
