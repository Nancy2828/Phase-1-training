import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterPatientInterface } from '../Models/register-patient.interface';
import { RegisterDoctorInterface } from '../Models/register-doctor.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5291/Main';

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Login`, {   // remove role
      username: data.username,
      password: data.password   // make sure the key matches backend
    });
  }
  registerPatient(Registerpatient_interface: RegisterPatientInterface) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post(`${this.apiUrl}/RegisterPatient`, Registerpatient_interface, { headers: headers, responseType: 'text' })
  }
  registerDoctors(Registerdoctor_interface: RegisterDoctorInterface) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json')
    return this.http.post(`${this.apiUrl}/RegisterDoctor`, Registerdoctor_interface, { headers: headers, responseType: 'text' })
  }
  getPendingDoctors() {
    return this.http.get<any[]>(`${this.apiUrl}/GetPendingDoctors`);
  }

  approveDoctor(id: number) {
    const token = localStorage.getItem('token'); // get JWT token
    const headers = { Authorization: `Bearer ${token}` }; // set header

    return this.http.post<string>(`${this.apiUrl}/ApproveDoctor/${id}`, null, { headers });
  }
  getallregisteredDoctors(specialization?: string, minExperience?: number, maxFees?: number) {
    let params: any = {};
    if (specialization) params.specialization = specialization;
    if (minExperience) params.minExperience = minExperience;
    if (maxFees) params.maxFees = maxFees;
    return this.http.get<any[]>(`${this.apiUrl}/GetRegisteredDoctors`, { params });
  }

  bookAppointment(appointment: any) {
    const token = localStorage.getItem('token'); // token saved during login
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/BookAppointment`, appointment, { headers });
  }
  getAppointments(): Observable<any[]> {
    const token = localStorage.getItem('token'); // get JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/GetAppointments`, { headers });
  }
  cancelAppointment(appointmentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/Cancel/${appointmentId}`, null, { headers });
  }
  approveAppointment(appointmentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/Approve/${appointmentId}`, null, { headers });
  }
  rescheduleAppointment(appointmentId: number, newDate: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Send directly as string
    return this.http.put(
      `${this.apiUrl}/Reschedule/${appointmentId}?newDate=${encodeURIComponent(newDate)}`,
      null,
      { headers }
    );

  }
  getDashboardStats(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/DashboardStats`, { headers });
  }

  getAllPatients(): Observable<any[]> {
    const token = localStorage.getItem('token'); // get JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/GetAllPatients`, { headers });
  }

  getAllDoctors(): Observable<any[]> {
    const token = localStorage.getItem('token'); // get JWT token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/GetAllDoctors`, { headers });
  }
  getOnlyPatientsList(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/GetOnlyPatientsList`, { headers });
  }

  // Delete patient by id
  deletePatient(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/DeletePatient/${id}`, { headers });
  }

  getOnlyDoctorsList(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/GetOnlyDoctorsList`, { headers });
  }

  // Delete patient by id
  deleteDoctors(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/DeleteDoctor/${id}`, { headers });
  }
  getMyPatientsAppointments(doctorId: number): Observable<any[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any[]>(`${this.apiUrl}/GetMyPatientsAppointments/${doctorId}`, { headers });
}

}
