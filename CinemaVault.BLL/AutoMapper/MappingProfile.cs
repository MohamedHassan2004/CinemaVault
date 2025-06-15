using AutoMapper;
using CinemaVault.BLL.DTOs.Genre;
using CinemaVault.BLL.DTOs.Movie;
using CinemaVault.DAL.Models;
using System.Data;

namespace Marketplace.BLL.AutoMapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {

            CreateMap<Genre, GenreDto>();

            CreateMap<SavedMovie, SavedMovieDto>()
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie.Title))
                .ForMember(dest => dest.MoviePoster, opt => opt.MapFrom(src => src.Movie.PosterUrl))
                .ForMember(dest => dest.MovieDesctription, opt => opt.MapFrom(src => src.Movie.Description))
                .ForMember(dest => dest.MovieRating, opt => opt.MapFrom(src => src.Movie.RatingAvg))
                .ForMember(dest => dest.Genres, opt => opt.Ignore());

            CreateMap<Movie, MovieDto>()
                .ForMember(dest => dest.RatingAvg, opt => opt.MapFrom(src => src.RatingAvg))
                .ForMember(dest => dest.IsSaved, opt => opt.Ignore())
                .ForMember(dest => dest.Genres, opt => opt.Ignore());

            CreateMap<Movie, MovieDetailsDto>()
                .ForMember(dest => dest.RatingAvg, opt => opt.MapFrom(src => src.RatingAvg))
                .ForMember(dest => dest.IsSaved, opt => opt.Ignore())
                .ForMember(dest => dest.Genres, opt => opt.Ignore());

        }
    }
}
