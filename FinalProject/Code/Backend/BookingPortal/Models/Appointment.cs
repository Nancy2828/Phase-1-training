using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookingPortal.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        [ForeignKey("Doctor")]
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }   

        [ForeignKey("Patient")]
        public int PatientId { get; set; }
        public Patient Patient { get; set; } 

        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "Pending"; 
        public string? Notes { get; set; }
    }
}
