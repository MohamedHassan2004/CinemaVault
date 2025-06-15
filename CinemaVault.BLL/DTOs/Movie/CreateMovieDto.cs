using System.ComponentModel.DataAnnotations;
using CinemaVault.BLL.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class CreateMovieDto
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    [StringLength(50)]
    public string? Description { get; set; }

    [Required]
    [FromForm]
    [ValidateImageFile]
    public IFormFile PosterImg { get; set; }

    [DataType(DataType.Url)]
    [StringLength(300)]
    public string TrailerUrl { get; set; }

    [StringLength(50)]
    public string? DirectorName { get; set; }
}
