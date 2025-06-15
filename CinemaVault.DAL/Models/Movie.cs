using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Models
{
    public class Movie
    {
        public int Id { get; set; }
        [StringLength(100)]
        public required string Title { get; set; }
        [DataType(DataType.Date)]
        public DateTime ReleaseDate { get; set; }
        [StringLength(50)]
        public string? Description { get; set; }
        [StringLength(300)]
        public string PosterUrl { get; set; }
        [StringLength(300)]
        public string TrailerUrl { get; set; }
        [StringLength(50)]
        public string? DirectorName { get; set; }
        public int SumRating { get; set; } = 0;
        public int CountRating { get; set; } = 0;
        public double RatingAvg => CountRating > 0 ? (double)SumRating / CountRating : 0;
        public ICollection<GenreMovie> Genres { get; set; } = new List<GenreMovie>();
        public ICollection<SavedMovie> SavedMovies { get; set; } = new List<SavedMovie>();
    }
}
