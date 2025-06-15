using CinemaVault.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IUserPermissionRepository
    {
        Task AddPermissionToUserAsync(UserPermission userPermission);
        Task RemovePermissionFromUserAsync(UserPermission userPermission);
        Task<UserPermission> GetUserPermissionAsync(int permissionId, string userId);
        Task<IEnumerable<UserPermission>> GetUserPermissionsByUserIdAsync(string userId);
    }
}
