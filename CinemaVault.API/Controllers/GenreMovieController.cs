using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenreMovieController : ControllerBase
    {
        private readonly IGenreMovieService _genreMovieService;

        public GenreMovieController(IGenreMovieService genreMovieService)
        {
            _genreMovieService = genreMovieService;
        }

        [HttpPost]
        public async Task<IActionResult> AddGenreMovie([FromBody] AddGenreDto dto)
        {
            var result = await _genreMovieService.AddGenreMovie(dto);
            return result ? Ok("Genre added to movie successfully.") : BadRequest("Failed to add genre to movie.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenreMovie(int id)
        {
            var result = await _genreMovieService.DeleteGenreMovie(id);
            return result ? Ok("Genre removed from movie.") : NotFound("Genre-Movie relation not found.");
        }
    }
}
