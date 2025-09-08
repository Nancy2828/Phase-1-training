using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models
{
    public class GetOnlyPatientsDTO
    {
            public int PatientId { get; set; }
        public string Username { get; set; }
               public int Age { get; set; }
        public string Gender { get; set; }
        public string MedicalHistory { get; set; }
       
    }
}
