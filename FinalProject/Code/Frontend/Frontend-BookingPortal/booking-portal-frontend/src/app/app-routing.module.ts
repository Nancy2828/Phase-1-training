import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { RegisterPatientComponent } from './auth/register-patient/register-patient.component';
import { RegisterDoctorComponent } from './auth/register-doctor/register-doctor.component';

const routes: Routes = [
   { path: '', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent },
  {path:'register',component: RegisterPatientComponent},
  {path:'registerDoctor',component:RegisterDoctorComponent},
  { path: '**', redirectTo: '' }  
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
