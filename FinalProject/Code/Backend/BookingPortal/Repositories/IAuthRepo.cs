using BookingPortal.Models;

namespace BookingPortal.Repositories
{
    public interface IAuthRepo
    {

        //register:
        string RegisterAdmin(Admin admin, string password);
        string RegisterDoctor(Doctor doctor, string password);
        string RegisterPatient(Patient patient, string password);
        // checking role:
        (string? Token, string? Role) Login(string username, string password);
        //approve dc by admin:
        string ApproveDoctor(int doctorId);
        //see pending doctor:
        List<Doctor> GetPendingDoctors();
        //see registered doctor by filer:
        List<Doctor> GetRegisteredDoctors(string? specialization = null, int? minExperience = null, decimal? maxFees = null);
        //book appointment:
        Appointment BookAppointment(AppointmentDto dto, int patientId);
        // patients View their appointments
        IEnumerable<AppointmentResponseDto> GetAppointments(int userId, string role);

        bool CancelAppointment(int appointmentId);

        bool ApproveAppointment(int appointmentId);

        bool RescheduleAppointment(int appointmentId, DateTime newDate);

        DashboardStatsDto GetDashboardStats();

        DeleteResponseDto DeletePatient(int id);
        DeleteResponseDto DeleteDoctor(int id);
        DeleteResponseDto DeleteAppointment(int id);

        List<GetAllPatientDto> GetAllPatients();
        List<GetAllDoctorDto> GetAllDoctors();
        List<GetOnlyPatientsDTO> GetOnlyPatientsList();
        // List<GetAllAppointmentDto> GetAllAppointments();
        List<GetOnlyDoctorsDTO> GetOnlyDoctorsList();

        List<GetAllPatientDto>GetRespectiveDoctorPatientList(int id);
    } 
}
