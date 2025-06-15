using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.DTOs.Review;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IReviewService
    {
        Task<List<ReadReviewDto>> GetReviewsByMovieId(int movieId);
        Task<bool> AddReview(string userId, AddReviewDto reviewDto);
        Task<bool> DeleteReview(int reviewId);
    }
}
