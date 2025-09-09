import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-doctor',
  templateUrl: './register-doctor.component.html',
  styleUrls: ['./register-doctor.component.css']
})
export class RegisterDoctorComponent implements OnInit {
  registerForm!: FormGroup;
  error: string = '';
  success: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)]],
      specialization: ['', Validators.required],
      fees: ['', [Validators.required, Validators.min(0)]],
      experience: ['', [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.registerDoctors(this.registerForm.value).subscribe({
        next: res => {
          this.success = 'Registration successful! Waiting for admin approval.';
          this.router.navigate(['/login']);
        },
        error: err => {
          this.error = err.error || 'Registration failed';
        }
      });
    } else {
      this.error = 'Please fill all fields correctly';
    }
  }
}
