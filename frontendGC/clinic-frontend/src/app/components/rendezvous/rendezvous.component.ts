import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RendezVousService } from '../../services/rendezvous.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { RendezVous, RendezVousRequest, StatutRendezVous } from '../../models/rendezvous.model';
import { Patient } from '../../models/patient.model';
import { Medecin } from '../../models/medecin.model';

@Component({
  selector: 'app-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
            <li class="active">
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
        <!-- Mobile Header -->
        <div class="mobile-header">
          <button class="menu-burger" (click)="toggleSidebar()" title="Ouvrir le menu">☰</button>
          <h2 class="mobile-title">Rendez-vous</h2>
        </div>

        <div class="rendezvous-container">
          
          <div class="header-card">
            <div class="header-info">
              <h2>Gestion des Rendez-vous</h2>
              <span class="subtitle">Planifier, modifier et suivre les consultations</span>
            </div>
            <div class="header-actions">
              <button (click)="loadRendezVous()" class="btn-refresh" title="Actualiser la liste">
                <span class="btn-icon">↻</span>
                <span class="btn-text">Actualiser</span>
              </button>
              <button (click)="showAddForm = !showAddForm" class="btn-primary">
                <span class="btn-icon">{{ showAddForm ? '✖' : '➕' }}</span>
                <span class="btn-text">{{ showAddForm ? 'Annuler' : 'Ajouter un Rendez-vous' }}</span>
              </button>
            </div>
          </div>

          <div *ngIf="showAddForm" class="form-card">
            <h3>{{ editingRendezVous ? 'Modifier' : 'Ajouter' }} un Rendez-vous</h3>
            <form (ngSubmit)="saveRendezVous()" #rendezVousForm="ngForm">
              <div class="form-grid-two">
                <div class="form-group">
                  <label for="patientId">Patient:</label>
                  <select id="patientId" [(ngModel)]="currentRendezVous.patientId" name="patientId" required class="form-control">
                    <option [value]="0" disabled>Sélectionner un patient</option>
                    <option *ngFor="let patient of patients" [value]="patient.id">
                      {{ patient.nom }} {{ patient.prenom }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="medecinId">Médecin:</label>
                  <select id="medecinId" [(ngModel)]="currentRendezVous.medecinId" name="medecinId" required class="form-control">
                    <option [value]="0" disabled>Sélectionner un médecin</option>
                    <option *ngFor="let medecin of medecins" [value]="medecin.id">
                      Dr. {{ medecin.nom }} {{ medecin.prenom }} - {{ medecin.specialite }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="dateHeureDebut">Date et heure:</label>
                  <input id="dateHeureDebut" type="datetime-local" [(ngModel)]="currentRendezVous.dateHeureDebut" name="dateHeureDebut" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="motif">Motif:</label>
                  <input id="motif" [(ngModel)]="currentRendezVous.motif" name="motif" required class="form-control">
                </div>
              </div>
              <div class="form-group form-full-width">
                <label for="salle">Salle:</label>
                <input id="salle" [(ngModel)]="currentRendezVous.salle" name="salle" class="form-control" placeholder="Ex: Salle 101">
              </div>

              <div class="form-actions">
                <button type="button" (click)="cancelEdit()" class="btn-secondary">Annuler</button>
                <button type="submit" [disabled]="!rendezVousForm.valid" class="btn-primary btn-save">Sauvegarder</button>
              </div>
            </form>
          </div>

          <div class="filter-card form-card">
            <h3>Filtres de Recherche</h3>
            <div class="filters-row form-grid-filters">
              <div class="form-group">
                <label for="statusFilter">Statut:</label>
                <select id="statusFilter" [(ngModel)]="statusFilter" (change)="filterRendezVous()" class="form-control">
                  <option value="">Tous les statuts</option>
                  <option value="PLANIFIER">Planifié</option>
                  <option value="CONFIRMER">Confirmé</option>
                  <option value="ANNULER">Annulé</option>
                  <option value="TERMINER">Terminé</option>
                </select>
              </div>
              <div class="form-group">
                <label for="dateFilter">Date:</label>
                <input id="dateFilter" type="date" [(ngModel)]="dateFilter" (change)="filterRendezVous()" class="form-control">
              </div>
              <div class="form-group">
                <label for="medecinFilter">Médecin:</label>
                <select id="medecinFilter" [(ngModel)]="medecinFilter" (change)="filterRendezVous()" class="form-control">
                  <option value="">Tous les médecins</option>
                  <option *ngFor="let medecin of medecins" [value]="medecin.id">
                    Dr. {{ medecin.nom }} {{ medecin.prenom }}
                  </option>
                </select>
              </div>
              <div class="form-group form-actions-align-right">
                <button (click)="clearFilters()" class="btn-secondary btn-clear-filters">
                  <span class="btn-icon">✖</span>
                  <span class="btn-text">Effacer les Filtres</span>
                </button>
              </div>
            </div>
          </div>

          <div class="table-card">
            <div class="table-scroll-wrapper">
              <table class="rendezvous-table">
                <thead>
                  <tr>
                    <th>Date/Heure</th>
                    <th>Patient</th>
                    <th>Médecin</th>
                    <th>Motif</th>
                    <th>Salle</th>
                    <th>Statut</th>
                    <th class="action-column-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rdv of filteredRendezVous">
                    <td>{{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td><span class="patient-text">{{ rdv.patientNom }}</span></td>
                    <td>{{ getMedecinNom(rdv) }}</td>
                    <td>{{ rdv.motif }}</td>
                    <td>🏥 {{ rdv.salle || 'N/A' }}</td>
                    <td>
                      <span class="status-badge" [class]="'status-' + rdv.statut.toLowerCase()">{{ getStatutLabel(rdv.statut) }}</span>
                    </td>
                    <td class="action-column-lg">
                      <button (click)="editRendezVous(rdv)" class="btn-action btn-edit" title="Modifier">✏️</button>
                      <button (click)="cancelRendezVous(rdv.id!)" class="btn-action btn-cancel" 
                              *ngIf="rdv.statut !== 'ANNULER'" 
                              [disabled]="!canCancelRendezVous(rdv)"
                              [title]="!canCancelRendezVous(rdv) ? 'Annulation impossible (moins de 24h)' : 'Annuler le RDV'">🚫</button>
                      <button (click)="deleteRendezVous(rdv.id!)" class="btn-action btn-delete" title="Supprimer">🗑️</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredRendezVous.length === 0">
                    <td colspan="7" class="no-data-row">Aucun rendez-vous trouvé.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Color Palette */
    :host {
      --color-white: #ffffff;
      --color-background: #f7f9fc;
      --color-text-dark: #2c3e50;
      --color-text-medium: #8895a7;
      --color-sidebar: #ffffff;
      --color-primary: #1abc9c;
      --color-secondary: #3498db;
      --color-danger: #e74c3c;
      --color-success: #2ecc71;
      --color-info: #9b59b6;
      --color-warning: #f1c40f;
      
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
      /* Flexible main area that can scroll inside the dashboard container */
      flex: 1 1 auto;
      min-height: 0;
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

    /* ------------------------------ Main Content & Cards ------------------------------ */
    .rendezvous-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .header-card {
      background: var(--color-card-bg);
      padding: 1.5rem 2rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-info h2 {
      font-size: 1.8rem;
      color: var(--color-text-dark);
      margin: 0 0 0.25rem 0;
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
      flex-wrap: wrap;
    }

    /* ------------------------------ Forms & Filters ------------------------------ */
    .form-card, .filter-card {
      background: var(--color-card-bg);
      padding: 2rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
    }

    .form-card h3, .filter-card h3 {
      color: var(--color-primary);
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-grid-two {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .form-grid-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      align-items: end;
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
      font-size: 0.95rem;
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

    .form-actions-align-right {
      display: flex;
      justify-content: flex-end;
    }

    .btn-clear-filters {
      margin-bottom: 0 !important;
    }

    /* ------------------------------ Buttons ------------------------------ */
    .btn-primary, .btn-secondary, .btn-refresh {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon {
      font-size: 1.1rem;
    }

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

    .btn-refresh {
      background-color: var(--color-secondary);
      color: white;
    }

    .btn-refresh:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    /* ------------------------------ Table ------------------------------ */
    .table-card {
      background: var(--color-card-bg);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      overflow: hidden;
    }

    .table-scroll-wrapper {
      overflow-x: auto;
    }

    .rendezvous-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th, td {
      padding: 1rem 1.5rem;
      text-align: left;
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
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }

    tbody tr:hover {
      background-color: #fcfcfc;
    }

    .patient-text {
      font-weight: 500;
      color: var(--color-secondary);
    }

    .action-column-lg {
      width: 160px;
      text-align: center;
      white-space: nowrap;
    }

    .btn-action {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      margin: 0 0.2rem;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    .btn-edit {
      color: var(--color-success);
    }

    .btn-edit:hover {
      background-color: #ebfaef;
    }

    .btn-delete {
      color: var(--color-danger);
    }

    .btn-delete:hover {
      background-color: #ffebee;
    }

    .btn-cancel {
      color: var(--color-warning);
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #fffbe6;
    }

    .btn-cancel:disabled {
      color: #bdc3c7;
      cursor: not-allowed;
    }

    .status-badge {
      display: inline-block;
      padding: 0.35rem 0.7rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .status-planifier {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-confirmer {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-annuler {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-terminer {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .no-data-row {
      text-align: center;
      font-style: italic;
      color: var(--color-text-medium);
      padding: 2rem 1.5rem !important;
    }

    /* ------------------------------ Mobile Adjustments ------------------------------ */
    @media (max-width: 768px) {
      .header-card {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.25rem;
      }

      .header-actions {
        width: 100%;
      }

      .btn-refresh,
      .btn-primary {
        flex: 1;
        justify-content: center;
      }

      .btn-text {
        display: none;
      }

      .form-card, .filter-card {
        padding: 1.5rem;
      }

      .form-grid-two,
      .form-grid-filters {
        grid-template-columns: 1fr;
      }

      .btn-clear-filters {
        width: 100%;
        justify-content: center;
      }

      .rendezvous-table {
        font-size: 0.85rem;
      }

      th, td {
        padding: 0.75rem 0.5rem;
      }

      .action-column-lg {
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

      .table-scroll-wrapper {
        margin: 0 -0.75rem;
        padding: 0 0.75rem;
      }

      .header-actions {
        flex-direction: column;
      }

      .btn-refresh,
      .btn-primary {
        width: 100%;
      }
    }
  `]
})
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  currentRendezVous: RendezVousRequest = this.initRendezVous();
  showAddForm = false;
  editingRendezVous = false;
  editingId?: number;
  statusFilter = '';
  dateFilter = '';
  medecinFilter = '';
  isSidebarOpen: boolean = false;
  loggedUser: any = null;

  constructor(
    private rendezVousService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.loggedUser = user;
      if (user) {
        this.notificationService.connectWebSocket();
      }
    });

    this.loadRendezVous();
    this.loadPatients();
    this.loadMedecins();
    
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

  loadRendezVous(): void {
    this.rendezVousService.getAllRendezVous().subscribe({
      next: rendezVous => {
        this.rendezVous = rendezVous;
        this.filterRendezVous();
        this.notificationService.info('Rendez-vous', `${rendezVous.length} rendez-vous chargés`);
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les rendez-vous');
      }
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe(medecins => {
      this.medecins = medecins;
    });
  }

  initRendezVous(): RendezVousRequest {
    return {
      dateHeureDebut: '',
      motif: '',
      salle: '',
      patientId: 0,
      medecinId: 0
    };
  }

  getMedecinNom(rdv: RendezVous): string {
    if (rdv.medecinDTO) {
      return `Dr. ${rdv.medecinDTO.prenom} ${rdv.medecinDTO.nom}`;
    }
    return 'N/A';
  }

  getStatutLabel(statut: StatutRendezVous): string {
    switch (statut) {
      case 'PLANIFIER': return 'Planifié';
      case 'CONFIRMER': return 'Confirmé';
      case 'ANNULER': return 'Annulé';
      case 'TERMINER': return 'Terminé';
      default: return statut;
    }
  }

  saveRendezVous(): void {
    console.log('Saving rendez-vous:', this.currentRendezVous);
    
    if (this.editingRendezVous && this.editingId) {
      console.log('Updating rendez-vous with ID:', this.editingId);
      this.rendezVousService.updateRendezVous(this.editingId, this.currentRendezVous).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.loadRendezVous();
          this.cancelEdit();
          this.notificationService.success('Succès', 'Rendez-vous modifié avec succès');
        },
        error: (error) => {
          console.error('Update error:', error);
          const errorMsg = this.getErrorMessage(error);
          this.notificationService.error('Erreur', errorMsg);
        }
      });
    } else {
      console.log('Creating new rendez-vous');
      this.rendezVousService.createRendezVous(this.currentRendezVous).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.loadRendezVous();
          this.cancelEdit();
          this.notificationService.success('Succès', 'Rendez-vous créé avec succès');
        },
        error: (error) => {
          console.error('Create error:', error);
          const errorMsg = this.getErrorMessage(error);
          this.notificationService.error('Erreur', errorMsg);
        }
      });
    }
  }

  editRendezVous(rdv: RendezVous): void {
    this.currentRendezVous = {
      dateHeureDebut: rdv.dateHeureDebut,
      motif: rdv.motif,
      salle: rdv.salle,
      patientId: rdv.patientId,
      medecinId: rdv.medecinDTO?.id || 0
    };
    this.editingId = rdv.id;
    this.editingRendezVous = true;
    this.showAddForm = true;
  }

  cancelRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.rendezVousService.cancelRendezVous(id).subscribe({
        next: () => {
          this.loadRendezVous();
          this.notificationService.success('Succès', 'Rendez-vous annulé avec succès');
        },
        error: (error) => {
          const errorMsg = this.getErrorMessage(error);
          this.notificationService.error('Erreur', errorMsg);
        }
      });
    }
  }

  deleteRendezVous(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rendezVousService.deleteRendezVous(id).subscribe({
        next: () => {
          this.loadRendezVous();
          this.notificationService.success('Succès', 'Rendez-vous supprimé avec succès');
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de supprimer le rendez-vous');
        }
      });
    }
  }

  cancelEdit(): void {
    this.currentRendezVous = this.initRendezVous();
    this.editingRendezVous = false;
    this.editingId = undefined;
    this.showAddForm = false;
    this.router.navigate([], {
      queryParams: { action: null },
      queryParamsHandling: 'merge' 
    });
  }

  filterRendezVous(): void {
    this.filteredRendezVous = this.rendezVous.filter(rdv => {
      const matchesStatus = !this.statusFilter || rdv.statut === this.statusFilter;
      const matchesDate = !this.dateFilter || rdv.dateHeureDebut.startsWith(this.dateFilter);
      const matchesMedecin = !this.medecinFilter || rdv.medecinDTO?.id?.toString() === this.medecinFilter;
      return matchesStatus && matchesDate && matchesMedecin;
    });
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.dateFilter = '';
    this.medecinFilter = '';
    this.filterRendezVous();
    this.notificationService.info('Filtres', 'Filtres effacés. Affichage de tous les rendez-vous.');
  }

  private getErrorMessage(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  canCancelRendezVous(rdv: RendezVous): boolean {
    if (rdv.statut === 'ANNULER') return false;
    const rdvDate = new Date(rdv.dateHeureDebut);
    const now = new Date();
    const diffHours = (rdvDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
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
}