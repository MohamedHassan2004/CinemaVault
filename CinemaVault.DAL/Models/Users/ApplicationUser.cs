using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CinemaVault.DAL.Models.Users
{
    public class ApplicationUser : IdentityUser
    {
        [StringLength(500)]
        public string ProfilePictureUrl { get; set; } = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }
}
