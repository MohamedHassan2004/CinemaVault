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
    public class SavedMovie
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string UserId { get; set; }
        [DataType(DataType.Date)]
        public DateTime SavedAt { get; set; }
        [ForeignKey("MovieId")]
        public Movie Movie { get; set; }
        [ForeignKey("UserId")]
        public RegUser User { get; set; }
    }
}
