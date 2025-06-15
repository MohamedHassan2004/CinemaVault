using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;

namespace CinemaVault.BLL.Validation
{
    public class ValidateImageFileAttribute : ValidationAttribute
    {
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private const long MaxImageSize = 5 * 1024 * 1024;


        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value is IFormFile file)
            {
                if (file.Length == 0)
                    return new ValidationResult("Image file is required.");

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(ext))
                    return new ValidationResult($"Invalid image format. Allowed: {string.Join(", ", AllowedExtensions)}");

                if (!file.ContentType.StartsWith("image/"))
                    return new ValidationResult("The uploaded file is not a valid image.");

                if (file.Length > MaxImageSize)
                    return new ValidationResult("Image exceeds max size of 5MB.");
            }

            return ValidationResult.Success;
        }
    }
}
