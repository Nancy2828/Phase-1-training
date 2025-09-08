using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models
{
    public class GetOnlyDoctorsDTO
    {
       
        public int DoctorId { get; set; }
        public string Username { get; set; }
             public string Specialization { get; set; }
        public decimal Fees { get; set; }
        public int Experience { get; set; }
      
    }
}
