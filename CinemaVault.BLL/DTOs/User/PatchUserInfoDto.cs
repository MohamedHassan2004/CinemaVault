using System.ComponentModel.DataAnnotations;

namespace CinemaVault.BLL.DTOs.User
{
    public class PatchUserInfoDto
    {
        [Required]
        [StringLength(50,MinimumLength =3, ErrorMessage = "{0} must be between {2} and {1} character.")]
        public string UserName { get; set; }
    }
}