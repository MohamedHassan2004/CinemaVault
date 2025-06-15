using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Mvc;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenreController : ControllerBase
    {
        private readonly IGenreService _genreService;

        public GenreController(IGenreService genreService)
        {
            _genreService = genreService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGenres()
        {
            var genres = await _genreService.GetAllGenres();
            return Ok(genres);
        }


        [HttpPost]
        public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto createGenreDto)
        {
            var result = await _genreService.CreateGenre(createGenreDto);
            if (!result)
                return BadRequest("Failed to create genre");

            return Ok("Genre created successfully");
        }

        [HttpPut]
        public async Task<IActionResult> UpdateGenre([FromBody] GenreDto genreDto)
        {
            var result = await _genreService.UpdateGenre(genreDto);
            if (!result)
                return NotFound("Genre not found");

            return Ok("Genre updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var result = await _genreService.DeleteGenre(id);
            if (!result)
                return NotFound("Genre not found");

            return Ok("Genre deleted successfully");
        }
    }
}
