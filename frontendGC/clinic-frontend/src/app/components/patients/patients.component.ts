import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/auth.model';
// import { SidebarComponent } from '../shared/sidebar.component'; // Remplacé par sidebar inlinée pour le style compact
import { ExportService } from '../../services/export.service';
import { PatientHistoryModalComponent } from '../medecin/patient-history-modal.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  // Rétention de PatientHistoryModalComponent et retrait de SidebarComponent
  imports: [CommonModule, FormsModule, RouterModule, PatientHistoryModalComponent], 
  template: `
    <div class="dashboard-container">
      
      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-top">
          <button class="menu-icon" (click)="toggleSidebar()" title="Fermer le menu">
            <span class="sidebar-logo">Gestion Clinic</span>
          </button>
        </div>
        
        <div class="sidebar-menu">
          <ul class="nav-menu">
            <li>
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" 
                 title="Tableau de bord" (click)="closeSidebar()">
                <span class="icon">🏠</span>
                <span class="link-text">Tableau de bord</span>
              </a>
            </li>
            <li>
              <a routerLink="/patients" routerLinkActive="active" 
                 title="Patients" (click)="closeSidebar()">
                <span class="icon">👥</span>
                <span class="link-text">Patients</span>
              </a>
            </li>
            <li>
              <a routerLink="/medecins" routerLinkActive="active" 
                 title="Médecins" (click)="closeSidebar()">
                <span class="icon">👨‍⚕️</span>
                <span class="link-text">Médecins</span>
              </a>
            </li>
            <li>
              <a routerLink="/rendezvous" routerLinkActive="active" 
                 title="Rendez-vous" (click)="closeSidebar()">
                <span class="icon">📅</span>
                <span class="link-text">Rendez-vous</span>
              </a>
            </li>
            <li>
              <a routerLink="/users" routerLinkActive="active" 
                 title="Utilisateurs" (click)="closeSidebar()">
                <span class="icon">⚙️</span>
                <span class="link-text">Utilisateurs</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/factures" routerLinkActive="active" 
                 title="Factures" (click)="closeSidebar()">
                <span class="icon">💰</span>
                <span class="link-text">Factures</span>
              </a>
            </li>
          </ul>
        </div>
        
        <div class="sidebar-footer" *ngIf="loggedUser">
          <!-- Full user info (shown when sidebar is open) -->
          <div class="user-info-full">
            <div class="user-profile" title="Mon Profil">
              <div class="user-avatar">
                <span>👤</span>
              </div>
              <div class="user-details">
                <span class="user-name">{{ loggedUser.prenom }}</span>
                <span class="user-role">{{ getUserRoleLabel(loggedUser.role) }}</span>
              </div>
            </div>
            <button (click)="logout()" class="btn-logout" title="Déconnexion">
              <span class="icon">🚪</span>
            </button>
          </div>

          <!-- Compact avatar shown when sidebar is collapsed (desktop) -->
          <div class="user-compact" *ngIf="!isSidebarOpen">
            <div class="user-avatar" title="Mon Profil">
              <span>👤</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay -->
      <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>

      
      <main class="main-content">
        <div class="mobile-header">
          <button class="menu-burger" (click)="toggleSidebar()" title="Ouvrir le menu">☰</button>
            <h2 class="mobile-title">Patients</h2>
        </div>
        <div class="patients-container">
          
          <div class="header-card">
            <div class="header-info">
                <h2>Gestion des Patients</h2>
                <span class="subtitle">Administrer les dossiers médicaux et informations des patients</span>
            </div>
            <div class="header-actions">
              <button (click)="loadPatients()" class="btn-refresh" title="Actualiser la liste">
                <span class="btn-icon">↻</span>
                Actualiser
              </button>
              <button (click)="exportPatients()" class="btn-export" title="Exporter au format Word">
                <span class="btn-icon">📃</span>
                Exporter
              </button>
              <button (click)="showAddForm = !showAddForm" class="btn-primary">
                <span class="btn-icon">{{ showAddForm ? '❌' : '➕' }}</span>
                {{ showAddForm ? 'Annuler' : 'Ajouter un Patient' }}
              </button>
            </div>
          </div>

          <div *ngIf="showAddForm" class="form-card">
            <h3>{{ editingPatient ? 'Modifier' : 'Ajouter' }} un Patient</h3>
            <form (ngSubmit)="savePatient()" #patientForm="ngForm" novalidate>
              <div class="form-grid-three">
                <div class="form-group">
                  <label for="nom">Nom:</label>
                  <input id="nom" [(ngModel)]="currentPatient.nom" name="nom" required #nomModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="nomModel.invalid && nomModel.touched">Le nom est requis.</div>
                </div>
                <div class="form-group">
                  <label for="prenom">Prénom:</label>
                  <input id="prenom" [(ngModel)]="currentPatient.prenom" name="prenom" required #prenomModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="prenomModel.invalid && prenomModel.touched">Le prénom est requis.</div>
                </div>
                <div class="form-group">
                  <label for="email">Email:</label>
                  <input id="email" type="email" [(ngModel)]="currentPatient.email" name="email" required #emailModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="emailModel.invalid && emailModel.touched">
                    <span *ngIf="emailModel.errors?.['required']">L'email est requis.</span>
                    <span *ngIf="emailModel.errors?.['email']">Format d'email invalide.</span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="telephone">Téléphone:</label>
                  <input id="telephone" type="tel" pattern="^[0-9]{8,15}$" [(ngModel)]="currentPatient.telephone" name="telephone" required #telephoneModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="telephoneModel.invalid && telephoneModel.touched">
                    <span *ngIf="telephoneModel.errors?.['required']">Le téléphone est requis.</span>
                    <span *ngIf="telephoneModel.errors?.['pattern']">Doit contenir 8 à 15 chiffres.</span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="dateNaissance">Date de naissance:</label>
                  <input id="dateNaissance" type="date" [(ngModel)]="currentPatient.dateNaissance" name="dateNaissance" required #dateModel="ngModel" [max]="maxDate" class="form-control">
                  <div class="field-error" *ngIf="dateModel.invalid && dateModel.touched">
                    <span *ngIf="dateModel.errors?.['required']">La date de naissance est requise.</span>
                    <span *ngIf="dateModel.errors?.['max']">La date de naissance doit être dans le passé.</span>
                  </div>
                </div>
                <div class="form-group"></div> </div>

              <h4 class="form-section-title">Antécédents et Allergies</h4>
              <div class="form-grid-two">
                <div class="form-group">
                  <label for="antecedents">Antécédents Médicaux:</label>
                  <textarea id="antecedents" [(ngModel)]="currentPatient.antecedents" name="antecedents" rows="3" class="form-control"></textarea>
                </div>
                <div class="form-group">
                  <label for="allergies">Allergies:</label>
                  <textarea id="allergies" [(ngModel)]="currentPatient.allergies" name="allergies" rows="3" class="form-control"></textarea>
                </div>
              </div>

              <h4 class="form-section-title">Adresse</h4>
              <div class="form-grid-two">
                <div class="form-group">
                  <label for="street">Rue:</label>
                  <input id="street" [(ngModel)]="currentPatient.adressDto.street" name="street" required #streetModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="streetModel.invalid && streetModel.touched">La rue est requise.</div>
                </div>
                <div class="form-group">
                  <label for="houseNumber">Numéro:</label>
                  <input id="houseNumber" [(ngModel)]="currentPatient.adressDto.houseNumber" name="houseNumber" class="form-control">
                </div>
                <div class="form-group">
                  <label for="city">Ville:</label>
                  <input id="city" [(ngModel)]="currentPatient.adressDto.city" name="city" required #cityModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="cityModel.invalid && cityModel.touched">La ville est requise.</div>
                </div>
                <div class="form-group">
                  <label for="postalCode">Code Postal:</label>
                  <input id="postalCode" type="text" pattern="^[0-9A-Za-z -]{3,10}$" [(ngModel)]="currentPatient.adressDto.postalCode" name="postalCode" required #postalModel="ngModel" class="form-control">
                  <div class="field-error" *ngIf="postalModel.invalid && postalModel.touched">
                    <span *ngIf="postalModel.errors?.['required']">Le code postal est requis.</span>
                    <span *ngIf="postalModel.errors?.['pattern']">Format de code postal invalide.</span>
                  </div>
                </div>
              </div>
              <div class="form-group form-full-width">
                <label for="country">Pays:</label>
                <input id="country" [(ngModel)]="currentPatient.adressDto.country" name="country" required #countryModel="ngModel" class="form-control">
                <div class="field-error" *ngIf="countryModel.invalid && countryModel.touched">Le pays est requis.</div>
              </div>

              <div class="form-actions">
                <button type="button" (click)="cancelEdit()" class="btn-secondary">Annuler</button>
                <button type="submit" [disabled]="!patientForm.valid" class="btn-primary btn-save">Sauvegarder</button>
              </div>
            </form>
          </div>

          <div class="table-card">
            <div class="table-scroll-wrapper">
                <table class="patients-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Date de Naissance</th>
                      <th class="action-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let patient of patients">
                      <td>{{ patient.nom }}</td>
                      <td>{{ patient.prenom }}</td>
                      <td><span class="email-text">{{ patient.email }}</span></td>
                      <td>{{ patient.telephone }}</td>
                      <td>{{ patient.dateNaissance | date:'dd/MM/yyyy' }}</td>
                      <td class="action-column">
                        <button (click)="viewHistory(patient)" class="btn-action btn-history" title="Voir l'historique">📜</button>
                        <button (click)="editPatient(patient)" class="btn-action btn-edit" title="Modifier">✏️</button>
                        <button (click)="deletePatient(patient.id!)" class="btn-action btn-delete" title="Supprimer">🗑️</button>
                      </td>
                    </tr>
                    <tr *ngIf="patients.length === 0">
                        <td colspan="6" class="no-data-row">Aucun patient trouvé.</td>
                    </tr>
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </main>
      
      <app-patient-history-modal 
        [isVisible]="showHistoryModal" 
        [patient]="selectedPatient"
        (closed)="showHistoryModal = false">
      </app-patient-history-modal>
    </div>
  `,
  styles: [`
    /* Color Palette (Consistent with Dashboard/Medecins) */
    :host {
      --color-white: #ffffff;
      --color-background: #f7f9fc;
      --color-text-dark: #2c3e50;
      --color-text-medium: #8895a7;
      --color-sidebar: #ffffff;
      --color-primary: #1abc9c; /* Teal */
      --color-secondary: #3498db; /* Blue */
      --color-danger: #e74c3c; /* Red */
      --color-success: #2ecc71; /* Green */
      --color-info: #9b59b6; /* Purple for History/Info */
      
      --color-card-bg: #ffffff;
      --color-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
      --border-radius-lg: 16px;
      --border-radius-sm: 10px;
    }

    /* ------------------------------ Layout ------------------------------ */
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      height: 100vh;
      background-color: var(--color-background);
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
    }

    .main-content {
      /* Make main a flexible area that can shrink so overflow works inside flex container */
      flex: 1 1 auto;
      min-height: 0; /* allow the flex child to be smaller than its content so overflow triggers */
      padding: 2rem;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    /* ------------------------------ Sidebar Desktop (Collapsed) ------------------------------ */
    .sidebar {
      width: 80px;
      background-color: var(--color-sidebar);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
      padding: 1.5rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .sidebar-top {
      margin-bottom: 2rem;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 1rem;
    }

    .sidebar-logo {
      display: none;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-left: 1rem;
    }

    .menu-icon {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-text-dark);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .menu-icon:hover {
      background-color: #f0f0f0;
    }

    .sidebar-menu {
      flex-grow: 1;
      width: 100%;
      overflow-y: auto;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .nav-menu li {
      margin-bottom: 1.5rem;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .nav-menu li a {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      border-radius: var(--border-radius-sm);
      text-decoration: none;
      color: var(--color-text-medium);
      transition: all 0.2s ease;
      position: relative;
      cursor: pointer;
    }

    .nav-menu li a .icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .nav-menu li a .link-text {
      display: none;
      white-space: nowrap;
      margin-left: 1rem;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .nav-menu li a:hover {
      background-color: #f0f0f0;
      color: var(--color-text-dark);
    }

    .nav-menu li a.active,
    .nav-menu li.active a {
      background-color: var(--color-primary);
      color: var(--color-white);
    }

    .sidebar-footer {
      padding: 1rem;
      padding-top: 2rem;
      width: 100%;
      border-top: 1px solid #f0f0f0;
      margin-top: auto;
    }

    .user-info-full {
      display: none;
    }

    .sidebar.open .user-info-full {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .user-compact {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 0;
    }

    .user-compact .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--color-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--color-white);
      cursor: pointer;
    }

    .sidebar.open .user-compact {
      display: none;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
      flex: 1;
    }

    .user-profile:hover {
      background-color: #f0f0f0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--color-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--color-white);
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .user-name {
      font-size: 0.9rem;
      color: var(--color-text-dark);
      font-weight: 600;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--color-text-medium);
      text-transform: uppercase;
    }

    .btn-logout {
      background: none;
      border: none;
      color: var(--color-danger);
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .btn-logout:hover {
      background-color: #ffebee;
    }

    .sidebar-overlay {
      display: none;
    }

    

/* ------------------------------ Container Adjustments ------------------------------ */
.patients-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (max-width: 768px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .btn-refresh,
  .btn-export,
  .btn-primary {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-grid-two,
  .form-grid-three {
    grid-template-columns: 1fr;
  }

  .patients-table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.75rem 0.5rem;
  }

  .action-column {
    width: auto;
  }

  .btn-action {
    font-size: 1rem;
    padding: 0.4rem;
  }
}

@media (max-width: 576px) {
  .main-content {
    padding: 1rem 0.75rem;
  }

  .header-info h2 {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-refresh,
  .btn-export,
  .btn-primary {
    width: 100%;
  }

  .table-scroll-wrapper {
    margin: 0 -0.75rem;
    padding: 0 0.75rem;
  }

  .form-section-title {
    font-size: 1rem;
    margin-top: 1.5rem;
  }
}

    /* ------------------------------ Mobile Header ------------------------------ */
    .mobile-header {
      display: none;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .menu-burger {
      background: none;
      border: none;
      font-size: 1.8rem;
      color: var(--color-text-dark);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .menu-burger:hover {
      background-color: #f0f0f0;
    }

    .mobile-title {
      font-size: 1.5rem;
      margin: 0;
      color: var(--color-text-dark);
      font-weight: 700;
    }

    

    /* ------------------------------ Header Card ------------------------------ */
    .header-card {
      background: var(--color-card-bg);
      padding: 1.5rem 2rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-info h2 {
        font-size: 1.8rem;
        color: var(--color-text-dark);
        margin: 0;
        font-weight: 700;
    }
    .subtitle {
        font-size: 0.9rem;
        color: var(--color-text-medium);
        font-weight: 500;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
    }

    /* ------------------------------ Formulaire ------------------------------ */
    .form-card {
      background: var(--color-card-bg);
      padding: 2rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
    }
    .form-card h3 {
        color: var(--color-primary);
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-weight: 600;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #f0f0f0;
    }
    .form-section-title {
        color: var(--color-text-dark);
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        font-weight: 600;
    }
    .form-grid-two { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 1.5rem; 
    }
    .form-grid-three { 
        display: grid; 
        grid-template-columns: 1fr 1fr 1fr; 
        gap: 1.5rem; 
    }
    .form-full-width {
        grid-column: 1 / -1;
    }
    .form-group label { 
        display: block; 
        margin-bottom: 0.5rem; 
        font-weight: 600; 
        color: var(--color-text-dark);
        font-size: 0.9rem;
    }
    .form-control { 
        width: 100%; 
        padding: 0.75rem; 
        border: 1px solid #ddd; 
        border-radius: var(--border-radius-sm); 
        box-sizing: border-box; 
        transition: border-color 0.3s;
    }
    .form-control:focus {
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.1);
    }
    .form-actions { 
        display: flex; 
        gap: 1rem; 
        margin-top: 2rem; 
        justify-content: flex-end;
    }

    /* ------------------------------ Boutons ------------------------------ */
    .btn-primary, .btn-secondary, .btn-export, .btn-refresh { 
        padding: 0.75rem 1.5rem; 
        border: none; 
        border-radius: var(--border-radius-sm); 
        cursor: pointer;
        font-weight: 600; 
        transition: all 0.3s ease;
        font-size: 1rem;
        display: flex;
        align-items: center;
    }
    .btn-icon { margin-right: 0.5rem; font-size: 1.1rem; }
    
    .btn-primary { 
        background-color: var(--color-primary); 
        color: white; 
    }
    .btn-primary:hover:not(:disabled) { 
        background-color: #16a085; 
        transform: translateY(-2px); 
        box-shadow: 0 4px 12px rgba(26, 188, 156, 0.3);
    }
    .btn-primary:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
    .btn-secondary { 
        background-color: #95a5a6; 
        color: white; 
    }
    .btn-secondary:hover { 
        background-color: #7f8c8d; 
    }

    .btn-export {
        background-color: var(--color-success); 
        color: white;
    }
    .btn-export:hover {
        background-color: #27ad60; 
        transform: translateY(-2px); 
        box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
    }
    
    .btn-refresh {
        background-color: var(--color-secondary); 
        color: white;
    }
    .btn-refresh:hover {
        background-color: #2980b9; 
        transform: translateY(-2px); 
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    /* ------------------------------ Tableau ------------------------------ */
    .table-card { 
        background: var(--color-card-bg); 
        border-radius: var(--border-radius-lg); 
        box-shadow: var(--color-shadow);
        overflow: hidden; 
    }
    .table-scroll-wrapper {
        overflow-x: auto;
    }
    .patients-table { 
        width: 100%; 
        border-collapse: separate; 
        border-spacing: 0;
    }
    th, td { 
        padding: 1rem 1.5rem; 
        text-align: left; 
        white-space: nowrap;
    }
    th { 
        background-color: #f8f9fc; 
        font-weight: 700; 
        color: var(--color-text-medium);
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
        position: sticky;
        top: 0;
    }
    tbody tr:hover {
        background-color: #fcfcfc;
    }
    
    .email-text {
        font-weight: 500;
        color: var(--color-secondary);
    }

    .action-column {
        width: 140px;
        text-align: center;
    }
    .btn-action {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        margin: 0 0.2rem;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    .btn-history { color: var(--color-info); }
    .btn-history:hover { background-color: #f5edf7; } /* Light Purple */
    .btn-edit { color: var(--color-success); }
    .btn-edit:hover { background-color: #ebfaef; } /* Light Green */
    .btn-delete { color: var(--color-danger); }
    .btn-delete:hover { background-color: #ffebee; } /* Light Red */

    .no-data-row {
        text-align: center;
        font-style: italic;
        color: var(--color-text-medium);
        padding: 2rem 1.5rem !important;
    }

    /* ------------------------------ Form Validation ------------------------------ */
    .field-error {
      color: var(--color-danger);
      font-size: 0.85rem;
      margin-top: 0.4rem;
      display: block;
    }

    .field-error span {
      display: block;
      margin: 0.2rem 0;
    }

    .form-control:invalid {
      border-color: var(--color-danger);
      background-color: #fff5f5;
    }

    .form-control:valid:not(:placeholder-shown) {
      border-color: var(--color-success);
      background-color: #f5fff8;
    }

    /* ------------------------------ Mobile Responsive ------------------------------ */
  @media (max-width: 992px) {
    .dashboard-container {
      flex-direction: column;
    }

    .main-content {
      padding: 1.5rem 1rem;
      height: auto;
      min-height: 100vh;
    }

    .mobile-header {
      display: flex;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      padding: 1.5rem 0;
      transform: translateX(-100%);
      box-shadow: none;
      z-index: 1000;
      align-items: stretch;
    }

    .sidebar.open {
      transform: translateX(0);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    }

    .sidebar-top {
      justify-content: space-between;
      padding: 0 1.5rem;
      margin-bottom: 2rem;
    }

    .sidebar.open .menu-icon {
      display: flex;
    }

    .sidebar.open .sidebar-logo {
      display: block;
    }

    .sidebar.open .nav-menu {
      align-items: stretch;
    }

    .sidebar.open .nav-menu li {
      justify-content: stretch;
      padding: 0 1.5rem;
    }

    .sidebar.open .nav-menu li a {
      width: 100%;
      justify-content: flex-start;
      padding: 0.75rem 1rem;
    }

    .sidebar.open .nav-menu li a .link-text {
      display: block;
    }

    .sidebar.open .user-info-full {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2rem 1rem;
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    .sidebar.open ~ .sidebar-overlay {
      display: block;
    }
  }

  /* Ensure main area is scrollable even if other rules override it */
  .dashboard-container .main-content {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch;
  }
  `]
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  currentPatient: Patient = this.initPatient();
  showAddForm = false;
  editingPatient = false;
  currentUser: User | null = null;
  showHistoryModal = false;
  selectedPatient: Patient | null = null;
  isSidebarOpen: boolean = false;
  loggedUser: any = null;
  // maxDate used to prevent selecting a future birth date
  maxDate: string = this.getTodayString();

  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private exportService: ExportService
  ) {}

  // Returns today's date in YYYY-MM-DD format for HTML date max attribute
  getTodayString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  ngOnInit(): void {

    // to set both currentUser and loggedUser
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loggedUser = user;
    });
    this.loadPatients();
    
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'add') {
        this.showAddForm = true;
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  getUserRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MEDECIN': return 'Médecin';
      case 'SECRETAIRE': return 'Secrétaire';
      default: return role;
    }
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: patients => {
        this.patients = patients;
        this.notificationService.info('Patients', 'Liste des patients mise à jour.');
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les patients');
      }
    });
  }

  initPatient(): Patient {
    return {
      nom: '',
      prenom: '',
      email: '',
      dateNaissance: '',
      telephone: '',
      antecedents: '',
      allergies: '',
      adressDto: {
        street: '',
        houseNumber: '',
        city: '',
        postalCode: 0,
        country: ''
      }
    };
  }

  savePatient(): void {
    if (this.editingPatient) {
      this.patientService.updatePatient(this.currentPatient.id!, this.currentPatient).subscribe({
        next: (response) => {
          this.loadPatients();
          this.cancelEdit();
          this.notificationService.success('Modification', 'Patient modifié avec succès.');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.notificationService.error('Erreur', 'Impossible de modifier le patient');
        }
      });
    } else {
      this.patientService.createPatient(this.currentPatient).subscribe({
        next: (response) => {
          this.loadPatients();
          this.cancelEdit();
          this.notificationService.success('Création', 'Patient créé avec succès.');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.notificationService.error('Erreur', 'Impossible de créer le patient');
        }
      });
    }
  }

  editPatient(patient: Patient): void {
    // Crée une copie profonde pour éviter de modifier la liste avant la sauvegarde
    this.currentPatient = { 
      ...patient,
      adressDto: patient.adressDto ? { ...patient.adressDto } : this.initPatient().adressDto
    };
    this.editingPatient = true;
    this.showAddForm = true;
  }

  deletePatient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.loadPatients();
          this.notificationService.success('Suppression', 'Patient supprimé avec succès.');
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de supprimer le patient');
        }
      });
    }
  }

  cancelEdit(): void {
    this.currentPatient = this.initPatient();
    this.editingPatient = false;
    this.showAddForm = false;
    this.router.navigate([], {
      queryParams: { action: null },
      queryParamsHandling: 'merge' 
    });
  }

  logout(): void {
    this.closeSidebar();
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('Déconnexion', 'Vous avez été déconnecté avec succès');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  viewHistory(patient: Patient): void {
    this.selectedPatient = patient;
    this.showHistoryModal = true;
  }

  exportPatients(): void {
    // Logic: Calls the service to export the data currently loaded in the view
    this.exportService.exportPatientsToWord(this.patients);
    this.notificationService.success('Export', 'Fiche patients exportée au format Word.');
  }
}