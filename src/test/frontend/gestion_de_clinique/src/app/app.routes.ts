import { Routes } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { DashboardComponent } from './Dashboard/dashboard/dashboard.component';
import { DashboardMedecinComponent } from './Dashboard/dashboardMedecin/dashboard-medecin/dashboard-medecin.component';
import { DashboardSecretaireComponent } from './Dashboard/dashboard-secretaire/dashboard-secretaire.component';
import { UsersComponent } from './admin/users/users.component';
import { ReportsComponent } from './admin/reports/reports/reports.component';
import { SettingsComponent } from './admin/settings/settings/settings.component';
import { PatientsComponent } from './patients/patients/patients.component';
import { MedecinsComponent } from './medecins/medecins/medecins.component';
import { RendezvousComponent } from './rendez-vous/rendezvous/rendezvous.component';
import { ChatComponent } from './chat/chat.component';
import { CalendarRendezvousComponent } from './calendar-rendezvous/calendar-rendezvous.component';
import { AuthGuard } from './guards/auth.guard';
import { PrescriptionComponent } from './prescription/prescription/prescription.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Routes protégées par authentification
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard-medecin', 
    component: DashboardMedecinComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'patients', 
    component: PatientsComponent,
    canActivate: [AuthGuard]
  }, 
  { 
    path: 'medecins', 
    component: MedecinsComponent,
    canActivate: [AuthGuard]
  },  
  { 
    path: 'prescription', 
    component: PrescriptionComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'rendezvous', 
    component: RendezvousComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'calendar-rdv', 
    component: CalendarRendezvousComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'chat', 
    component: ChatComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard-secretaire', 
    component: DashboardSecretaireComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
