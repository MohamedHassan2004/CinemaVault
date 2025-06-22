using CinemaVault.DAL.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.IRepository
{
    public interface IUserRepository : IRepository<ApplicationUser>
    {
        public Task<ApplicationUser> GetByIdAsync(string userId);
    }
}
