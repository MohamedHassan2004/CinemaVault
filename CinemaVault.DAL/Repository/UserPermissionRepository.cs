using CinemaVault.DAL.Context;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Repository
{
    public class UserPermissionRepository : IUserPermissionRepository
    {
        private readonly CinemaVaultDbContext _context;

        public UserPermissionRepository(CinemaVaultDbContext context)
        {
            _context = context;
        }
        
        public async Task<UserPermission> GetUserPermissionAsync(int permissionId, string userId)
        {
            return await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);
        }

        public async Task AddPermissionToUserAsync(UserPermission userPermission)
        {
            await _context.UserPermissions.AddAsync(userPermission);
            await _context.SaveChangesAsync();
        }

        public async Task RemovePermissionFromUserAsync(UserPermission userPermission)
        {
            _context.UserPermissions.Remove(userPermission);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<UserPermission>> GetUserPermissionsByUserIdAsync(string userId)
        {
            return await _context.UserPermissions
                .Where(up => up.UserId == userId)
                .ToListAsync();
        }
    }
}
