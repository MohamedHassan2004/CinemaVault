using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.DTOs.Movie
{
    public class UpdateMovieDto
    {
        [Required]
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        [StringLength(50)]
        public string? Description { get; set; }
        [FromForm]
        public IFormFile PosterImg { get; set; }
        [DataType(DataType.Url)]
        [StringLength(300)]
        public string TrailerUrl { get; set; }
        [StringLength(50)]
        public string? DirectorName { get; set; }  
    }
}
