using CinemaVault.BLL.DTOs;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class UserPermissionService : IUserPermissionService
    {
        private readonly IUserPermissionRepository _userPermissionRepository;

        public UserPermissionService(IUserPermissionRepository userPermissionRepository)
        {
            _userPermissionRepository = userPermissionRepository;
        }

        public async Task<bool> AddPermissionToUser(UserPermissionDto addPermissionDto)
        {
            var checkExistance = await _userPermissionRepository.GetUserPermissionAsync(addPermissionDto.PermissionId, addPermissionDto.UserId);
            if (checkExistance is not null)
            {
                return false;
            }
            var userPermission = new UserPermission
            {
                PermissionId = addPermissionDto.PermissionId,
                UserId = addPermissionDto.UserId
            };
            await _userPermissionRepository.AddPermissionToUserAsync(userPermission);
            return true;
        }

        public async Task<IEnumerable<UserPermission>> GetUserPermissionsByUserId(string userId)
        {
            return await _userPermissionRepository.GetUserPermissionsByUserIdAsync(userId);
        }

        public async Task<bool> RemovePermissionFromUser(UserPermissionDto removePermissionDto)
        {
            var userPermission = await _userPermissionRepository.GetUserPermissionAsync(removePermissionDto.PermissionId, removePermissionDto.UserId);
            if(userPermission is null)
            {
                return false;
            }
            await _userPermissionRepository.RemovePermissionFromUserAsync(userPermission);
            return true;
        }
    }
}
