using CinemaVault.BLL.DTOs.User;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IImageStorageService _imageStorageService;

        public UserService(IUserRepository userRepository, IImageStorageService imageStorageService)
        {
            _userRepository = userRepository;
            _imageStorageService = imageStorageService;
        }

        public async Task<bool> DeleteCurrentUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }
            await _userRepository.DeleteAsync(user); 
            return true;
        }

        public async Task<UserProfileDto> GetCurrentUserProfileAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            return new UserProfileDto
            {
                Id = user.Id,
                ProfilePictureUrl = user.ProfilePictureUrl,
                UserName = user.UserName
            };
        }

        public async Task<bool> UpdateProfilePictureAsync(string userId, PatchImageDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }
            
            var fileName = await _imageStorageService.UploadImageAsync(dto.ProfilePicture, "UsersProfilePic");
            user.ProfilePictureUrl = fileName;
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> UpdateUserInfoِAsync(string userId, PatchUserInfoDto userDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }
            user.UserName = userDto.UserName;
            await _userRepository.UpdateAsync(user);
            return true;
        }
    }
}
