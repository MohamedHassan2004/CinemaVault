using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IImageStorageService
    {
        Task<string> UploadImageAsync(IFormFile image, string folderName);
        void DeleteImage(string imgUrl);
        Task<string> UpdateImageAsync(string oldImageUrl, IFormFile newImage, string folderName);
    }
}

