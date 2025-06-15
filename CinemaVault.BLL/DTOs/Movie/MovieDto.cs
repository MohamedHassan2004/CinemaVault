using CinemaVault.BLL.DTOs.Genre;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.DTOs.Movie
{
    public class MovieDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string PosterUrl { get; set; }
        public double RatingAvg { get; set; }
        public bool IsSaved { get; set; }
        public List<GenreDto> Genres { get; set; } = new List<GenreDto>();

    }
}
