import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentService } from '../services/appointment.service';


@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {

  registeredDoctors: any[] = [];
  filterSpecialization: string = '';
  filterExperience: number | undefined;
  filterFees: number | undefined;
  registerForm!: FormGroup;
  error: string = '';
  success: string = '';
   showBookingModal = false;
  selectedDoctor: any = null;
  appointments: any[] = [];
  showAppointments: boolean = false;
  role: string = '';
  minDateTime: string = '';
  constructor(private authService: AuthService,private appointmentService: AppointmentService) { }
  ngOnInit(): void {
    this.loadRegistedDoctors();
    this.role = this.appointmentService.getRoleFromToken();
    const now = new Date();

  // Format to "YYYY-MM-DDTHH:mm" (required by datetime-local input)
  this.minDateTime = now.toISOString().slice(0, 16);
  }

  loadRegistedDoctors() {
    this.authService.getallregisteredDoctors().subscribe({
      next: res => this.registeredDoctors = res,
      error: err => console.error(err)
    });
  }
applyFilters() {
  this.authService.getallregisteredDoctors(
    this.filterSpecialization,
    this.filterExperience,
    this.filterFees
  ).subscribe({
    next: res => {
      this.registeredDoctors = res;

      // Clear filters after applying
      this.filterSpecialization = '';
      this.filterExperience = undefined;
      this.filterFees = undefined;
    },
    error: err => console.error(err)
  });
}
clearFilters() {
  this.filterSpecialization = '';
  this.filterExperience = undefined;
  this.filterFees = undefined;

  this.loadRegistedDoctors();
}
    // 🔹 Open popup for booking
  openBookingModal(doctor: any) {
    this.selectedDoctor = { ...doctor }; // make a copy
    this.showBookingModal = true;
  }

  // 🔹 Close popup
  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedDoctor = null;
  }

  // 🔹 Confirm booking from modal
  confirmBooking() {
    if (this.selectedDoctor) {
      this.bookNow(this.selectedDoctor);
      this.closeBookingModal();
    }
  }

  bookNow(doctor: any) {
  if (!doctor.appointmentDate) {
    this.error = "Appointment date is required!";
    return;
  }

  const appointmentDto = {
    doctorId: doctor.doctorId,  
    appointmentDate: doctor.appointmentDate,
    notes: doctor.notes || null
  };

  this.authService.bookAppointment(appointmentDto).subscribe({
    next: (res) => {
      this.success = "Appointment booked successfully!";
      console.log("Booked appointment:", res);
    },
    error: (err) => {
      this.error = "Failed to book appointment!";
      console.error("Booking error:", err);
    }
  });
  
}
viewAppointments() {
  if (this.showAppointments) {
    // If already shown, hide appointments
    this.showAppointments = false;
    return;
  }

  // If hidden, load appointments and show
  this.appointmentService.getAppointments().subscribe({
    next: (res) => {
      this.appointments = res;
      this.showAppointments = true;
    },
    error: (err) => {
      this.error = "Failed to load appointments!";
      console.error(err);
    }
  });
}
}












