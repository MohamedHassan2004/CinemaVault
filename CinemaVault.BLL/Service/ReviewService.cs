using AutoMapper;
using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.BLL.DTOs.Review;
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
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        private readonly IMapper _mapper;

        public ReviewService(IReviewRepository reviewRepository,
                            IMapper mapper)
        {
            _reviewRepository = reviewRepository;
            _mapper = mapper;
        }
        public async Task<bool> AddReview(string userId, AddReviewDto reviewDto)
        {
            var review = new Review
            {
                MovieId = reviewDto.MovieId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                UserId = userId
            };

            await _reviewRepository.AddAsync(review);
            return true;
           
        }

        public async Task<bool> DeleteReview(int reviewId)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
            {
                return false;
            }
            await _reviewRepository.DeleteAsync(review);
            return true;
        }

        public async Task<List<ReadReviewDto>> GetReviewsByMovieId(int movieId)
        {
            var reviews =  await _reviewRepository.GetReviewByMovieId(movieId);

            List<ReadReviewDto> result = new List<ReadReviewDto>();

            foreach (var review in reviews)
            {
                var dto = new ReadReviewDto
                {
                    Id = review.Id,
                    MovieId = review.MovieId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    UserId = review.UserId
                };
                result.Add(dto);
            }

            return   result;
        }
    }
}
