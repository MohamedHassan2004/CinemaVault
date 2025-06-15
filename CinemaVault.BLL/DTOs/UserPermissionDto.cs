using System.ComponentModel.DataAnnotations;

namespace CinemaVault.BLL.DTOs
{
    public class UserPermissionDto
    {
        [Required]
        public int PermissionId { get; set; }
        [Required]
        [MaxLength(450)]
        public string UserId { get; set; }
    }
}