using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models;
public class GetAllPatientDto
{
    public int PatientId { get; set; }
    public string Username { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; }

     public List<GetAllAppointmentDto>? Appointments { get; set; }

}