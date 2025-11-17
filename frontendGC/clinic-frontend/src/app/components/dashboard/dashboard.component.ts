import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationToastComponent } from '../shared/notification-toast.component';
import { ChatIntegrationComponent } from '../shared/chat-integration.component';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent, NotificationToastComponent, ChatIntegrationComponent, FormsModule],
  template: `
    <div class="dashboard-container">
      
      <!-- Sidebar -->
    <aside class="sidebar" [class.Expanded]="isSidebarExpanded" [class.open]="isSidebarOpen">
      <div class="sidebar-top">
        <button class="menu-icon" (click)="toggleSidebar()" [title]="isSidebarExpanded ? 'Réduire le menu' : 'Menu'">
          <span *ngIf="!isSidebarExpanded && !isSidebarOpen">☰</span>
          <span *ngIf="isSidebarExpanded || isSidebarOpen">Gestion Clinic</span>
        </button>
      </div>
      <div class="sidebar-menu">
        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" 
              title="Tableau de bord" (click)="closeSidebar()">
              <span class="icon">🏠</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Tableau de bord</span>
            </a>
          </li>
          <li>
            <a routerLink="/patients" routerLinkActive="active" 
              title="Patients" (click)="closeSidebar()">
              <span class="icon">👥</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Patients</span>
            </a>
          </li>
          <li>
            <a routerLink="/rendezvous" routerLinkActive="active" 
              title="Rendez-vous" (click)="closeSidebar()">
              <span class="icon">📅</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Rendez-vous</span>
            </a>
          </li>
          <li [class.disabled]="!canAccessMedecins()">
            <a *ngIf="canAccessMedecins()" routerLink="/medecins" routerLinkActive="active" 
              title="Médecins" (click)="closeSidebar()">
              <span class="icon">👨‍⚕️</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Médecins</span>
            </a>
          </li>
          <li [class.disabled]="!canAccessUsers()">
            <a *ngIf="canAccessUsers()" routerLink="/users" routerLinkActive="active" 
              title="Utilisateurs" (click)="closeSidebar()">
              <span class="icon">⚙️</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Utilisateurs</span>
            </a>
          </li>
          <li *ngIf="currentUser?.role === 'ADMIN'">
            <a routerLink="/admin/factures" routerLinkActive="active" 
              title="Factures" (click)="closeSidebar()">
              <span class="icon">💰</span>
              <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Factures</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="sidebar-footer">
        <div class="user-info-full" *ngIf="(isSidebarExpanded || isSidebarOpen) && currentUser">
          <div class="user-avatar-lg">👤</div>
          <div class="user-details">
            <strong>{{ currentUser.prenom }}</strong>
            <small>{{ getUserRoleLabel(currentUser.role) }}</small>
          </div>
        </div>
        <div class="user-info-collapsed" *ngIf="!isSidebarExpanded && !isSidebarOpen && currentUser">
          <div class="user-avatar-small" title="{{ currentUser.prenom }} {{ currentUser.nom }}">👤</div>
        </div>
        <button (click)="logout()" class="logout-btn" title="Déconnexion">
          <span class="icon">🚪</span>
          <span *ngIf="isSidebarExpanded || isSidebarOpen" class="link-text">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>
      
      <main class="main-content">

      <!-- Mobile Header -->
      <div class="mobile-header">
        <button class="menu-burger" (click)="toggleSidebar()" title="Ouvrir le menu">☰</button>
        <h2 class="mobile-title">Dashboard</h2>
      </div>

        <div class="content-left">
          
          <header class="content-header">
            <div class="search-bar-container">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (input)="onSearch()" 
                placeholder="Rechercher patients, médecins, RDV..."
                class="search-input">
              <div *ngIf="searchResults.length > 0" class="search-results">
                <div *ngFor="let result of searchResults" class="search-result-item" (click)="selectResult(result)">
                  <div class="result-type">{{ getTypeLabel(result.type) }}</div>
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-subtitle">{{ result.subtitle }}</div>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <span class="filter-label">Filtrer par</span>
              <select class="filter-dropdown">
                <option>Ce mois</option>
                <option>Le mois dernier</option>
              </select>
            </div>
          </header>

          <div class="welcome-text-bar">
            <h2>Bonjour, {{ currentUser?.prenom || 'Utilisateur' }} !</h2>
            <div class="header-icons">
              <button (click)="toggleNotifications()" class="header-btn" title="Notifications">
                <span class="badge-dot" *ngIf="notificationCount > 0"></span>
                <span class="icon">🔔</span>
              </button>
              <button (click)="showHelp()" class="header-btn" title="Aide">
                <span class="icon">💬</span>
              </button>
              <button (click)="showQuickActions()" class="header-btn" title="Paramètres">
                <span class="icon">⚙️</span>
              </button>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card stat-patient">
              <span class="stat-icon dot-blue">👥</span>
              <div class="stat-info">
                <p>Patients</p>
                <h3>{{ stats?.totalPatients || 0 }}</h3>
                <span class="stat-detail">Total enregistrés</span>
              </div>
            </div>
            <div class="stat-card stat-medecin">
              <span class="stat-icon dot-teal">👨‍⚕️</span>
              <div class="stat-info">
                <p>Médecins</p>
                <h3>{{ stats?.totalMedecins || 0 }}</h3>
                <span class="stat-detail">Personnels actifs</span>
              </div>
            </div>
            <div class="stat-card stat-rdv-today">
              <span class="stat-icon dot-purple">📅</span>
              <div class="stat-info">
                <p>RDV Aujourd'hui</p>
                <h3>{{ stats?.rendezVousAujourdhui || 0 }}</h3>
                <span class="stat-detail">Rendez-vous du jour</span>
              </div>
            </div>
            <div class="stat-card stat-rdv-pending">
              <span class="stat-icon dot-orange">⏰</span>
              <div class="stat-info">
                <p>RDV En Attente</p>
                <h3>{{ stats?.rendezVousEnAttente || 0 }}</h3>
                <span class="stat-detail">À confirmer/À venir</span>
              </div>
            </div>
          </div>
          
          <div class="bottom-section">
            
            <div class="panel-card recent-appointments-panel">
              <h4>Rendez-vous Récents</h4>
              <p class="appointments-detail">Voir la liste complète sur la page <a routerLink="/rendezvous">Rendez-vous</a>.</p>
              
              <div class="appointment-list-mini">
                <div *ngFor="let rdv of recentRendezVous.slice(0, 5)" class="appointment-item-mini" (click)="showAppointmentDetail(rdv)">
                  <div class="appointment-icon">🕒</div>
                  <div class="appointment-info-mini">
                    <strong>{{ rdv.patient?.prenom }} {{ rdv.patient?.nom }}</strong>
                    <span>Dr. {{ rdv.medecin?.prenom }} {{ rdv.medecin?.nom }}</span>
                  </div>
                  <div class="appointment-status-mini" [class]="'status-' + rdv.statut?.toLowerCase()">{{ rdv.statut }}</div>
                </div>
                <div *ngIf="recentRendezVous.length === 0" class="no-data">
                  Aucun rendez-vous récent trouvé.
                </div>
              </div>
            </div>
            
            <div class="panel-card quick-actions-grid">
              <button (click)="navigateToAddRendezVous()" class="action-tile tile-blue">
                <span class="action-icon-lg">📅</span>
                <p>Créer un RDV</p>
              </button>
              <button (click)="navigateToAddPatient()" class="action-tile tile-teal">
                <span class="action-icon-lg">👤</span>
                <p>Ajouter un Patient</p>
              </button>
              <button (click)="canAccessMedecins() && navigateToAddMedecin()" [disabled]="!canAccessMedecins()" class="action-tile tile-purple">
                <span class="action-icon-lg">👨‍⚕️</span>
                <p>Ajouter un Médecin</p>
              </button>
              <a routerLink="/admin/factures" class="action-tile tile-dark-green">
                <span class="action-icon-lg">📈</span>
                <p>Rapport du mois</p>
              </a>
            </div>
          </div>

          <div *ngIf="currentUser?.role === 'ADMIN'" class="revenue-section panel-card">
            <h4>💰 Revenus de l'Hôpital</h4>
            <div class="revenue-controls">
              <label>Année:</label>
              <select [(ngModel)]="selectedYear" (change)="onYearChange()" class="year-select">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <label>Mois:</label>
              <select [(ngModel)]="selectedMonth" (change)="onMonthChange()" class="month-select">
                <option *ngFor="let month of months" [value]="month.value">{{ month.name }}</option>
              </select>
            </div>
            <div class="revenue-cards">
              <div class="revenue-display annual">
                <div class="revenue-amount">{{ revenuAnnuel | number:'1.0-0' }} FCFA</div>
                <div class="revenue-label">Revenus {{ selectedYear }}</div>
                <button (click)="showFacturesDetails()" class="btn-details">📋 Détails</button>
              </div>
              <div class="revenue-display monthly">
                <div class="revenue-amount">{{ revenuMensuel | number:'1.0-0' }} FCFA</div>
                <div class="revenue-label">{{ getMonthName(selectedMonth) }} {{ selectedYear }}</div>
              </div>
            </div>
          </div>
          
        </div>
        
        <div class="schedule-column">
          <div class="schedule-header">
            <div class="date-controls">
              <span class="control-icon">〈</span>
              <span class="control-icon">〉</span>
            </div>
            <h4 class="current-date">Aujourd'hui, {{ currentDate | date:'dd MMM' }}</h4>
            <div class="more-options">
              <span class="control-icon">⋯</span>
            </div>
          </div>
          
          <div class="schedule-list">
            <div *ngFor="let rdv of recentRendezVous" class="schedule-wrapper">
                <div class="time-marker">{{ rdv.dateHeure | date:'HH:mm' }}</div>
                <div 
                    class="schedule-item" 
                    [class.item-orange]="rdv.statut === 'PROGRAMME'"
                    [class.item-teal]="rdv.statut === 'CONFIRME'"
                    [class.item-purple]="rdv.statut === 'EN_ATTENTE'"
                    [class.item-green]="rdv.statut === 'TERMINE'"
                    [class.item-blue]="rdv.statut === 'ANNULE'"
                    (click)="showAppointmentDetail(rdv)">
                    <span class="schedule-tag">{{ getStatusLabel(rdv.statut) }}</span>
                    <p class="schedule-details">
                        {{ rdv.patient?.prenom }} {{ rdv.patient?.nom }} | Dr. {{ rdv.medecin?.prenom }} {{ rdv.medecin?.nom }}
                    </p>
                </div>
            </div>
            <div *ngIf="recentRendezVous.length === 0" class="no-data-schedule">
                Aucun RDV prévu pour aujourd'hui.
            </div>
            
            <button class="add-appointment-btn" (click)="navigateToAddRendezVous()" title="Ajouter un RDV">+</button>
          </div>
        </div>
      </main>

      <app-notifications></app-notifications>
      <app-notification-toast></app-notification-toast>
      <app-chat-integration></app-chat-integration>
      
      <div *ngIf="showFacturesModal" class="factures-modal">
        <div class="factures-content">
          <div class="factures-header">
            <h3>📋 Factures {{ selectedYear }}</h3>
            <button (click)="closeFacturesModal()" class="btn-close">✖</button>
          </div>
          <div class="factures-by-month">
            <div *ngFor="let monthGroup of getFacturesByMonth()" class="month-group">
              <div class="month-header">
                <h4>{{ getMonthName(monthGroup.month) }} {{ selectedYear }}</h4>
                <span class="month-total">{{ monthGroup.total | number:'1.0-0' }} FCFA ({{ monthGroup.factures.length }} factures)</span>
              </div>
              <div class="month-factures">
                <div *ngFor="let facture of monthGroup.factures" class="facture-item" (click)="showFactureDetail(facture)">
                  <div><strong>{{ facture.numeroFacture }}</strong></div>
                  <div>{{ facture.dateCreation | date:'dd/MM/yyyy' }} - {{ facture.montantTotal | number:'1.0-0' }} FCFA</div>
                  <div>Statut: {{ facture.statut }}</div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="selectedFacture" class="facture-detail">
            <h4>📎 Détails Facture {{ selectedFacture.numeroFacture }}</h4>
            <div><strong>Date:</strong> {{ selectedFacture.dateCreation | date:'dd/MM/yyyy HH:mm' }}</div>
            <div><strong>Montant:</strong> {{ selectedFacture.montantTotal | number:'1.0-0' }} FCFA</div>
            <div><strong>Statut:</strong> {{ selectedFacture.statut }}</div>
            <button (click)="selectedFacture = null" class="btn-close-detail">Fermer</button>
          </div>
        </div>
      </div>
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
      /* Adjusted colors for consistency */
      --color-purple: #9b59b6;
      --color-green: #2ecc71;
      --color-orange: #e67e22;
      --color-blue: #3498db;
      --color-teal: #1abc9c;
      --color-dark-green: #27ae60;
      
      --color-card-bg: #ffffff;
      --color-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      --border-radius-lg: 16px;
      --border-radius-sm: 10px;
    }

    /* ------------------------------ Layout ------------------------------ */
    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: var(--color-background);
      overflow: hidden;
    }

    /* Sidebar - Left Menu */
.sidebar {
  width: 80px; 
  background-color: var(--color-sidebar);
  box-shadow: 1px 0 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  transition: width 0.3s ease;
}

.sidebar.Expanded {
  width: 250px;
  align-items: stretch;
}

.sidebar-top {
  margin-bottom: 3rem;
}

.sidebar.Expanded .sidebar-top {
  padding: 0 1.5rem;
}

.menu-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-dark);
  cursor: pointer;
  padding: 0.5rem;
  white-space: nowrap;
}

.sidebar-menu {
  flex-grow: 1;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin-bottom: 2rem;
}

.sidebar.Expanded .nav-menu li {
  padding: 0 1.5rem;
}

.nav-menu li a, .nav-menu li span.disabled-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-sm);
  text-decoration: none;
  color: var(--color-text-medium);
  transition: all 0.2s ease;
}

.sidebar.Expanded .nav-menu li a,
.sidebar.Expanded .nav-menu li span.disabled-link {
  width: auto;
  height: auto;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
}

.nav-menu li a:hover {
  background-color: #f0f0f0;
  color: var(--color-text-dark);
}

.nav-menu li.active a {
  background-color: var(--color-teal);
  color: var(--color-white);
}

.nav-menu li.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.nav-menu .icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.nav-menu .link-text {
  white-space: nowrap;
}

.sidebar-footer {
  padding-top: 2rem;
}

.sidebar.Expanded .sidebar-footer {
  padding: 2rem 1.5rem;
  margin-top:1rem;
}

.user-info-full {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar-lg {
  width: 45px;
  height: 45px;
  background: var(--color-blue);
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
}

.user-details strong {
  font-size: 0.95rem;
  color: var(--color-text-dark);
}

.user-details small {
  font-size: 0.8rem;
  color: var(--color-text-medium);
}

.user-info-collapsed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  background: var(--color-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--color-white);
}

.logout-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text-medium);
  transition: all 0.2s;
  border-radius: var(--border-radius-sm);
}

.sidebar.Expanded .logout-btn {
  width: 100%;
  justify-content: flex-start;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.logout-btn:hover {
  background-color: #f0f0f0;
  color: #dc3545;
}

.logout-small-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-medium);
  transition: color 0.2s;
}

.logout-small-btn:hover {
  color: #dc3545;
}

/* Sidebar Overlay */
.sidebar-overlay {
  display: none;
}

/* Mobile Header */
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



    /* Main Content Area */
    .main-content {
      flex-grow: 1;
      display: flex;
      padding: 2rem;
      gap: 2rem;
      overflow: hidden;
    }
    .content-left {
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      overflow-y: auto;
      padding-right: 1rem; 
    }
    .schedule-column {
      flex: 1.3;
      background-color: var(--color-card-bg);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      padding: 2rem;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      max-width: 350px;
      min-width: 300px;
    }

    /* ------------------------------ Header ------------------------------ */
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .search-bar-container {
      position: relative;
      flex: 1;
      max-width: 400px;
      background: #f0f0f0;
      border-radius: var(--border-radius-sm);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
    }
    .search-icon {
      color: var(--color-text-medium);
      margin-right: 1rem;
    }
    .search-input {
      border: none;
      background: none;
      width: 100%;
      font-size: 1rem;
      outline: none;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }
    .filter-label {
      color: var(--color-text-medium);
    }
    .filter-dropdown {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: var(--border-radius-sm);
      background-color: var(--color-white);
      color: var(--color-text-dark);
      outline: none;
    }

    .welcome-text-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .welcome-text-bar h2 {
      font-size: 1.8rem;
      color: var(--color-text-dark);
      margin: 0;
      font-weight: 600;
    }
    .header-icons {
      display: flex;
      gap: 0.5rem;
    }
    .header-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--color-text-dark);
      cursor: pointer;
      position: relative;
    }
    .badge-dot {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      background: var(--color-purple);
      border-radius: 50%;
    }
    
    /* ------------------------------ Stats Grid ------------------------------ */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* Fixed 4 columns */
      gap: 1.5rem;
    }
    .stat-card {
      background: var(--color-card-bg);
      padding: 1.5rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border-left: 5px solid transparent;
      transition: all 0.2s;
    }

    .stat-card.stat-patient { border-left-color: var(--color-blue); }
    .stat-card.stat-medecin { border-left-color: var(--color-teal); }
    .stat-card.stat-rdv-today { border-left-color: var(--color-purple); }
    .stat-card.stat-rdv-pending { border-left-color: var(--color-orange); }

    .stat-icon {
      font-size: 1.2rem;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .dot-blue { background-color: var(--color-blue); color: var(--color-white); }
    .dot-teal { background-color: var(--color-teal); color: var(--color-white); }
    .dot-purple { background-color: var(--color-purple); color: var(--color-white); }
    .dot-orange { background-color: var(--color-orange); color: var(--color-white); }

    .stat-info p {
      color: var(--color-text-medium);
      margin: 0 0 0.25rem 0;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .stat-info h3 {
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
      color: var(--color-text-dark);
      font-weight: 700;
    }
    .stat-detail {
      font-size: 0.8rem;
      color: var(--color-text-medium);
    }

    /* ------------------------------ Bottom Sections ------------------------------ */
    .bottom-section {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 2rem;
    }
    .panel-card {
      background: var(--color-card-bg);
      padding: 1.5rem;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--color-shadow);
      display: flex;
      flex-direction: column;
    }

    /* Recent Appointments Panel */
    .recent-appointments-panel h4 {
      color: var(--color-text-dark);
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .appointments-detail {
      color: var(--color-text-medium);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .appointments-detail a {
        color: var(--color-blue);
        text-decoration: none;
        font-weight: 600;
    }
    .appointment-list-mini {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .appointment-item-mini {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-radius: 8px;
        background: #f8f9fa;
        cursor: pointer;
        transition: background 0.2s;
    }
    .appointment-item-mini:hover {
        background: #f0f0f0;
    }
    .appointment-icon {
        font-size: 1.2rem;
        margin-right: 1rem;
        color: var(--color-blue);
    }
    .appointment-info-mini {
        flex: 1;
    }
    .appointment-info-mini strong {
        display: block;
        font-size: 0.9rem;
        color: var(--color-text-dark);
    }
    .appointment-info-mini span {
        font-size: 0.8rem;
        color: var(--color-text-medium);
    }
    .appointment-status-mini {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
        min-width: 80px;
        text-align: center;
    }
    .status-programme { background: #e3f2fd; color: #1976d2; }
    .status-confirme { background: #e8f5e8; color: #2e7d32; }
    .status-annule { background: #ffebee; color: #c62828; }
    .status-termine { background: #f3e5f5; color: #7b1fa2; }
    .status-en_attente { background: #fffde7; color: #f9a825; }

    .no-data {
        color: var(--color-text-medium);
        padding: 1rem;
        text-align: center;
        font-style: italic;
    }

    /* Quick Actions Grid */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .action-tile {
      border: none;
      border-radius: var(--border-radius-sm);
      color: var(--color-white);
      padding: 1rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      text-align: left;
      transition: transform 0.2s;
      text-decoration: none; /* For the <a> tag */
    }
    .action-tile:hover {
      transform: translateY(-3px);
    }
    .action-icon-lg {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .action-tile p {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .tile-blue { background-color: var(--color-blue); }
    .tile-teal { background-color: var(--color-teal); }
    .tile-purple { background-color: var(--color-purple); }
    .tile-dark-green { background-color: var(--color-dark-green); }


    /* Revenue Section */
    .revenue-section {
        margin-top: 2rem;
    }
    .revenue-section h4 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-weight: 600;
        color: var(--color-text-dark);
    }
    .revenue-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
    }
    .year-select, .month-select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .revenue-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }
    .revenue-display {
        color: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
    }
    .revenue-display.annual {
        background: linear-gradient(135deg, var(--color-dark-green), #4CAF50);
    }
    .revenue-display.monthly {
        background: linear-gradient(135deg, var(--color-blue), #2980b9);
    }
    .revenue-amount {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .revenue-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    .btn-details {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .btn-details:hover {
        background: rgba(255,255,255,0.4);
    }

    /* ------------------------------ Schedule Column ------------------------------ */
    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    .date-controls {
      display: flex;
      gap: 0.5rem;
    }
    .control-icon {
      color: var(--color-text-medium);
      cursor: pointer;
    }
    .current-date {
      color: var(--color-text-dark);
      font-weight: 600;
      margin: 0;
    }
    .schedule-list {
      position: relative;
      flex-grow: 1;
      overflow-y: auto;
      padding-right: 0.5rem;
      padding-bottom: 4rem; 
    }
    .time-marker {
      font-size: 0.8rem;
      color: var(--color-text-medium);
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      position: relative;
      font-weight: 600;
    }
    
    .schedule-item {
      background: #f8f8f8;
      border-radius: var(--border-radius-sm);
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      border-left: 5px solid transparent;
      transition: box-shadow 0.2s;
    }
    .schedule-item:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    .schedule-tag {
      font-weight: 600;
      color: var(--color-text-dark);
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }
    .schedule-details {
      font-size: 0.8rem;
      color: var(--color-text-medium);
      margin: 0;
    }

    /* Schedule Item Colors (Based on statuses) */
    .item-orange { background-color: #fcefe9; border-left-color: var(--color-orange); } /* PROGRAMME */
    .item-teal { background-color: #e9f8f5; border-left-color: var(--color-teal); } /* CONFIRME */
    .item-purple { background-color: #f5edf7; border-left-color: var(--color-purple); } /* EN_ATTENTE */
    .item-green { background-color: #ebfaef; border-left-color: var(--color-dark-green); } /* TERMINE */
    .item-blue { background-color: #eef5fb; border-left-color: var(--color-blue); } /* ANNULE */
    
    .no-data-schedule {
        color: var(--color-text-medium);
        padding: 2rem 1rem;
        text-align: center;
        font-style: italic;
    }

    .add-appointment-btn {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--color-blue);
      color: var(--color-white);
      font-size: 2rem;
      border: none;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      line-height: 50px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* ------------------------------ Search Results & Modal ------------------------------ */
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-white);
      border-radius: var(--border-radius-sm);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      margin-top: 0.5rem;
      padding: 0.5rem;
    }
    .search-result-item {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      color: var(--color-text-dark);
      border-radius: 6px;
    }
    .search-result-item:hover {
      background: #f0f0f0;
    }
    .result-type {
      font-size: 0.75rem;
      color: var(--color-blue);
      font-weight: bold;
      text-transform: uppercase;
    }
    .result-title {
      font-weight: 600;
      margin: 0.25rem 0;
      font-size: 0.95rem;
    }
    .result-subtitle {
      font-size: 0.8rem;
      color: var(--color-text-medium);
    }
    .factures-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    .factures-content {
        background: var(--color-card-bg);
        padding: 2rem;
        border-radius: var(--border-radius-lg);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    }
    .factures-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 1rem;
    }
    .btn-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: var(--color-text-medium);
        cursor: pointer;
    }
    .month-group { 
        border: 1px solid #e0e6ed; 
        border-radius: 8px; 
        margin-bottom: 1rem;
    }
    .month-header { 
        background: #f8f9fa; 
        padding: 1rem; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        border-bottom: 1px solid #e0e6ed; 
    }
    .month-header h4 { margin: 0; color: var(--color-text-dark); font-weight: 600;}
    .month-total { font-weight: bold; color: var(--color-blue); }
    .facture-item {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 0.9rem;
        color: var(--color-text-dark);
    }
    .facture-item:hover {
        background: #f0f0f0;
    }
    .facture-detail {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 1.5rem;
        border-left: 5px solid var(--color-blue);
    }
    .btn-close-detail {
        background: var(--color-blue);
        color: var(--color-white);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 1rem;
        transition: background 0.2s;
    }

    /* ------------------------------ Mobile Responsive ------------------------------ */
  @media (max-width: 992px) {
    .dashboard-container {
      flex-direction: column;
    }

    .main-content {
      padding: 1.5rem 1rem;
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }

    .content-left {
      padding-right: 0;
    }

    .mobile-header {
      display: flex;
    }

    /* Hide desktop toggle, show mobile overlay */
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
    width: 280px;
  }

  .sidebar.Expanded {
    width: 280px;
  }

  .sidebar-top {
    justify-content: space-between;
    padding: 0 1.5rem;
    margin-bottom: 2rem;
  }

  .sidebar.open .menu-icon,
  .sidebar.Expanded .menu-icon {
    display: flex;
  }

  .sidebar.open .nav-menu,
  .sidebar.Expanded .nav-menu {
    align-items: stretch;
  }

  .sidebar.open .nav-menu li,
  .sidebar.Expanded .nav-menu li {
    justify-content: stretch;
    padding: 0 1.5rem;
  }

  .sidebar.open .nav-menu li a,
  .sidebar.Expanded .nav-menu li a {
    width: 100%;
    justify-content: flex-start;
    padding: 0.75rem 1rem;
  }

  .sidebar.open .nav-menu li a .link-text,
  .sidebar.Expanded .nav-menu li a .link-text {
    display: block;
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

  .sidebar.open .sidebar-footer,
  .sidebar.Expanded .sidebar-footer {
    padding: 2rem 1.5rem 0;
    margin-bottom: 50px;
  }

  .sidebar.open .logout-btn{
    padding-left: 70px;
  }

      /* Schedule column goes below on mobile */
      .schedule-column {
        max-width: 100%;
        margin-top: 2rem;
      }
    }

    @media (max-width: 768px) {
      .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .search-bar-container {
        max-width: 100%;
        width: 100%;
      }

      .header-actions {
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .bottom-section {
        grid-template-columns: 1fr;
      }

      .revenue-cards {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 576px) {
      .main-content {
        padding: 1rem 0.75rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }

      .welcome-text-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .welcome-text-bar h2 {
        font-size: 1.4rem;
      }
    }

  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  recentRendezVous: any[] = [];
  searchQuery = '';
  searchResults: SearchResult[] = [];
  notificationCount = 3;
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  revenuAnnuel = 0;
  revenuMensuel = 0;
  currentDate = new Date(); 
  isSidebarExpanded = false; // Desktop toggle
  isSidebarOpen = false; // Mobile overlay

  months = [
    { value: 1, name: 'Janvier' },
    { value: 2, name: 'Février' },
    { value: 3, name: 'Mars' },
    { value: 4, name: 'Avril' },
    { value: 5, name: 'Mai' },
    { value: 6, name: 'Juin' },
    { value: 7, name: 'Juillet' },
    { value: 8, name: 'Août' },
    { value: 9, name: 'Septembre' },
    { value: 10, name: 'Octobre' },
    { value: 11, name: 'Novembre' },
    { value: 12, name: 'Décembre' }
  ];
  showFacturesModal = false;
  factures: any[] = [];
  filteredFactures: any[] = [];
  selectedFacture: any = null;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.notificationService.connectWebSocket();
        if (user.role === 'ADMIN') {
          this.loadRevenue();
          this.loadRevenuMensuel();
        }
      }
    });
    this.loadDashboardData();
  }

  toggleSidebar(): void {
    // Check if we're on mobile
    if (window.innerWidth <= 992) {
      this.isSidebarOpen = !this.isSidebarOpen;
      if (this.isSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      // Desktop toggle
      this.isSidebarExpanded = !this.isSidebarExpanded;
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  loadDashboardData(): void {
    this.dashboardService.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.notificationService.success('Tableau de bord', 'Données chargées avec succès');
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.stats = {
          totalPatients: 0,
          totalMedecins: 0,
          totalRendezVous: 0,
          rendezVousAujourdhui: 0,
          rendezVousEnAttente: 0
        };
        this.notificationService.warning('Tableau de bord', 'Impossible de charger les statistiques');
      }
    });

    this.dashboardService.getRecentRendezVous().subscribe({
      next: rdv => this.recentRendezVous = rdv,
      error: () => {
        this.recentRendezVous = [];
        this.notificationService.info('Tableau de bord', 'Aucun rendez-vous récent trouvé');
      }
    });
  }

  logout(): void {
    this.notificationService.disconnectWebSocket();
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

  onSearch(): void {
    if (this.searchQuery.length > 2) {
      this.searchService.globalSearch(this.searchQuery).subscribe({
        next: results => this.searchResults = results,
        error: () => this.searchResults = []
      });
    } else {
      this.searchResults = [];
    }
  }

  selectResult(result: SearchResult): void {
    this.searchResults = [];
    this.searchQuery = '';
    
    switch (result.type) {
      case 'patient':
        this.router.navigate(['/patients'], { queryParams: { id: result.id } });
        break;
      case 'medecin':
        this.router.navigate(['/medecins'], { queryParams: { id: result.id } });
        break;
      case 'rendezvous':
        this.router.navigate(['/rendezvous'], { queryParams: { id: result.id } });
        break;
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'patient': return 'Patient';
      case 'medecin': return 'Médecin';
      case 'rendezvous': return 'Rendez-vous';
      default: return type;
    }
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PROGRAMME': return 'Programme';
      case 'CONFIRME': return 'Confirmé';
      case 'ANNULE': return 'Annulé';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En Attente';
      default: return status;
    }
  }

  navigateToAddPatient(): void {
    this.router.navigate(['/patients'], { queryParams: { action: 'add' } });
  }

  navigateToAddMedecin(): void {
    if (this.canAccessMedecins()) {
        this.router.navigate(['/medecins'], { queryParams: { action: 'add' } });
    }
  }

  navigateToAddRendezVous(): void {
    this.router.navigate(['/rendezvous'], { queryParams: { action: 'add' } });
  }

  showAppointmentDetail(rdv: any): void {
    if (rdv) {
        this.notificationService.info(
            'Détails du Rendez-vous', 
            `Patient: ${rdv.patient?.prenom} ${rdv.patient?.nom}, Statut: ${this.getStatusLabel(rdv.statut)}`
        );
    } else {
        this.notificationService.info('Rendez-vous', 'Détails non disponibles.');
    }
  }

  toggleNotifications(): void {
    this.notificationService.info('Notifications', 'Aucune nouvelle notification');
    this.notificationCount = 0;
  }

  showQuickActions(): void {
    this.notificationService.info('Actions Rapides', 'Utilisez les tuiles d\'action pour naviguer rapidement.');
  }

  showHelp(): void {
    this.notificationService.info('Aide', 'Utilisez la barre de recherche pour trouver rapidement patients, médecins ou RDV');
  }

  getUserRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MEDECIN': return 'Médecin';
      case 'SECRETAIRE': return 'Secrétaire';
      default: return role;
    }
  }

  canAccessMedecins(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  canAccessUsers(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  loadRevenue(): void {
    this.dashboardService.getRevenuAnnuel(this.selectedYear).subscribe({
      next: (data) => {
        this.revenuAnnuel = data.revenuAnnuel || 0;
      },
      error: () => {
        this.revenuAnnuel = 0;
        this.notificationService.warning('Revenus', 'Impossible de charger le revenu annuel.');
      }
    });
  }

  loadRevenuMensuel(): void {
    this.dashboardService.getRevenuMensuel(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.revenuMensuel = data.revenuMensuel || 0;
      },
      error: () => {
        this.revenuMensuel = 0;
        this.notificationService.warning('Revenus', 'Impossible de charger le revenu mensuel.');
      }
    });
  }

  onYearChange(): void {
    this.loadRevenue();
    this.loadRevenuMensuel();
    this.loadAllFactures(); 
  }

  onMonthChange(): void {
    this.loadRevenuMensuel();
  }

  getMonthName(monthValue: number): string {
    const month = this.months.find(m => m.value === Number(monthValue));
    return month ? month.name : 'Mois inconnu';
  }

  showFacturesDetails(): void {
    this.loadAllFactures();
    this.showFacturesModal = true;
  }

  loadAllFactures(): void {
    this.dashboardService.getAllFactures().subscribe({
      next: (factures) => {
        this.factures = factures.filter(f => new Date(f.dateCreation).getFullYear() === this.selectedYear);
        this.filteredFactures = this.factures;
      },
      error: () => {
        this.factures = [];
        this.filteredFactures = [];
        this.notificationService.warning('Factures', 'Impossible de charger les factures.');
      }
    });
  }

  getFacturesByMonth(): any[] {
    const monthGroups = new Map();
    
    this.factures.forEach(facture => {
      const date = new Date(facture.dateCreation);
      const month = date.getMonth() + 1;
      
      if (!monthGroups.has(month)) {
        monthGroups.set(month, {
          month: month,
          factures: [],
          total: 0
        });
      }
      
      const group = monthGroups.get(month);
      group.factures.push(facture);
      group.total += facture.montantTotal || 0;
    });
    
    return Array.from(monthGroups.values()).sort((a, b) => a.month - b.month);
  }

  showFactureDetail(facture: any): void {
    this.selectedFacture = facture;
  }

  closeFacturesModal(): void {
    this.showFacturesModal = false;
    this.selectedFacture = null;
  }
}