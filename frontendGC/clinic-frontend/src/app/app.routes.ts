import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SecretaireDashboardComponent } from './components/secretaire/secretaire-dashboard.component';
import { SecretairePatientsComponent } from './components/secretaire/secretaire-patients.component';
import { SecretaireRendezVousComponent } from './components/secretaire/secretaire-rendezvous.component';
import { SecretairePrescriptionsComponent } from './components/secretaire/secretaire-prescriptions.component';
import { SecretaireFacturesComponent } from './components/secretaire/secretaire-factures.component';
import { MedecinDashboardComponent } from './components/medecin/medecin-dashboard.component';
import { MedecinRendezVousComponent } from './components/medecin/medecin-rendezvous.component';
import { MedecinPatientsComponent } from './components/medecin/medecin-patients.component';
import { MedecinPrescriptionsComponent } from './components/medecin/medecin-prescriptions.component';
import { PatientsComponent } from './components/patients/patients.component';
import { MedecinsComponent } from './components/medecins/medecins.component';
import { RendezVousComponent } from './components/rendezvous/rendezvous.component';
import { UsersComponent } from './components/users/users.component';
import { AdminFacturesComponent } from './components/admin-factures.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'secretaire', component: SecretaireDashboardComponent, canActivate: [AuthGuard] },
  { path: 'secretaire/patients', component: SecretairePatientsComponent, canActivate: [AuthGuard] },
  { path: 'secretaire/rendezvous', component: SecretaireRendezVousComponent, canActivate: [AuthGuard] },
  { path: 'secretaire/prescriptions', component: SecretairePrescriptionsComponent, canActivate: [AuthGuard] },
  { path: 'secretaire/factures', component: SecretaireFacturesComponent, canActivate: [AuthGuard] },
  { path: 'medecin', component: MedecinDashboardComponent, canActivate: [AuthGuard] },
  { path: 'medecin/patients', component: MedecinPatientsComponent, canActivate: [AuthGuard] },
  { path: 'medecin/rendezvous', component: MedecinRendezVousComponent, canActivate: [AuthGuard] },
  { path: 'medecin/prescriptions', component: MedecinPrescriptionsComponent, canActivate: [AuthGuard] },
  { path: 'patients', component: PatientsComponent, canActivate: [AuthGuard] },
  { path: 'medecins', component: MedecinsComponent, canActivate: [AuthGuard] },
  { path: 'rendezvous', component: RendezVousComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'admin/factures', component: AdminFacturesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];
