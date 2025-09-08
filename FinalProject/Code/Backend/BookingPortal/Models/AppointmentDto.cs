namespace BookingPortal.Models
{
    public class AppointmentDto
    {
        public int DoctorId { get; set; }
       
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }
}