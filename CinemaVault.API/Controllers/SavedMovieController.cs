using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User")]
    public class SavedMovieController : ControllerBase
    {
        private readonly ISavedMovieService _savedMovieService;

        public SavedMovieController(ISavedMovieService savedMovieService)
        {
            _savedMovieService = savedMovieService;
        }

        [HttpPost("save/{movieId}")]
        public async Task<IActionResult> SaveMovie(int movieId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _savedMovieService.SaveMovie(userId, movieId);

            return result ? Ok("Movie saved.") : BadRequest("Movie already saved or not found.");
        }

        [HttpDelete("unsave/{savedMovieId}")]
        public async Task<IActionResult> UnsaveMovie(int savedMovieId)
        {
            var result = await _savedMovieService.UnsaveMovie(savedMovieId);
            return result ? Ok("Movie unsaved.") : NotFound("Movie not found in saved list.");
        }

        [HttpGet("my-saved")]
        public async Task<IActionResult> GetMySavedMovies()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var movies = await _savedMovieService.GetSavedMoviesByUserId(userId);

            return Ok(movies);
        }
    }
}
