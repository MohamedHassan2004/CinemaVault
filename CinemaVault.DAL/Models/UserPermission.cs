using CinemaVault.DAL.Models.Users;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Models
{
    public class UserPermission
    {
        [Key]
        public int Id { get; set; }
        public int PermissionId { get; set; }
        [StringLength(500, MinimumLength = 3)]
        public string UserId { get; set; }
    }
}
