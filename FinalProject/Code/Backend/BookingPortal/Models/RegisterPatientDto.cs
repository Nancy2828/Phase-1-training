using System.ComponentModel.DataAnnotations;

namespace BookingPortal.Models
{
    public class RegisterPatientDto
    {
        [Required]
        [StringLength(25, MinimumLength = 3)]
        public string Username { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$",
            ErrorMessage = "Password must have 1 uppercase, 1 lowercase, 1 number, and 1 special character.")]
        public string Password { get; set; }

        [Range(1, 120, ErrorMessage = "Age must be between 1 and 120.")]
        public int Age { get; set; }

        [Required]
        public string Gender { get; set; }

        public string MedicalHistory { get; set; }
    }
}
