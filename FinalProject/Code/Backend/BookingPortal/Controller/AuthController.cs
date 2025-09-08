using BookingPortal.Context;
using BookingPortal.Models;
using BookingPortal.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using BookingPortal.Repositories;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace BookingPortal.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MainController : ControllerBase
    {
        private readonly IAuthRepo _authRepo;
        private readonly JwtOptions _jwtOptions;

        public MainController(IAuthRepo authRepo, IOptions<JwtOptions> jwtOptions)
        {
            _authRepo = authRepo;
            _jwtOptions = jwtOptions.Value;
        }

        [HttpPost("RegisterAdmin")]
        public IActionResult RegisterAdmin(RegisterAdminDto dto)
        {
            if (dto == null)  // <-- Add this
                return BadRequest();

            var admin = new Admin
            {
                Username = dto.Username,
            };

            var result = _authRepo.RegisterAdmin(admin, dto.Password);
            return Ok(result);
        }


        [HttpPost("RegisterDoctor")]
        public IActionResult RegisterDoctor(RegisterDoctorDto dto)
        {
            var doctor = new Doctor
            {
                Username = dto.Username,
                Specialization = dto.Specialization,
                Fees = dto.Fees,
                Experience = dto.Experience
            };
            var result = _authRepo.RegisterDoctor(doctor, dto.Password);
            return Ok(result);
        }


        [HttpPost("RegisterPatient")]
        public IActionResult RegisterPatient(RegisterPatientDto dto)
        {
            var patient = new Patient
            {
                Username = dto.Username,
                Age = dto.Age,
                Gender = dto.Gender,
                MedicalHistory = dto.MedicalHistory
            };

            var result = _authRepo.RegisterPatient(patient, dto.Password);
            return Ok(result);
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var result = _authRepo.Login(dto.Username, dto.Password);

            if (result.Token == null)
                return Unauthorized("Invalid username or password");

            return Ok(new { Token = result.Token, Role = result.Role });
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("ApproveDoctor/{id}")]
        public IActionResult ApproveDoctor(int id)
        {
            var result = _authRepo.ApproveDoctor(id);
            if (result.Contains("not found")) return NotFound(result);
            return Ok(result);
        }
        [HttpGet("GetPendingDoctors")]
        public IActionResult GetPendingDoctors()
        {
            var pendingDoctors = _authRepo.GetPendingDoctors();
            return Ok(pendingDoctors);
        }
        [HttpGet("GetRegisteredDoctors")]
        public IActionResult GetRegisteredDoctors([FromQuery] string? specialization, [FromQuery] int? minExperience, [FromQuery] decimal? maxFees)
        {
            var doctors = _authRepo.GetRegisteredDoctors(specialization, minExperience, maxFees);
            return Ok(doctors);
        }

        [Authorize(Roles = "Patient")]
        [HttpPost("BookAppointment")]
        public IActionResult BookAppointment(AppointmentDto dto)
        {
            var patientId = int.Parse(User.Claims.First(c => c.Type == "id").Value);

            var result = _authRepo.BookAppointment(dto, patientId);
            return Ok(result);
        }

        [Authorize(Roles = "Patient,Doctor,Admin")]
        [HttpGet("GetAppointments")]
        public IActionResult GetAppointments()
        {
            var role = User.Claims.First(c => c.Type == ClaimTypes.Role).Value;
            var userId = int.Parse(User.Claims.First(c => c.Type == "id").Value);

            var result = _authRepo.GetAppointments(userId, role);
            return Ok(result);
        }
        [Authorize(Roles = "Doctor")]
        [HttpPut("Cancel/{appointmentId}")]
        public IActionResult CancelAppointment(int appointmentId)
        {
            var result = _authRepo.CancelAppointment(appointmentId);
            if (!result) return NotFound("Appointment not found.");
            return Ok("Appointment cancelled successfully.");
        }

        [Authorize(Roles = "Doctor")]
        [HttpPut("Approve/{appointmentId}")]
        public IActionResult ApproveAppointment(int appointmentId)
        {
            var result = _authRepo.ApproveAppointment(appointmentId);
            if (!result) return NotFound("Appointment not found.");
            return Ok("Appointment approved successfully.");
        }

        [Authorize(Roles = "Doctor")]
        [HttpPut("Reschedule/{appointmentId}")]
        public IActionResult RescheduleAppointment(int appointmentId, DateTime newDate)
        {
            var result = _authRepo.RescheduleAppointment(appointmentId, newDate);
            if (!result) return NotFound("Appointment not found.");
            return Ok("Appointment rescheduled successfully.");
        }
        [HttpGet("DashboardStats")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetDashboardStats()
        {
            var stats = _authRepo.GetDashboardStats();
            return Ok(stats);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeletePatient/{id}")]
        public IActionResult DeletePatient(int id)
        {
            var result = _authRepo.DeletePatient(id);
            return result.Success ? Ok(result) : NotFound(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteDoctor/{id}")]
        public IActionResult DeleteDoctor(int id)
        {
            var result = _authRepo.DeleteDoctor(id);
            return result.Success ? Ok(result) : NotFound(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteAppointment/{id}")]
        public IActionResult DeleteAppointment(int id)
        {
            var result = _authRepo.DeleteAppointment(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllPatients")]
        public IActionResult GetAllPatients()
        {
            var result = _authRepo.GetAllPatients();
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllDoctors")]
        public IActionResult GetAllDoctors()
        {
            var result = _authRepo.GetAllDoctors();
            return Ok(result);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("GetOnlyPatientsList")]
        public IActionResult GetOnlyPatientsList()
        {
            var result = _authRepo.GetOnlyPatientsList();
            return Ok(result);
        }
        [HttpGet("GetOnlyDoctorsList")]
        public IActionResult GetOnlyDoctorsList()
        {
            var result = _authRepo.GetOnlyDoctorsList();
            return Ok(result);
        }

        // [HttpGet("GetAllAppointments")]
        // public IActionResult GetAllAppointments()
        // {
        //     var result = _authRepo.GetAllAppointments();
        //     return Ok(result);
        // }

        [Authorize(Roles = "Doctor")]
        [HttpGet("GetMyPatientsAppointments/{doctorId}")]
        public IActionResult GetMyPatientsAppointments(int doctorId)
        {
            var result = _authRepo.GetRespectiveDoctorPatientList(doctorId);
            return Ok(result);
        }
    }
}
