using CinemaVault.BLL.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace CinemaVault.BLL.DTOs.User
{
    public class PatchImageDto
    {
        [FromForm]
        [Required]
        [ValidateImageFile]
        public IFormFile ProfilePicture { get; set; }
    }
}