import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../services/appointment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  appointments: any[] = [];
  showAppointments = false;
  error = '';

  showRescheduleModal = false;
  selectedAppointment: any = null;
  newAppointmentDate = '';
patientsWithAppointments: any[] = [];
showAppointmentsTable = false;
  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
     this.viewAppointments();
  }

  // Load appointments
  viewAppointments() {
     const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      this.error = 'Doctor ID missing. Please login again.';
      return;
    }
    this.appointmentService.getAppointments().subscribe({
      next: (res) => {
        this.appointments = res;
        this.showAppointments = true;
      },
      error: () => {
        this.error = 'Failed to load appointments!';
      }
    });
  }

  // Handle dropdown changes
  onStatusChange(event: any, app: any) {
    const newStatus = event.target.value;

    if (newStatus === 'Cancelled') {
      this.authService.cancelAppointment(app.appointmentId).subscribe(() => {
        app.status = 'Cancelled';
      });
    } else if (newStatus === 'Approved') {
      this.authService.approveAppointment(app.appointmentId).subscribe(() => {
        app.status = 'Approved';
      });
    } else if (newStatus === 'Rescheduled') {
      this.openRescheduleModal(app);
    }
  }

  // Open modal for rescheduling
  openRescheduleModal(app: any) {
    this.selectedAppointment = app;
    this.newAppointmentDate = new Date(app.appointmentDate)
      .toISOString()
      .slice(0, 16);
    this.showRescheduleModal = true;
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
    this.selectedAppointment = null;
    this.newAppointmentDate = '';
  }

  confirmReschedule() {
  if (!this.newAppointmentDate || !this.selectedAppointment) return;

  this.authService
    .rescheduleAppointment(this.selectedAppointment.appointmentId, this.newAppointmentDate)
    .subscribe(() => {
      this.selectedAppointment.status = 'Rescheduled';
      this.selectedAppointment.appointmentDate = this.newAppointmentDate;
      this.closeRescheduleModal();
    });
}

loadMyAppointments() {
  const doctorId = localStorage.getItem("doctorId"); 
   console.log("doctorId from localStorage:", doctorId); 
  this.authService.getMyPatientsAppointments(Number(doctorId)).subscribe({
    next: (data) => {
       console.log("API Response:", data);
      this.patientsWithAppointments = data;
      this.showAppointmentsTable = true;
    },
    error: (err) => {
      console.error("Error fetching appointments", err);
    }
  });
}
}
