using BookingPortal.Context;
using BookingPortal.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BookingPortal.Security;
using Microsoft.Extensions.Options;
using System.Text;
using System.Globalization;

namespace BookingPortal.Repositories
{
    public class AuthRepo : IAuthRepo
    {
        private readonly appDbContext _context;
        private readonly IConfiguration _config;
        private readonly JwtOptions _jwtOptions;

        public AuthRepo(appDbContext context, IConfiguration config, IOptions<JwtOptions> jwtOptions)
        {
            _context = context;
            _config = config;
            _jwtOptions = jwtOptions.Value;
        }

        private string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
        private bool VerifyPassword(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);

        public string RegisterAdmin(Admin admin, string password)
        {
            admin.PasswordHash = HashPassword(password);
            _context.Admins.Add(admin);
            _context.SaveChanges();
            return "Admin Registered";
        }

        public string RegisterDoctor(Doctor doctor, string password)
        {
            doctor.PasswordHash = HashPassword(password);
            doctor.IsApproved = false;
            _context.Doctors.Add(doctor);
            _context.SaveChanges();
            return "Doctor registered successfully. Awaiting admin approval.";
        }
        public string RegisterPatient(Patient patient, string password)
        {
            patient.PasswordHash = HashPassword(password);
            _context.Patients.Add(patient);
            _context.SaveChanges();
            return "Patient Registered";
        }

        public (string? Token, string? Role) Login(string username, string password)
        {

            var patient = _context.Patients.FirstOrDefault(p => p.Username == username);
            if (patient != null && VerifyPassword(password, patient.PasswordHash))
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.Role, "Patient"),
                    new Claim("id", patient.PatientId.ToString())
                };
                return (JwtService.CreateJWTToken(_jwtOptions, claims), "Patient");
            }


            var doctor = _context.Doctors.FirstOrDefault(d => d.Username == username);
            if (doctor != null)
            {
                if (!VerifyPassword(password, doctor.PasswordHash))
                    return (null, null);

                if (!doctor.IsApproved)
                    return (null, "PendingApproval");

                var claims = new List<Claim>
            {
                   new Claim(ClaimTypes.Name, username),
                   new Claim(ClaimTypes.Role, "Doctor"),
                   new Claim("id", doctor.DoctorId.ToString())
            };
                return (JwtService.CreateJWTToken(_jwtOptions, claims), "Doctor");
            }


            var admin = _context.Admins.FirstOrDefault(a => a.Username == username);
            if (admin != null && VerifyPassword(password, admin.PasswordHash))
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.Role, "Admin"),
                    new Claim("id", admin.AdminId.ToString())
                };
                return (JwtService.CreateJWTToken(_jwtOptions, claims), "Admin");
            }


            return (null, null);
        }

        public string ApproveDoctor(int doctorId)
        {
            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == doctorId);
            if (doctor == null) return "Doctor not found";

            doctor.IsApproved = true;
            _context.SaveChanges();
            return "Doctor approved successfully";
        }

        public List<Doctor> GetPendingDoctors()
        {
            return _context.Doctors.Where(d => !d.IsApproved).ToList();
        }

        public List<Doctor> GetRegisteredDoctors(string? specialization = null, int? minExperience = null, decimal? maxFees = null)
        {
            var doctors = _context.Doctors.Where(d => d.IsApproved);

            if (!string.IsNullOrEmpty(specialization))
                doctors = doctors.Where(d => d.Specialization.ToLower().Contains(specialization.ToLower()));

            if (minExperience.HasValue)
                doctors = doctors.Where(d => d.Experience >= minExperience.Value);

            if (maxFees.HasValue)
                doctors = doctors.Where(d => d.Fees <= maxFees.Value);

            return doctors.ToList();
        }
        //appointment booking:
        public Appointment BookAppointment(AppointmentDto dto, int patientId)
        {
            var appointment = new Appointment
            {
                DoctorId = dto.DoctorId,
                PatientId = patientId,
                AppointmentDate = dto.AppointmentDate,
                Notes = dto.Notes,
                Status = "Pending"
            };

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            return appointment;
        }

        public IEnumerable<AppointmentResponseDto> GetAppointments(int userId, string role)
        {
            var query = _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .AsQueryable();

            if (role == "Patient")
                query = query.Where(a => a.PatientId == userId);
            else if (role == "Doctor")
                query = query.Where(a => a.DoctorId == userId);
            // Admin → no filter

            return query.Select(a => new AppointmentResponseDto
            {
                AppointmentId = a.AppointmentId,
                DoctorName = a.Doctor.Username,
                PatientName = a.Patient.Username,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status,
                Notes = a.Notes
            }).ToList();
        }

        public bool CancelAppointment(int appointmentId)
        {
            var appointment = _context.Appointments.Find(appointmentId);
            if (appointment == null) return false;

            appointment.Status = "Cancelled";
            _context.SaveChanges();
            return true;
        }
        public bool ApproveAppointment(int appointmentId)
        {
            var appointment = _context.Appointments.Find(appointmentId);
            if (appointment == null) return false;

            appointment.Status = "Approved";
            _context.SaveChanges();
            return true;
        }
        public bool RescheduleAppointment(int appointmentId, DateTime newDate)
        {
            var appointment = _context.Appointments.Find(appointmentId);
            if (appointment == null) return false;

            appointment.AppointmentDate = newDate;
            appointment.Status = "Rescheduled";
            _context.SaveChanges();
            return true;
        }


        public DashboardStatsDto GetDashboardStats()
        {
            var dashboard = new DashboardStatsDto();

            // Get current date
            var now = DateTime.Now;

            // Last 6 months dynamically
            var last6Months = Enumerable.Range(0, 6)
                                        .Select(i => now.AddMonths(-i))
                                        .OrderBy(m => m)
                                        .ToList();

            dashboard.Months = last6Months.Select(m => m.ToString("MMM")).ToList(); // ["Apr", "May", ...]

            dashboard.Revenue = new List<decimal>();
            dashboard.Orders = new List<int>();

            foreach (var month in last6Months)
            {
                // Get appointments for this month
                var monthAppointments = _context.Appointments.Include(a => a.Doctor)
                                                  .Where(a => a.AppointmentDate.Month == month.Month
                                                           && a.AppointmentDate.Year == month.Year)
                                                  .ToList();

                // Sum revenue safely (Doctor might be null)
                decimal revenue = monthAppointments
                    .Where(a => a.Doctor != null && a.Status == "Approved")
                    .Sum(a => a.Doctor.Fees);

                // Count all valid appointments
                int orders = monthAppointments.Count;

                dashboard.Revenue.Add(revenue);
                dashboard.Orders.Add(orders);
            }

            return dashboard;
        }
        public DeleteResponseDto DeletePatient(int id)
        {
            var patient = _context.Patients.Find(id);
            if (patient == null)
                return new DeleteResponseDto { Success = false, Message = "Patient not found" };

            _context.Patients.Remove(patient);
            _context.SaveChanges();
            return new DeleteResponseDto { Success = true, Message = "Patient deleted successfully" };
        }

        public DeleteResponseDto DeleteDoctor(int id)
        {
            var doctor = _context.Doctors.Find(id);
            if (doctor == null)
                return new DeleteResponseDto { Success = false, Message = "Doctor not found" };

            _context.Doctors.Remove(doctor);
            _context.SaveChanges();
            return new DeleteResponseDto { Success = true, Message = "Doctor deleted successfully" };
        }

        public DeleteResponseDto DeleteAppointment(int id)
        {
            var appointment = _context.Appointments.Find(id);
            if (appointment == null)
                return new DeleteResponseDto { Success = false, Message = "Appointment not found" };

            _context.Appointments.Remove(appointment);
            _context.SaveChanges();
            return new DeleteResponseDto { Success = true, Message = "Appointment deleted successfully" };
        }
        public List<GetAllPatientDto> GetAllPatients()
        {
            return _context.Patients
                .Include(p => p.Appointments)
                .ThenInclude(a => a.Doctor)
                .Select(p => new GetAllPatientDto
                {
                    PatientId = p.PatientId,
                    Username = p.Username,
                    Age = p.Age,
                    Gender = p.Gender,
                    Appointments = p.Appointments.Select(a => new GetAllAppointmentDto
                    {
                        AppointmentId = a.AppointmentId,
                        AppointmentDate = a.AppointmentDate, // ✅ correct property
                        DoctorName = a.Doctor.Username,
                        PatientName = p.Username
                    }).ToList()
                }).ToList();
        }
        public List<GetAllDoctorDto> GetAllDoctors()
        {
            return _context.Doctors
                .Include(d => d.Appointments)
                .ThenInclude(a => a.Patient)
                .Select(d => new GetAllDoctorDto
                {
                    DoctorId = d.DoctorId,
                    Username = d.Username,
                    Specialization = d.Specialization,
                    Fees = d.Fees,
                    Experience = d.Experience,
                    Appointments = d.Appointments.Select(a => new GetAllAppointmentDto
                    {
                        AppointmentId = a.AppointmentId,
                        AppointmentDate = a.AppointmentDate,
                        PatientName = a.Patient.Username,
                        DoctorName = d.Username
                    }).ToList()
                }).ToList();
        }
        public List<GetOnlyPatientsDTO> GetOnlyPatientsList()
        {
            return _context.Patients

                .Select(p => new GetOnlyPatientsDTO
                {
                    PatientId = p.PatientId,
                    Username = p.Username,
                    Age = p.Age,
                    Gender = p.Gender,
                    MedicalHistory = p.MedicalHistory,
                }).ToList();
        }
        public List<GetOnlyDoctorsDTO> GetOnlyDoctorsList()
        {
            return _context.Doctors

                .Select(p => new GetOnlyDoctorsDTO
                {
                    DoctorId = p.DoctorId,
                    Username = p.Username,
                    Specialization = p.Specialization,
                    Fees = p.Fees,
                    Experience = p.Experience

                }).ToList();


            //     public List<GetAllAppointmentDto> GetAllAppointments()
            // {
            //     return _context.Appointments
            //         .Include(a => a.Patient)
            //         .Include(a => a.Doctor)
            //         .Select(a => new GetAllAppointmentDto
            //         {
            //             AppointmentId = a.AppointmentId,
            //             AppointmentDate = a.AppointmentDate,
            //             PatientName = a.Patient.Username,
            //             DoctorName = a.Doctor.Username
            //         }).ToList();
            // }


        }



        public List<GetAllPatientDto> GetRespectiveDoctorPatientList(int doctorId)
{
    return _context.Patients
        .Include(p => p.Appointments)
        .Where(p => p.Appointments.Any(a => a.DoctorId == doctorId)) // ✅ filter by doctor
        .Select(p => new GetAllPatientDto
        {
            PatientId = p.PatientId,
            Username = p.Username,
            Age = p.Age,
            Gender = p.Gender,
            Appointments = p.Appointments
                .Where(a => a.DoctorId == doctorId) // ✅ only appointments with this doctor
                .Select(a => new GetAllAppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDate = a.AppointmentDate
                }).ToList()
        })
        .ToList();
}


    }
}