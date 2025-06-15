using CinemaVault.BLL.DTOs.Auth;
using CinemaVault.BLL.IService;
using CinemaVault.DAL.Enums;
using CinemaVault.DAL.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Numerics;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.BLL.Service
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;
        private readonly IUserPermissionService _userPermissionService;

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration, IUserPermissionService userPermissionService)
        {
            _userManager = userManager;
            _config = configuration;
            _userPermissionService = userPermissionService;
        }

        private async Task<List<Claim>> GenerateUserClaims(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var permissions = await _userPermissionService.GetUserPermissionsByUserId(user.Id);
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("Permission", ((Permissions)permission.PermissionId).ToString()));
            }

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return claims;
        }
        private static ApplicationUser CreateUserBasedOnRole(RegisterDto registerDto, out ApplicationUser user)
        {
            user = null;
            switch (registerDto.Role)
            {
                case "User":
                    user = new RegUser
                    {
                        UserName = registerDto.Username,
                        Email = registerDto.Email,
                    };
                    break;
                case "Admin":
                    user = new Admin
                    {
                        UserName = registerDto.Username,
                        Email = registerDto.Email,
                    };
                    break;
                default:
                    user = null; 
                    break;
            }
            return user;
        }
        private string GenerateToken(IList<Claim> claims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            SigningCredentials signingCredentials = new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256);

            var expire = DateTime.UtcNow.AddDays(2);
            JwtSecurityToken jwtSecurityToken = new JwtSecurityToken(claims: claims, expires: expire, signingCredentials: signingCredentials);

            JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
            string token = handler.WriteToken(jwtSecurityToken);

            return token;
        }


        public async Task<LoginResult> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);
            if (user == null)
            {
                return LoginResult.Fail("User not found.");
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                return LoginResult.Fail("User is locked out.");
            }

            bool isAuthenticated = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!isAuthenticated)
            {
                await _userManager.AccessFailedAsync(user);
                return LoginResult.Fail("Invalid password.");
            }

            List<Claim> claims = await GenerateUserClaims(user);
            var token = GenerateToken(claims);

            return LoginResult.Success("", token);
        }


        public async Task<RegisterResult> Register(RegisterDto registerDto)
        {
            var existingUser = await _userManager.FindByNameAsync(registerDto.Username);
            if (existingUser != null)
            {
                return RegisterResult.Fail("Username already exists.");
            }

            ApplicationUser user = CreateUserBasedOnRole(registerDto, out user);
            if (user == null)
            {
                return RegisterResult.Fail("Invalid role.");
            }

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var error = string.Join(", ", result.Errors.Select(e => e.Description));
                return RegisterResult.Fail(error);
            }

            await _userManager.AddToRoleAsync(user, registerDto.Role);
            return RegisterResult.Success("", user.Id);
        }
    }
}

