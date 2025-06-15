using CinemaVault.BLL.DTOs;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IUserPermissionService
    {
        public Task<bool> AddPermissionToUser(UserPermissionDto addPermissionDto);
        public Task<bool> RemovePermissionFromUser(UserPermissionDto removePermissionDto);
        public Task<IEnumerable<UserPermission>> GetUserPermissionsByUserId(string userId);
    }
}
