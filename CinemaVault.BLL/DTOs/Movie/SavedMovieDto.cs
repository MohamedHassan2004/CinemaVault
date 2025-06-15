using CinemaVault.BLL.DTOs.Genre;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.DTOs.Movie
{
    public class SavedMovieDto
    {
        public int Id { get; set; }
        public DateTime SavedAt { get; set; }
        public int MovieId { get; set; }
        public string MovieTitle { get; set; }
        public string MoviePoster { get; set; }
        public string MovieDesctription { get; set; }
        public double MovieRating { get; set; }
        public bool IsSaved { get; set; } = true;
        public List<GenreDto> Genres { get; set; } = new List<GenreDto>();

    }
}
