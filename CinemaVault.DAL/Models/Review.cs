using CinemaVault.DAL.Models.Users;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Models
{
    public class Review
    {
        public int Id { get; set; }
        [Required]
        [ForeignKey("Movie")]
        public int MovieId { get; set; }
        [Range(1, 10)]
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public RegUser User { get; set; }
        public int Rating { get; set; }
        [StringLength(1000)]
        public string? Comment { get; set; }
        public Movie? Movie { get; set; }

    }
}
