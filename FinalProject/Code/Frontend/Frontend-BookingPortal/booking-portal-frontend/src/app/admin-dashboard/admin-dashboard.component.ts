import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentService } from '../services/appointment.service';
import { ChartConfiguration, ChartType } from 'chart.js';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  pendingDoctors: any[] = [];
  appointments: any[] = [];
  showAppointments: boolean = false;
  error: string = '';
  role: string = '';

  allAppointments: any[] = []; // store all appointments from API
  filterStatus: string = '';
 barChartData: ChartConfiguration['data'] = {
  labels: [],
  datasets: []
   
};
 patients: any[] = [];
  showPatients: boolean = false;
  doctors:any[]=[];
  showDoctors:boolean=false

barChartType: ChartType = 'bar';
 @ViewChild('patientsTable') patientsTable!: ElementRef;
  @ViewChild('doctorsTable') doctorsTable!: ElementRef;
  @ViewChild('graphSection') graphSection!: ElementRef;
  @ViewChild('appointmentsTable') appointmentsTable!: ElementRef;
  constructor(private authService: AuthService, private appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.loadPendingDoctors();
    this.role = this.appointmentService.getRoleFromToken();
    
  }

  loadPendingDoctors() {
    this.authService.getPendingDoctors().subscribe({
      next: res => this.pendingDoctors = res,
      error: err => console.error(err)
    });
  }

  approveDoctor(id: number) {
    this.authService.approveDoctor(id).subscribe({
      next: res => {
        alert(res);
        // Remove approved doctor from the UI immediately
        this.pendingDoctors = this.pendingDoctors.filter(d => d.doctorId !== id);
      },
      error: err => console.error(err)
    });
  }
  viewAppointments() {
  this.appointmentService.getAppointments().subscribe({
    next: (res) => {
      this.allAppointments = res; // store original
      this.appointments = res; // table shows this
      this.showAppointments = true;

      // Scroll smoothly after rendering
      setTimeout(() => {
        if (this.appointmentsTable) {
          this.appointmentsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    error: (err) => {
      this.error = "Failed to load appointments!";
      console.error(err);
    }
  });
}


  applyFilter() {
    if (this.filterStatus === '' || this.filterStatus === 'All') {
      this.appointments = [...this.allAppointments]; // show all
    } else {
      this.appointments = this.allAppointments.filter(
        app => app.status === this.filterStatus
      );
    }
  }
showGraph: boolean = false;

loadChartData(): void {
  this.authService.getDashboardStats().subscribe((data) => {
    this.barChartData = {
      labels: data.months,
      datasets: [
        { data: data.revenue, label: 'Revenue' },
        { data: data.orders, label: 'Orders' }
      ]
    };

    // Show the graph only after data is loaded
    this.showGraph = true;

    // Scroll to the graph
    setTimeout(() => {
      if (this.graphSection) {
        this.graphSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  });
}
  getAllPatients() {
    this.authService.getAllPatients().subscribe(res => {
      this.patients = res;
      this.showPatients = true;

      setTimeout(() => {
        if (this.patientsTable) {
          this.patientsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }
    getAllDoctors() {
    this.authService.getAllDoctors().subscribe(res => {
      this.doctors = res;
      this.showDoctors = true;

      setTimeout(() => {
        if (this.doctorsTable) {
          this.doctorsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }
  loadonlyPatients() {
    this.authService.getOnlyPatientsList().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => {
        console.error("Error fetching patients", err);
      }
    });
  }

  // Delete patient by id
  deletePatient(id: number) {
    if (confirm("Are you sure you want to delete this patient?")) {
      this.authService.deletePatient(id).subscribe({
        next: () => {
          this.patients = this.patients.filter(p => p.patientId !== id);
          alert("Patient deleted successfully.");
        },
        error: (err) => {
          console.error("Error deleting patient", err);
          alert("Failed to delete patient.");
        }
      });
    }
  }

    loadonlyDoctors() {
    this.authService.getOnlyDoctorsList().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => {
        console.error("Error fetching patients", err);
      }
    });
  }

  // Delete patient by id
  deleteDoctors(id: number) {
    if (confirm("Are you sure you want to delete this doctor?")) {
      this.authService.deleteDoctors(id).subscribe({
        next: () => {
          this.doctors = this.doctors.filter(p => p.doctorId!== id);
          alert("Doctor deleted successfully.");
        },
        error: (err) => {
          console.error("Error deleting doctor", err);
          alert("Failed to delete doctor.");
        }
      });
    }
  }
barChartOptions: any = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      enabled: true,
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#000'
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    },
    y: {
      ticks: {
        color: '#000'
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    }
  }
};

}
