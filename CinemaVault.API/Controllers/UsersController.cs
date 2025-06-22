using CinemaVault.BLL.DTOs.User;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profile = await _userService.GetCurrentUserProfileAsync(userId);
            if (profile == null)
            {
                return NotFound("User not found");
            }
            return Ok(profile);
        }

        [HttpPatch("profile-picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromForm] PatchImageDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (dto == null || dto.ProfilePicture == null)
            {
                return BadRequest("Invalid profile picture data");
            }
            var result = await _userService.UpdateProfilePictureAsync(userId, dto);
            if (!result)
            {
                return NotFound("User not found or unable to update profile picture");
            }
            return Ok("Profile picture updated successfully");
        }

        [HttpPatch("update-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] PatchUserInfoDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (dto == null)
            {
                return BadRequest("Invalid profile data");
            }
            var result = await _userService.UpdateUserInfoِAsync(userId, dto);
            if (!result)
            {
                return NotFound("User not found or unable to update profile");
            }
            return Ok("Profile updated successfully");
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _userService.DeleteCurrentUserAsync(userId);
            if (!result)
            {
                return NotFound("User not found or unable to delete");
            }
            return Ok("User deleted successfully");
        }
    }
}
