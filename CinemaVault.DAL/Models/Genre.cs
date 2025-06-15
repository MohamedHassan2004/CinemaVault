using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Models
{
    public class Genre
    {
        public int Id { get; set; }
        [StringLength(50)]
        public required string Name { get; set; }
        public ICollection<GenreMovie> Movies { get; set; } = new List<GenreMovie>();
    }
}
