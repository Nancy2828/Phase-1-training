import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.css']
})
export class RegisterPatientComponent implements OnInit {
  registerForm!: FormGroup;
  error: string = '';
  success: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      password: ['', [Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      ]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      medicalHistory: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.registerPatient(this.registerForm.value).subscribe({
        next: () => {
          this.success = 'Registration successful! Please login.';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = err.error || 'Registration failed';
        }
      });
    } else {
      this.error = 'Please fill all required fields correctly';
    }
  }

}
