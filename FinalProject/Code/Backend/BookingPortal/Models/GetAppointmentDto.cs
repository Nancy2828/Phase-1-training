using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models;
public class GetAllAppointmentDto
{
    public int AppointmentId { get; set; }
    public DateTime AppointmentDate { get; set; }

    // keep only references, not full objects (to avoid cycles)
    public string PatientName { get; set; }
    public string DoctorName { get; set; }
}