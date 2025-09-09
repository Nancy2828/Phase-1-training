import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error: string = '';
  showToast = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
          const decoded: any = jwtDecode(res.token);


          if (res.role === 'Patient') {
            localStorage.setItem('patientId', decoded.id);
          } else if (res.role === 'Doctor') {
            localStorage.setItem('doctorId', decoded.id);
          } else if (res.role === 'Admin') {
            localStorage.setItem('adminId', decoded.id);
          }
           this.showToast = true;
          // redirect based on role
          setTimeout(() => {
          this.showToast = false;
          if (res.role === 'Patient') this.router.navigate(['/patient-dashboard']);
          else if (res.role === 'Doctor') this.router.navigate(['/doctor-dashboard']);
          else if (res.role === 'Admin') this.router.navigate(['/admin-dashboard']);
        }, 2000);
      },
        error: (err) => {
          this.error = err.error || 'Login failed';
        }
      });
    }
  }
  openRegistration() {
    this.router.navigate(['/register']);
  }
  DcRegistration() {
    this.router.navigate(['/registerDoctor']);
  }
}