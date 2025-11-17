import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// Import des composants principaux et manquants
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar/sidebar.component';
import { LoginComponent } from './login/login/login.component';
import { DashboardComponent } from './Dashboard/dashboard/dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { ReportsComponent } from './admin/reports/reports/reports.component';
import { SettingsComponent } from './admin/settings/settings/settings.component';
import { DashboardMedecinComponent } from './Dashboard/dashboardMedecin/dashboard-medecin/dashboard-medecin.component';
import { DashboardSecretaireComponent } from './Dashboard/dashboard-secretaire/dashboard-secretaire.component';
import { ChatComponent } from './chat/chat.component';
import { CalendarRendezvousComponent } from './calendar-rendezvous/calendar-rendezvous.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
/* Ajoutez les autres composants ici */

@NgModule({
  declarations: [
  // AppComponent,
    // SidebarComponent,
    // LoginComponent,
    // DashboardComponent,
    // UsersComponent,
    // ReportsComponent,
    // SettingsComponent,
    // DashboardMedecinComponent,
    // DashboardSecretaireComponent,
    // ChatComponent,
    // CalendarRendezvousComponent,
    /* Ajoutez ici tous les autres composants */
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    RouterModule
    /* Ajoutez ici les modules spécifiques nécessaires (par exemple FullCalendar, HttpClientModule, etc.) */
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
