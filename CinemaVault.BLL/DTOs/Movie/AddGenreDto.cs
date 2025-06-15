using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.DTOs.Movie
{
    public class AddGenreDto
    {
        public int MovieId { get; set; }
        public int GenreId { get; set; }
    }
}
