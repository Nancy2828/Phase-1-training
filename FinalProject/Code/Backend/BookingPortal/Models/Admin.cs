using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models
{
    public class Admin
    {
        [Key]
        public int AdminId { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
    }
}
