using CinemaVault.BLL.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.IService
{
    public interface IAuthService
    {
        Task<LoginResult> Login(LoginDto loginDto);
        Task<RegisterResult> Register(RegisterDto registerDto);
    }
}
