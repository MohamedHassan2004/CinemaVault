using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class LocalFileSystemImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<LocalFileSystemImageStorageService> _logger;

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private const long MaxImageSizeBytes = 5 * 1024 * 1024;

        public LocalFileSystemImageStorageService(
            IWebHostEnvironment env,
            IHttpContextAccessor httpContextAccessor,
            ILogger<LocalFileSystemImageStorageService> logger)
        {
            _env = env;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(IFormFile image, string folderName)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("Image is required");

            ValidateImage(image);

            var fileName = GenerateFileName(image.FileName);
            var filePath = GetFilePath(fileName, folderName);

            await SaveImageToFileSystemAsync(image, filePath);

            return GenerateImageUrl(folderName, fileName);
        }

        public async Task<string> UpdateImageAsync(string oldImageUrl, IFormFile newImage, string folderName)
        {
            DeleteImage(oldImageUrl);
            return await UploadImageAsync(newImage, folderName);
        }

        public void DeleteImage(string imgUrl)
        {
            if (string.IsNullOrWhiteSpace(imgUrl))
                return;

            try
            {
                var imagePath = Path.Combine(_env.WebRootPath, imgUrl.TrimStart('/'));

                if (File.Exists(imagePath))
                    File.Delete(imagePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while deleting image: {ImageUrl}", imgUrl);
            }
        }

        private void ValidateImage(IFormFile image)
        {
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ArgumentException("Unsupported image format. Allowed: jpg, jpeg, png, gif.");

            if (!image.ContentType.StartsWith("image/"))
                throw new ArgumentException("File is not a valid image.");

            if (image.Length > MaxImageSizeBytes)
                throw new ArgumentException("Image size exceeds the 5MB limit.");
        }

        private string GenerateFileName(string originalFileName)
        {
            return Guid.NewGuid().ToString() + Path.GetExtension(originalFileName);
        }

        private string GetFilePath(string fileName, string folderName)
        {
            var folderPath = Path.Combine(_env.WebRootPath, "uploads", "images", folderName);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            return Path.Combine(folderPath, fileName);
        }

        private async Task SaveImageToFileSystemAsync(IFormFile image, string filePath)
        {
            try
            {
                using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save image to {FilePath}", filePath);
                throw;
            }
        }

        private string GenerateImageUrl(string folderName, string fileName)
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return $"/uploads/images/{folderName}/{fileName}";

            var baseUrl = $"{request.Scheme}://{request.Host}";
            return $"{baseUrl}/uploads/images/{folderName}/{fileName}";
        }
    }
}
