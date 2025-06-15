using CinemaVault.BLL.DTOs;
using CinemaVault.BLL.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaVault.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPermissionController : ControllerBase
    {
        private readonly IUserPermissionService _userPermissionService;

        public UserPermissionController(IUserPermissionService userPermissionService)
        {
            _userPermissionService = userPermissionService;
        }

        [HttpPost]
        public async Task<IActionResult> AddPermissionToUser(UserPermissionDto userPermissionDto)
        {
            var IsSuccess = await _userPermissionService.AddPermissionToUser(userPermissionDto);
            return IsSuccess? Ok("Permission added to user successfully."): BadRequest("User Permission Already Exist");
        }

        [HttpDelete]
        public async Task<IActionResult> RemovePermissionFromUser(UserPermissionDto userPermissionDto)
        {
            var IsSuccess = await _userPermissionService.RemovePermissionFromUser(userPermissionDto);
            return IsSuccess ? Ok("Permission removed from user successfully.") : BadRequest("User permission isn't exist");
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserPermissionByUserId([FromQuery]string userId)
        {
            return Ok(await _userPermissionService.GetUserPermissionsByUserId(userId));
        }

    }
}
