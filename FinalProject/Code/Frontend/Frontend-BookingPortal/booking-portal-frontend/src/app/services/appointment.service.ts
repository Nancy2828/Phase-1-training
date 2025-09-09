import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private authService: AuthService) { }

  // ✅ API call to get appointments
  getAppointments(): Observable<any[]> {
    return this.authService.getAppointments(); // <-- call your existing AuthService method
  }

  // ✅ Helper to parse role from JWT
  getRoleFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
  }
}
