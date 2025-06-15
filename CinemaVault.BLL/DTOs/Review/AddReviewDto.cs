using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.DTOs.Review
{
    public class AddReviewDto
    {
        public int MovieId { get; set; }

        public int Rating { get; set; }

        public string? Comment { get; set; }
    }
}
