import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileModalComponent } from './shared/profile-modal.component'; 
import { PaginationComponent } from './shared/pagination.component'; 
import { DashboardService } from '../services/dashboard.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth.model';

// DÉFINITION LOCALE DES TYPES POUR CORRIGER L'ERREUR DE 'facture.model'
export type StatutFacture = 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE';

export interface Facture {
  id?: number;
  numeroFacture: string;
  patientId: number;
  dateEmission: string; // Format ISO string ou Date
  montant: number;
  statut: StatutFacture;
}

@Component({
  selector: 'app-admin-factures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfileModalComponent, PaginationComponent, DatePipe], 
  template: `
    <div class="dashboard-container">
  
  <!-- Sidebar -->
  <aside class="sidebar" [class.open]="isSidebarOpen">
    <div class="sidebar-top">
      <button class="menu-icon" (click)="toggleSidebar()" title="Fermer le menu">
        <!--<span class="icon">✖</span>-->
        <span class="sidebar-logo">Gestion Clinic</span>
      </button>
      <!--<div class="sidebar-logo" *ngIf="isSidebarOpen">Gestion Clinic</div>-->
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
    
    <div class="sidebar-footer" *ngIf="currentUser">
      <!-- Full user info (shown when sidebar is expanded / on mobile when open) -->
      <div class="user-info-full">
        <div class="user-profile" (click)="showProfileModal = true" title="Mon Profil">
          <div class="user-avatar">
            <span>👤</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ currentUser.prenom }}</span>
            <span class="user-role">{{ getUserRoleLabel(currentUser.role) }}</span>
          </div>
        </div>
        <button (click)="logout()" class="btn-logout" title="Déconnexion">
          <span class="icon">🚪</span>
        </button>
      </div>

      <!-- Compact avatar shown when sidebar is collapsed (desktop) -->
      <div class="user-compact" *ngIf="!isSidebarOpen">
        <div class="user-avatar" (click)="showProfileModal = true" title="Mon Profil">
          <span>👤</span>
        </div>
      </div>
    </div>
  </aside>
  
  <!-- Overlay -->
  <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>
  
  <!-- Main Content -->
  <main class="main-content">
    <div class="mobile-header">
      <button class="menu-burger" (click)="toggleSidebar()" title="Ouvrir le menu">☰</button>
      <h2 class="mobile-title">Facturation</h2>
    </div>

    <div class="factures-container">
      
      <div class="header-card">
        <div class="header-info">
          <h2>Facturation Clinique</h2>
          <span class="subtitle">Gestion et suivi des factures émises</span>
        </div>
        <div class="header-actions">
          <button (click)="loadFactures()" class="btn-refresh" title="Actualiser la liste">
            <span class="btn-icon">↻</span>
            <span class="btn-text">Actualiser</span>
          </button>
          <button (click)="exportFactures()" class="btn-export" title="Exporter la liste en PDF">
            <span class="btn-icon">⬇️</span>
            <span class="btn-text">Exporter PDF</span>
          </button>
        </div>
      </div>

      <div class="filter-card form-card">
        <h3>Filtres et Recherche</h3>
        <div class="filters-row form-grid-three">
          <div class="form-group">
            <label for="numeroFacture">N° Facture:</label>
            <input id="numeroFacture" type="text" [(ngModel)]="filterNumero" 
                   (ngModelChange)="filterFactures()" class="form-control" 
                   placeholder="Rechercher par numéro">
          </div>
          <div class="form-group">
            <label for="statusFilter">Statut:</label>
            <select id="statusFilter" [(ngModel)]="filterStatut" 
                    (ngModelChange)="filterFactures()" class="form-control">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En Attente</option>
              <option value="PAYEE">Payée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div class="form-group">
            <label for="patientFilter">Patient:</label>
            <input id="patientFilter" type="text" [(ngModel)]="filterPatient" 
                   (ngModelChange)="filterFactures()" class="form-control" 
                   placeholder="Rechercher par patient">
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-scroll-wrapper">
          <table class="factures-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Patient</th>
                <th>Date Émission</th>
                <th>Montant (TTC)</th>
                <th>Statut</th>
                <th class="action-column-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let facture of getPaginatedFactures(filteredFactures)">
                <td><span class="facture-number">{{ facture.numeroFacture }}</span></td>
                <td>{{ getPatientName(facture.patientId) }}</td>
                <td>{{ facture.dateEmission | date:'dd/MM/yyyy' }}</td>
                <td><span class="amount-text">{{ facture.montant | currency:'EUR':'symbol':'1.2-2':'fr' }}</span></td>
                <td>
                  <span class="status-badge" [class]="'status-' + facture.statut.toLowerCase()">
                    {{ getStatutLabel(facture.statut) }}
                  </span>
                </td>
                <td class="action-column-lg">
                  <button (click)="viewFacture(facture)" class="btn-action btn-view" title="Détails">👁️</button>
                  <button (click)="downloadFacture(facture)" class="btn-action btn-download" title="Télécharger PDF">⬇️</button>
                  <button (click)="markFactureAsPaid(facture.id!)" 
                          class="btn-action btn-pay" 
                          *ngIf="facture.statut === 'EN_ATTENTE'"
                          title="Marquer comme payée">✅</button>
                  <button (click)="cancelFacture(facture.id!)" 
                          class="btn-action btn-cancel" 
                          *ngIf="facture.statut !== 'ANNULEE'"
                          title="Annuler la facture">🚫</button>
                </td>
              </tr>
              <tr *ngIf="filteredFactures.length === 0">
                <td colspan="6" class="no-data-row">Aucune facture trouvée avec ces filtres.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <app-pagination 
            [currentPage]="currentPage"
            [totalPages]="getTotalPages(filteredFactures)"
            (pageChange)="onPageChange($event)">
          </app-pagination>
        </div>
      </div>
    </div>

    <app-profile-modal 
      [isVisible]="showProfileModal"
      [currentUser]="currentUser"
      (closeModal)="showProfileModal"
      (avatarUpdated)="onAvatarUpdated($event)">
    </app-profile-modal>
    
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

  --color-paid: var(--color-success);
  --color-pending: var(--color-warning);
  --color-cancelled: var(--color-danger);
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
  border-top: 1px solid #0f0c0cff;
  margin-top: 50px;
}

.user-info-full {
  display: none; /* Hidden by default in collapsed state */
}

/* Show full user info when sidebar is open */
.sidebar.open .user-info-full {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

/* Compact avatar shown when sidebar is collapsed */
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
}

/* When sidebar is open (mobile) hide the compact avatar and show full info */
.sidebar.open .user-compact {
  display: none;
}

/* Default state - show compact for collapsed sidebar */
.user-compact {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
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
.factures-container {
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

.form-grid-three {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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

/* ------------------------------ Buttons ------------------------------ */
.btn-primary, .btn-secondary, .btn-refresh, .btn-export {
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

.btn-refresh {
  background-color: var(--color-secondary);
  color: white;
}

.btn-refresh:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-export {
  background-color: var(--color-info);
  color: white;
}

.btn-export:hover {
  background-color: #8e44ad;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
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

.factures-table {
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

.facture-number {
  font-weight: 600;
  color: var(--color-text-dark);
}

.amount-text {
  font-weight: 700;
  color: var(--color-success);
}

.action-column-lg {
  width: 180px;
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

.btn-view {
  color: var(--color-secondary);
}

.btn-view:hover {
  background-color: #ebf5ff;
}

.btn-download {
  color: var(--color-info);
}

.btn-download:hover {
  background-color: #f3e5f5;
}

.btn-pay {
  color: var(--color-success);
}

.btn-pay:hover {
  background-color: #ebfaef;
}

.btn-cancel {
  color: var(--color-danger);
}

.btn-cancel:hover {
  background-color: #ffebee;
}

/* ------------------------------ Status Badges ------------------------------ */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-en_attente {
  background-color: #fef7e6;
  color: #e67e22;
}

.status-payee {
  background-color: #e8f5e8;
  color: var(--color-success);
}

.status-annulee {
  background-color: #ffebee;
  color: var(--color-danger);
}

.no-data-row {
  text-align: center;
  font-style: italic;
  color: var(--color-text-medium);
  padding: 2rem 1.5rem !important;
}

.table-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
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
    justify-content: stretch;
  }

  .btn-refresh,
  .btn-export {
    flex: 1;
    justify-content: center;
  }

  .btn-text {
    display: none;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-grid-three {
    grid-template-columns: 1fr;
  }

  .factures-table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.75rem;
  }

  .action-column-lg {
    width: auto;
  }
}

@media (max-width: 576px) {
  .main-content {
    padding: 1rem 0.75rem;
  }

  .header-info h2 {
    font-size: 1.4rem;
  }

  .table-scroll-wrapper {
    margin: 0 -1rem;
    padding: 0 1rem;
  }
}
  `]
})
export class AdminFacturesComponent implements OnInit {
  // Propriétés existantes (simulées ou réelles)
  currentUser: User | null = null;
  factures: Facture[] = [];
  filteredFactures: Facture[] = [];
  patients: { id: number, nom: string, prenom: string }[] = []; 
  showProfileModal: boolean = false;
  currentPage: number = 0;
  pageSize: number = 10;
  
  // Filtres
  filterNumero: string = '';
  filterStatut: string = '';
  filterPatient: string = '';

  // Nouvelle propriété pour le comportement responsive
  isSidebarOpen: boolean = false; // For mobile overlay
  isSidebarExpanded: boolean = false; // For desktop toggle

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.notificationService.connectWebSocket();
      }
    });

    this.loadFactures();
    /*this.loadCurrentUser();*/
    this.loadPatients(); 
  }

  // Nouvelle méthode pour le comportement responsive
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Prevent body scroll when sidebar is open on mobile
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close sidebar when navigating (useful for mobile)
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
  
  /*loadCurrentUser(): void {
    // Logique pour charger l'utilisateur actuel (simulée ici)
    this.currentUser = { 
        id: 1, 
        email: 'admin@clinic.com', 
        nom: 'Dupont', 
        prenom: 'Jean', 
        role: 'ADMIN' 
    } as User;
  }*/

  loadFactures(): void {
    this.dashboardService.getAllFactures().subscribe({
      next: (data: Facture[]) => {
        this.factures = data;
        this.filterFactures(); 
        this.notificationService.info('Factures', `${this.factures.length} factures chargées.`);
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les factures.');
      }
    });
  }

  loadPatients(): void {
    this.patients = [
        { id: 101, nom: 'Martin', prenom: 'Sophie' },
        { id: 102, nom: 'Bernard', prenom: 'Luc' },
        { id: 103, nom: 'Dubois', prenom: 'Marie' },
    ];
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  }

  getStatutLabel(statut: StatutFacture): string {
    switch (statut) {
        case 'EN_ATTENTE': return 'En Attente';
        case 'PAYEE': return 'Payée';
        case 'ANNULEE': return 'Annulée';
        default: return statut;
    }
  }

  filterFactures(): void {
    this.filteredFactures = this.factures.filter(facture => {
      const matchesNumero = !this.filterNumero || facture.numeroFacture.toLowerCase().includes(this.filterNumero.toLowerCase());
      const matchesStatut = !this.filterStatut || facture.statut === this.filterStatut;
      const patientName = this.getPatientName(facture.patientId).toLowerCase();
      const matchesPatient = !this.filterPatient || patientName.includes(this.filterPatient.toLowerCase());
      
      return matchesNumero && matchesStatut && matchesPatient;
    });
    this.currentPage = 0; 
  }

  getPaginatedFactures(factures: Facture[]): Facture[] {
    const facturesArray = factures || this.factures;
    const startIndex = this.currentPage * this.pageSize;
    return facturesArray.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(factures: Facture[]): number {
    return Math.ceil(factures.length / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  exportFactures(): void {
    this.notificationService.info('Exportation', 'Fonctionnalité d\'exportation en cours de développement.');
  }

  viewFacture(facture: Facture): void {
    this.notificationService.info('Détails Facture', `Affichage de la facture ${facture.numeroFacture}.`);
  }

  markFactureAsPaid(id: number): void {
    if (confirm('Marquer cette facture comme PAYÉE ?')) {
        this.dashboardService.updateFactureStatus(id, 'PAYEE').subscribe({
            next: () => {
                this.loadFactures();
                this.notificationService.success('Succès', 'Facture marquée comme PAYÉE.');
            },
            error: () => {
                this.notificationService.error('Erreur', 'Impossible de mettre à jour le statut.');
            }
        });
    }
  }

  cancelFacture(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir ANNULER cette facture ?')) {
        this.dashboardService.updateFactureStatus(id, 'ANNULEE').subscribe({
            next: () => {
                this.loadFactures();
                this.notificationService.success('Succès', 'Facture annulée.');
            },
            error: () => {
                this.notificationService.error('Erreur', 'Impossible d\'annuler la facture.');
            }
        });
    }
  }

  downloadFacture(facture: Facture): void {
    this.dashboardService.downloadFacturePdf(facture.id!).subscribe({
      next: (response) => {
        const blob = response.body;
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${facture.numeroFacture}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.success('Téléchargement', 'Facture téléchargée');
        }
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de télécharger la facture');
      }
    });
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  logout(): void {
    this.closeSidebar(); // Close sidebar before logout
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}