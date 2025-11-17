import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { ChatComponent } from '../shared/chat.component';
import { ChatContactsComponent } from '../shared/chat-contacts.component';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/auth.model';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationToastComponent } from '../shared/notification-toast.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-secretaire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProfileModalComponent, NotificationsComponent, NotificationToastComponent, ChatComponent, ChatContactsComponent],
  template: `
    <div class="dashboard-container">
      <app-notifications [isVisible]="showNotifications"></app-notifications>
      <app-notification-toast></app-notification-toast>
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <div class="nav-search">
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onSearch()" 
              placeholder="Rechercher patients, RDV..."
              class="search-input">
          </div>
        </div>
        <div class="nav-actions">
          <button (click)="toggleNotifications()" class="nav-btn" title="Notifications">
            🔔 <span class="badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
          </button>
          <button (click)="toggleChat()" class="nav-btn" title="Messages">
            💬 <span class="badge" *ngIf="totalUnreadMessages > 0">{{ totalUnreadMessages }}</span>
          </button>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">Bienvenue, {{ currentUser.prenom }} !</span>
          <span class="user-role-badge role-secretaire">SECRÉTAIRE</span>
        </div>
      </nav>
      
      <div class="main-content">
        <aside class="sidebar" [class.open]="isSidebarOpen">
          <div class="sidebar-header">
            <button class="close-sidebar" (click)="toggleSidebar()" title="Fermer">✖</button>
          </div>
          <div class="sidebar-content">
            <ul class="nav-menu">
              <li><a routerLink="/secretaire" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">📊 Tableau de bord</a></li>
              <li><a routerLink="/secretaire/patients" routerLinkActive="active">👥 Patients</a></li>
              <li><a routerLink="/secretaire/rendezvous" routerLinkActive="active">📅 Rendez-vous</a></li>
              <li><a routerLink="/secretaire/prescriptions" routerLinkActive="active">💊 Prescriptions</a></li>
              <li><a routerLink="/secretaire/factures" routerLinkActive="active">💰 Factures</a></li>
            </ul>
          </div>
          <div class="sidebar-footer">
            <div class="user-profile" *ngIf="currentUser">
              <div class="user-avatar" (click)="showProfileModal = true">
                <img *ngIf="currentUser.avatarUrl; else defaultAvatar" [src]="currentUser.avatarUrl" alt="Avatar">
                <ng-template #defaultAvatar>👤</ng-template>
              </div>
              <div class="user-details">
                <div class="user-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
                <div class="user-role">Secrétaire</div>
              </div>
            </div>
            <button (click)="logout()" class="btn-logout-sidebar">
              <span class="logout-icon">🚪</span>
              Déconnexion
            </button>
          </div>
        </aside>

        <!-- Overlay -->
        <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>
        
        <main class="content">
          <div class="welcome-section">
            <h2>🌟 Espace Secrétaire</h2>
            <p>Gérez efficacement les patients et les rendez-vous de la clinique</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card patients">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <h3>{{ stats?.totalPatients || 0 }}</h3>
                <p>Patients enregistrés</p>
              </div>
              <button (click)="navigateToPatients()" class="stat-action">Gérer</button>
            </div>
            
            <div class="stat-card appointments">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <h3>{{ stats?.rendezVousAujourdhui || 0 }}</h3>
                <p>RDV aujourd'hui</p>
              </div>
              <button (click)="navigateToRendezVous()" class="stat-action">Voir</button>
            </div>
            
            <div class="stat-card pending">
              <div class="stat-icon">⏰</div>
              <div class="stat-info">
                <h3>{{ stats?.rendezVousEnAttente || 0 }}</h3>
                <p>En attente</p>
              </div>
              <button (click)="navigateToRendezVous()" class="stat-action">Traiter</button>
            </div>
          </div>

          <div class="quick-actions">
            <h3>🚀 Actions Rapides</h3>
            <div class="actions-grid">
              <button (click)="navigateToAddPatient()" class="action-btn add-patient">
                <span class="action-icon">👥➕</span>
                <span class="action-text">Nouveau Patient</span>
              </button>
              
              <button (click)="navigateToAddRendezVous()" class="action-btn add-rdv">
                <span class="action-icon">📅➕</span>
                <span class="action-text">Planifier RDV</span>
              </button>
              
              <button (click)="searchPatient()" class="action-btn search">
                <span class="action-icon">🔍</span>
                <span class="action-text">Rechercher Patient</span>
              </button>
            </div>
          </div>

          <div class="recent-section">
            <h3>📋 Rendez-vous du jour</h3>
            <div class="appointments-list">
              <div *ngFor="let rdv of todayAppointments" class="appointment-card">
                <div class="appointment-time">{{ rdv.dateHeure | date:'HH:mm' }}</div>
                <div class="appointment-patient">
                  <strong>{{ rdv.patient?.prenom }} {{ rdv.patient?.nom }}</strong>
                  <span>Dr. {{ rdv.medecin?.prenom }} {{ rdv.medecin?.nom }}</span>
                </div>
                <div class="appointment-status" [class]="'status-' + rdv.statut?.toLowerCase()">
                  {{ rdv.statut }}
                </div>
              </div>
              <div *ngIf="todayAppointments.length === 0" class="no-appointments">
                <p>Aucun rendez-vous prévu aujourd'hui</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <footer class="global-footer">
        <div class="footer-content">
          © kfokam48 2025 - Gestion Clinique
        </div>
      </footer>
      <app-profile-modal 
        [isVisible]="showProfileModal" 
        [currentUser]="currentUser"
        (closed)="showProfileModal = false"
        (avatarUpdated)="onAvatarUpdated($event)">
      </app-profile-modal>
      
      <app-chat-contacts
        [isVisible]="showChatContacts"
        (closed)="showChatContacts = false"
        (contactSelected)="openChat($event)">
      </app-chat-contacts>
      
      <app-chat
        [isVisible]="showChat"
        [otherUser]="selectedChatUser"
        (closed)="showChat = false">
      </app-chat>
    </div>
  `,
  styles: [`
    .dashboard-container { height: 100vh; background: linear-gradient(135deg, #e8f5e8, #f0f8f0, #e1f5e1); display: flex; flex-direction: column; overflow: hidden; }
    .navbar { background-color: #28a745; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
    .nav-brand h1 { margin: 0; }
    .nav-search { flex: 1; max-width: 500px; }
    .search-container { position: relative; }
    .search-input { width: 100%; padding: 0.75rem 1rem; border: none; border-radius: 25px; font-size: 1rem; outline: none; }
    .nav-user { display: flex; align-items: center; gap: 1rem; }
    .welcome-text { font-weight: 600; }
    .user-role-badge { padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
    .role-secretaire { background: rgba(255,255,255,0.2); color: #fff; }
    .main-content {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .sidebar { width: 250px; background-color: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; }
    .sidebar-content { flex: 1; }
    .nav-menu { list-style: none; padding: 0; margin: 0; }
    .nav-menu li a { display: block; padding: 1rem 1.5rem; text-decoration: none; color: #333; border-bottom: 1px solid #eee; }
    .nav-menu li a:hover, .nav-menu li a.active { background-color: #28a745; color: #fff; }
    .sidebar-footer { padding: 1rem; padding-bottom: 60px; border-top: 1px solid #eee; background: #f8f9fa; }
    .user-profile { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 0.75rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .user-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #fff; cursor: pointer; transition: transform 0.3s; } .user-avatar:hover { transform: scale(1.1); } .user-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .user-details { flex: 1; }
    .user-name { font-weight: bold; font-size: 0.9rem; color: #333; }
    .user-role { font-size: 0.8rem; color: #666; }
    .btn-logout-sidebar { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #dc3545, #c82333); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s ease; }
    .btn-logout-sidebar:hover { background: linear-gradient(135deg, #c82333, #a71e2a); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }
    .logout-icon { font-size: 1.1rem; }
    .content { flex: 1; padding: 2rem; overflow-y: auto; }
    .global-footer { background-color: #f8f9fa; border-top: 1px solid #dee2e6; padding: 1rem 0; flex-shrink: 0; }
    .footer-content { text-align: center; font-size: 0.9rem; color: #666; font-weight: 500; }
    .welcome-section { text-align: center; margin-bottom: 2rem; }
    .welcome-section h2 { color: #333; margin-bottom: 0.5rem; }
    .welcome-section p { color: #666; font-size: 1.1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; position: relative; }
    .stat-card.patients { border-left: 4px solid #007bff; }
    .stat-card.appointments { border-left: 4px solid #28a745; }
    .stat-card.pending { border-left: 4px solid #28a745; }
    .stat-icon { font-size: 2.5rem; }
    .stat-info { flex: 1; }
    .stat-info h3 { font-size: 2rem; margin: 0; color: #333; }
    .stat-info p { margin: 0; color: #666; }
    .stat-action { background: #28a745; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-weight: bold; }
    .quick-actions { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .quick-actions h3 { margin-top: 0; color: #333; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .action-btn { background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: none; padding: 1.5rem; border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .action-btn.add-patient:hover { background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
    .action-btn.add-rdv:hover { background: linear-gradient(135deg, #28a745, #1e7e34); color: white; }
    .action-btn.search:hover { background: linear-gradient(135deg, #28a745, #20c997); color: #fff; }
    .action-icon { font-size: 2rem; }
    .action-text { font-weight: bold; }
    .recent-section { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .recent-section h3 { margin-top: 0; color: #333; }
    .appointments-list { display: flex; flex-direction: column; gap: 1rem; }
    .appointment-card { display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; gap: 1rem; }
    .appointment-time { font-weight: bold; color: #28a745; min-width: 60px; }
    .appointment-patient { flex: 1; }
    .appointment-patient strong { display: block; }
    .appointment-patient span { color: #666; font-size: 0.9rem; }
    .appointment-status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
    .status-programme { background: #e3f2fd; color: #1976d2; }
    .status-confirme { background: #e8f5e8; color: #2e7d32; }
    .no-appointments { text-align: center; padding: 2rem; color: #666; }
    .nav-actions { display: flex; gap: 0.5rem; }
    .nav-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem; border-radius: 50%; cursor: pointer; font-size: 1.2rem; position: relative; transition: all 0.3s ease; }
    .nav-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .badge { position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }
    .global-footer { background: #f8f9fa; border-top: 1px solid #dee2e6; padding: 1rem 0; text-align: center; color: #666; }

    /* Base Styles */
.dashboard-container {
  height: 100vh;
  background: linear-gradient(rgba(255,255,255,0.3), rgba(0,123,255,0.2)), 
              url('https://i.pinimg.com/1200x/f3/c1/31/f3c1314cadebf0f14890d295061ce3f6.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Navbar */
.navbar { background-color: #72c9b2ff; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-shrink: 0; position: relative; z-index: 10; }
.menu-burger { display: none; background: none; border: none; color: white; font-size: 1.8rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: background-color 0.2s; }
.menu-burger:hover { background-color: rgba(255, 255, 255, 0.2); }
.nav-brand h1 { margin: 0; font-size: 1.5rem; }
.nav-search { flex: 1; max-width: 500px; }
.search-container { position: relative; }
.search-input { width: 100%; padding: 0.75rem 1rem; border: none; border-radius: 25px; font-size: 1rem; outline: none; }
.nav-user { display: flex; align-items: center; gap: 1rem; }
.welcome-text { font-weight: 600; }
.user-role-badge { padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.role-medecin { background: rgba(40,167,69,0.8); color: #fff; }
.nav-actions { display: flex; gap: 0.5rem; }
.nav-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem; border-radius: 50%; cursor: pointer; font-size: 1.2rem; position: relative; transition: all 0.3s ease; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
.nav-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
.badge { position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }

/* Main Content */
.main-content { display: flex; flex: 1; overflow: hidden; position: relative; }

/* Sidebar */
.sidebar { width: 250px; background: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s ease; position: relative; z-index: 100; }
.sidebar-header { display: none; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }
.close-sidebar { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #333; padding: 0.5rem; border-radius: 8px; transition: background-color 0.2s; }
.close-sidebar:hover { background-color: #f0f0f0; }
.sidebar-content { flex: 1; overflow-y: auto; }
.nav-menu { list-style: none; padding: 0; margin: 0; }
.av-menu li a { display: block; padding: 1rem 1.5rem; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: all 0.2s; }
.nav-menu li a:hover, .nav-menu li a.active { background-color: #72c9b2ff; color: white; }
.sidebar-footer { padding: 1rem; padding-bottom: 1.5rem; border-top: 1px solid #eee; background: #f8f9fa; }
.user-profile { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 0.75rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.user-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; cursor: pointer; transition: transform 0.3s; flex-shrink: 0; }
.user-avatar:hover { transform: scale(1.1); }
.user-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.user-details { flex: 1; }
.user-name { font-weight: bold; font-size: 0.9rem; color: #333; }
.user-role { font-size: 0.8rem; color: #666; }
.btn-logout-sidebar { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #dc3545, #c82333); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s ease; }
.btn-logout-sidebar:hover { background: linear-gradient(135deg, #c82333, #a71e2a); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }
.logout-icon { font-size: 1.1rem; }
.sidebar-overlay { display: none; }

/* Content */
.content { flex: 1; padding: 2rem; overflow-y: auto; }
.welcome-section { text-align: center; margin-bottom: 2rem; }
.welcome-section h2 { color: #333; margin-bottom: 0.5rem; font-size: 2rem; }
.welcome-section p { color: #666; font-size: 1.1rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: rgba(255, 255, 255, 0.9); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; position: relative; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); }
.stat-card.patients { border-left: 4px solid #007bff; }
.stat-card.appointments { border-left: 4px solid #28a745; }
.stat-card.pending { border-left: 4px solid #ffc107; }
.stat-icon { font-size: 2.5rem; }
.stat-info { flex: 1; }
.stat-info h3 { font-size: 2rem; margin: 0; color: #333; }
.stat-info p { margin: 0; color: #666; }
.stat-action { background: #72c9b2ff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
.stat-action:hover { background: #5fb09aff; transform: scale(1.05); }
.quick-actions { background: rgba(255, 255, 255, 0.9); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.quick-actions h3 { margin-top: 0; color: #333; }
.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.action-btn { background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: none; padding: 1.5rem; border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }
.action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.action-btn.add-consultation:hover { background: linear-gradient(135deg, #007bff, #0056b3); color: white; }
.action-btn.search:hover { background: linear-gradient(135deg, #28a745, #1e7e34); color: white; }
.action-btn.schedule:hover { background: linear-gradient(135deg, #17a2b8, #138496); color: white; }
.action-btn.prescriptions:hover { background: linear-gradient(135deg, #28a745, #1e7e34); color: white; }
.action-icon { font-size: 2rem; }
.action-text { font-weight: bold; text-align: center; }
.revenue-section { margin-bottom: 2rem; background: rgba(255, 255, 255, 0.9); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
.section-header h3 { margin: 0; }
.selectors { display: flex; gap: 1rem; flex-wrap: wrap; }
.year-select, .month-select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
.revenue-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.revenue-card { color: white; padding: 2rem; border-radius: 12px; text-align: center; }
.revenue-card.annual { background: linear-gradient(135deg, #28a745, #20c997); }
.revenue-card.monthly { background: linear-gradient(135deg, #007bff, #0056b3); }
.amount { font-size: 2rem; font-weight: bold; display: block; }
.year-label { font-size: 1rem; opacity: 0.9; display: block; margin-top: 0.5rem; }
.recent-section { background: rgba(255, 255, 255, 0.9); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.recent-section h3 { margin-top: 0; color: #333; }
.appointments-list { display: flex; flex-direction: column; gap: 1rem; }
.appointment-card { display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; gap: 1rem; flex-wrap: wrap; }
.appointment-time { font-weight: bold; color: #007bff; min-width: 60px; }
.appointment-patient { flex: 1; min-width: 150px; }
.appointment-patient strong { display: block; }
.appointment-patient span { color: #666; font-size: 0.9rem; }
.appointment-status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; white-space: nowrap; }
.status-programme { background: #e3f2fd; color: #1976d2; }
.status-confirme { background: #e8f5e8; color: #2e7d32; }
.no-appointments { text-align: center; padding: 2rem; color: #666; }
.global-footer { background-color: #f8f9fa; border-top: 1px solid #dee2e6; padding: 1rem 0; flex-shrink: 0; }
.footer-content { text-align: center; font-size: 0.9rem; color: #666; font-weight: 500; }

/* ------------------------------ Mobile Responsive ------------------------------ */
@media (max-width: 992px) {
  .menu-burger { display: block; }
  .navbar { padding: 1rem; gap: 1rem; }
  .nav-brand h1 { font-size: 1.2rem; }
  .nav-search { display: none; }
  .nav-user { display: none; }
  .sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 280px; transform: translateX(-100%); z-index: 1000; }
  .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15); }
  .sidebar-header { display: flex; justify-content: flex-end; }
  .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 999; }
  .sidebar.open ~ .sidebar-overlay { display: block; }
  .content { padding: 1.5rem 1rem; }
  .welcome-section h2 { font-size: 1.5rem; }
  .welcome-section p { font-size: 1rem; }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
  .revenue-cards { grid-template-columns: 1fr; }
  .appointment-card { flex-direction: column; align-items: flex-start; }
  .appointment-time { width: 100%; }
}

@media (max-width: 576px) {
  .navbar { padding: 0.75rem; }
  .nav-brand h1 { font-size: 1rem; }
  .nav-actions { gap: 0.25rem; }
  .nav-btn { width: 35px; height: 35px; font-size: 1rem; }
  .content { padding: 1rem 0.75rem; }
  .stat-card { padding: 1rem; }
  .stat-icon { font-size: 2rem; }
  .stat-info h3 { font-size: 1.5rem; }
  .actions-grid { grid-template-columns: 1fr; }
  .action-btn { padding: 1rem; }
  .action-icon { font-size: 1.5rem; }
  .amount { font-size: 1.5rem; }
}

  `]
})
export class SecretaireDashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: any = {};
  todayAppointments: any[] = [];
  searchQuery = '';
  showProfileModal = false;
  notificationCount = 0;
  showNotifications = false;
  showChatContacts = false;
  showChat = false;
  selectedChatUser: any = null;
  totalUnreadMessages = 0;
  isSidebarOpen = false; // for mobile

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.notificationService.connectWebSocket();
        this.subscribeToNotifications();
      }
    });
    this.loadData();
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

  loadData(): void {
    this.dashboardService.getStats().subscribe({
      next: stats => this.stats = stats,
      error: () => this.stats = { totalPatients: 0, rendezVousAujourdhui: 0, rendezVousEnAttente: 0 }
    });

    this.dashboardService.getRecentRendezVous().subscribe({
      next: rdv => this.todayAppointments = rdv,
      error: () => this.todayAppointments = []
    });
  }

  navigateToPatients(): void {
    this.router.navigate(['/secretaire/patients']);
  }

  navigateToRendezVous(): void {
    this.router.navigate(['/secretaire/rendezvous']);
  }

  navigateToAddPatient(): void {
    this.router.navigate(['/secretaire/patients'], { queryParams: { action: 'add' } });
  }

  navigateToAddRendezVous(): void {
    this.router.navigate(['/secretaire/rendezvous'], { queryParams: { action: 'add' } });
  }

  searchPatient(): void {
    this.router.navigate(['/secretaire/patients'], { queryParams: { search: true } });
  }

  onSearch(): void {
    if (this.searchQuery.length > 2) {
      // Logique de recherche
    }
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  subscribeToNotifications(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notificationCount = this.notificationService.getUnreadCount();
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  toggleChat(): void {
    this.showChatContacts = !this.showChatContacts;
  }

  openChat(user: any): void {
    this.selectedChatUser = user;
    this.showChat = true;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('Déconnexion', 'À bientôt !');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}