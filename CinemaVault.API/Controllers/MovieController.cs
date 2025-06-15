using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly IMovieService _movieService;

        public MovieController(IMovieService movieService)
        {
            _movieService = movieService;
        }

        [HttpPost]
        public async Task<IActionResult> AddMovie([FromForm] CreateMovieDto dto)
        {
            var result = await _movieService.AddMovie(dto);
            return result ? Ok("Movie added successfully.") : BadRequest("Failed to add movie.");
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMovie([FromForm] UpdateMovieDto dto)
        {
            var result = await _movieService.UpdateMovie(dto);
            return result ? Ok("Movie updated successfully.") : NotFound("Movie not found.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var result = await _movieService.DeleteMovie(id);
            return result ? Ok("Movie deleted.") : NotFound("Movie not found.");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movie = await _movieService.GetMovieDetailsById(id, userId);
            return movie != null ? Ok(movie) : NotFound("Movie not found.");
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllMovies()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _movieService.GetAllMovies(userId);
            return Ok(movies);
        }

        [HttpGet("latest/{count}")]
        public async Task<IActionResult> GetLatestMovies(int count)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _movieService.GetLatestMovies(count, userId);
            return Ok(movies);
        }

        [HttpGet("top-rated/{count}")]
        public async Task<IActionResult> GetTopRatedMovies(int count)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _movieService.GetTopRatedMovies(count, userId);
            return Ok(movies);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMovies([FromQuery] string term)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _movieService.SearchMovies(term, userId);
            return Ok(movies);
        }

        [HttpGet("genre/{genreId}")]
        public async Task<IActionResult> GetByGenreId(int genreId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _movieService.GetMoviesByGenreId(genreId, userId);
            return Ok(movies);
        }
    }
}
