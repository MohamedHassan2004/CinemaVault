using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CinemaVault.BLL.DTOs.Genre;

namespace CinemaVault.BLL.DTOs.Movie
{
    public class MovieDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string Description { get; set; }
        public string PosterUrl { get; set; }
        public string TrailerUrl { get; set; }
        public string DirectorName { get; set; }
        public double RatingAvg { get; set; }
        public bool IsSaved { get; set; }
        public List<GenreDto> Genres = new List<GenreDto>();
    }
}
