using CinemaVault.BLL.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IUserService
    {
        Task<UserProfileDto> GetCurrentUserProfileAsync(string userId);
        Task<bool> UpdateUserInfoِAsync(string userId, PatchUserInfoDto userDto);
        Task<bool> UpdateProfilePictureAsync(string userId, PatchImageDto dto);
        Task<bool> DeleteCurrentUserAsync(string userId);
    }
}
