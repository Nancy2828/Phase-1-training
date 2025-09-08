using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Specialization { get; set; }
        public decimal Fees { get; set; }
        public int Experience { get; set; }
        public bool IsApproved { get; set; } = false; 
       public ICollection<Appointment>? Appointments { get; set; }
    }
}
