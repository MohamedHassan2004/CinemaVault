using CinemaVault.BLL.DTOs.Review;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }
        [HttpGet("{movieId}")]
        public async Task<IActionResult> GetReviewsByMovieId(int movieId)
        {
            var reviews = await _reviewService.GetReviewsByMovieId(movieId);
            if (reviews == null || !reviews.Any())
            {
                return NotFound("No reviews found for this movie.");
            }
            return Ok(reviews);
        }

        [Authorize(Policy = "CanAddReview")]
        [Authorize(Roles = "User")]
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] AddReviewDto reviewDto)
        {
            if (reviewDto == null)
            {
                return BadRequest("Invalid review data.");
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _reviewService.AddReview(userId, reviewDto);
            return result ? Ok("Review added successfully.") : BadRequest("Failed to add review.");
        }

        [Authorize(Roles ="User")]
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var result = await _reviewService.DeleteReview(reviewId);
            return result ? Ok("Review deleted successfully.") : NotFound("Review not found.");
        }
    }
}
