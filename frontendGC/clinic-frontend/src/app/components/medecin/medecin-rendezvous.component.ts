import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RendezVousService } from '../../services/rendezvous.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationToastComponent } from '../shared/notification-toast.component';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-medecin-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationsComponent, NotificationToastComponent, ProfileModalComponent, CalendarComponent],
  template: `
    <div class="dashboard-container">
      <app-notifications [isVisible]="showNotifications"></app-notifications>
      <app-notification-toast></app-notification-toast>
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <div class="nav-actions">
          <button (click)="toggleNotifications()" class="nav-btn" title="Notifications">
            🔔 <span class="badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
          </button>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">Dr. {{ currentUser.prenom }} {{ currentUser.nom }}</span>
          <span class="user-role-badge role-medecin">MÉDECIN</span>
        </div>
      </nav>
      
      <div class="main-content">
        <aside class="sidebar" [class.open]="isSidebarOpen">
          <div class="sidebar-header">
            <button class="close-sidebar" (click)="toggleSidebar()" title="Fermer">✖</button>
          </div>
          <div class="sidebar-content">
            <ul class="nav-menu">
              <li>
                <a routerLink="/medecin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">
                  📊 Tableau de bord
                </a>
              </li>
              <li>
                <a routerLink="/medecin/patients" routerLinkActive="active" (click)="closeSidebar()">
                  👥 Mes Patients
                </a>
              </li>
              <li>
                <a routerLink="/medecin/rendezvous" routerLinkActive="active" (click)="closeSidebar()">
                  📅 Mes Rendez-vous
                </a>
              </li>
              <li>
                <a routerLink="/medecin/prescriptions" routerLinkActive="active" (click)="closeSidebar()">
                  💊 Prescriptions
                </a>
              </li>
            </ul>
          </div>
          <div class="sidebar-footer">
            <div class="user-profile" *ngIf="currentUser">
              <div class="user-avatar" (click)="showProfileModal = true">
                <img *ngIf="currentUser.avatarUrl; else defaultAvatar" [src]="currentUser.avatarUrl" alt="Avatar">
                <ng-template #defaultAvatar>👨‍⚕️</ng-template>
              </div>
              <div class="user-details">
                <div class="user-name">Dr. {{ currentUser.prenom }} {{ currentUser.nom }}</div>
                <div class="user-role">Médecin</div>
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
          <div class="header">
            <h2>📅 Mes Rendez-vous</h2>
            <div class="header-actions">
              <button (click)="toggleUpcoming()" [class]="showUpcoming ? 'btn-primary' : 'btn-secondary'">
                {{ showUpcoming ? '📋 Tous' : '⏰ À venir' }}
              </button>
              <button (click)="loadRendezVous()" class="btn-refresh" type="button">🔄 Actualiser</button>
            </div>
          </div>

          <div class="view-toggle">
            <button (click)="viewMode = 'calendar'" [class.active]="viewMode === 'calendar'" class="btn-toggle">📅 Calendrier</button>
            <button (click)="viewMode = 'list'" [class.active]="viewMode === 'list'" class="btn-toggle">📋 Liste</button>
          </div>

          <!-- Vue Calendrier -->
          <div *ngIf="viewMode === 'calendar'">
            <app-calendar></app-calendar>
          </div>

          <!-- Vue Liste -->
          <div *ngIf="viewMode === 'list'">
            <div class="filter-section">
              <div class="filters">
                <select [(ngModel)]="statusFilter" (change)="filterRendezVous()" class="filter-select">
                  <option value="">Tous les statuts</option>
                  <option value="PLANIFIE">Planifié</option>
                  <option value="CONFIRME">Confirmé</option>
                  <option value="ANNULE">Annulé</option>
                  <option value="TERMINE">Terminé</option>
                </select>
                <input type="date" [(ngModel)]="dateFilter" (change)="filterRendezVous()" class="filter-date">
              </div>
            </div>

            <div class="rdv-timeline">
              <div *ngFor="let rdv of filteredRendezVous" class="rdv-card" [class]="'status-' + rdv.statut?.toLowerCase()">
                <div class="rdv-header">
                  <div class="rdv-time">
                    <strong>{{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</strong>
                  </div>
                  <div class="rdv-status">
                    <span class="status-badge" [class]="'badge-' + rdv.statut?.toLowerCase()">{{ getStatusDisplay(rdv.statut) }}</span>
                  </div>
                </div>
                <div class="rdv-details">
                  <div class="rdv-patient">
                    <h4>👤 {{ rdv.patientNom }}</h4>
                  </div>
                  <div class="rdv-motif" *ngIf="rdv.motif">
                    <p><strong>Motif:</strong> {{ rdv.motif }}</p>
                  </div>
                  <div class="rdv-salle" *ngIf="rdv.salle">
                    <p><strong>🏥 Salle:</strong> {{ rdv.salle }}</p>
                  </div>
                </div>
                <div class="rdv-actions">
                  <button (click)="confirmRendezVous(rdv)" *ngIf="rdv.statut === 'PLANIFIE'" class="btn-confirm">✅ Confirmer</button>
                  <button (click)="cancelRendezVous(rdv)" *ngIf="rdv.statut !== 'ANNULE' && rdv.statut !== 'TERMINE'" class="btn-cancel-rdv">❌ Annuler</button>
                  <button (click)="completeRendezVous(rdv)" *ngIf="rdv.statut === 'CONFIRME'" class="btn-complete">✅ Terminer</button>
                </div>
              </div>
            </div>

            <div class="pagination" *ngIf="totalPages > 1">
              <button (click)="previousPage()" [disabled]="currentPage === 1" class="btn-pagination">‹ Précédent</button>
              <span class="pagination-info">Page {{ currentPage }} sur {{ totalPages }}</span>
              <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="btn-pagination">Suivant ›</button>
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
    </div>
  `,
  styles: [`
       /* Base Container */
.dashboard-container {
  height: 100vh;
  background: linear-gradient(rgba(255,255,255,0.3), rgba(0,123,255,0.2)), 
              url('https://mydoctorsclinicsurfers.com.au/wp-content/uploads/2023/04/contact-Banner.jpeg');
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

.nav-user { display: flex; align-items: center; gap: 1rem; }

.welcome-text { font-weight: 600; }

.user-role-badge { padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }

.role-medecin { background: rgba(40,167,69,0.8); color: #fff; }

/* Main Content */
.main-content { display: flex; flex: 1; overflow: hidden; position: relative; }

/* Sidebar */
.sidebar { width: 250px; background: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s ease; position: relative; z-index: 100; }

.sidebar-header { display: none; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }

.close-sidebar { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #333; padding: 0.5rem; border-radius: 8px; transition: background-color 0.2s; margin-left: auto; }

.close-sidebar:hover { background-color: #f0f0f0; }

.sidebar-content { flex: 1; overflow-y: auto; }

.nav-menu { list-style: none; padding: 0; margin: 0; }

.nav-menu li a { display: block; padding: 1rem 1.5rem; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: all 0.2s; }

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

/* Content Area */
.content { flex: 1; padding: 2rem; overflow-y: auto; overflow-x: hidden; }

.global-footer { background-color: #f8f9fa; border-top: 1px solid #dee2e6; padding: 1rem 0; flex-shrink: 0; }

.footer-content { text-align: center; font-size: 0.9rem; color: #666; font-weight: 500; }

/* Header Section */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); flex-wrap: wrap; gap: 1rem; }

.header h2 { margin: 0; color: #333; }

.header-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* Buttons */
.btn-primary { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: #007bff; color: white; transition: all 0.2s; }

.btn-primary:hover { background: #0056b3; transform: translateY(-2px); }

.btn-primary:disabled { background: #6c757d; cursor: not-allowed; transform: none; }

.btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: #6c757d; color: white; transition: all 0.2s; }

.btn-secondary:hover { background: #5a6268; }

.btn-add { padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }

.btn-add:hover { background: #218838; }

.btn-remove { background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem; height: fit-content; transition: all 0.2s; }

.btn-remove:hover { background: #c82333; }

.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; transition: color 0.2s; }

.btn-close:hover { color: #333; }

/* Create Form Overlay */
.create-form-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }

.create-form { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; }

.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

.form-header h3 { margin: 0; color: #333; }

.form-group { margin-bottom: 1.5rem; }

.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }

.form-control { width: 100%; padding: 0.75rem; border: 2px solid #e0e6ed; border-radius: 8px; font-size: 1rem; outline: none; box-sizing: border-box; transition: border-color 0.2s; }

.form-control:focus { border-color: #007bff; }

.form-control.ng-invalid.ng-touched { border-color: #dc3545; box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }

.form-control.ng-valid.ng-touched { border-color: #28a745; box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }

.error-message { color: #dc3545; font-size: 0.8rem; margin-top: 0.25rem; display: block; }

.input-group { position: relative; }

.medicaments-section { margin-bottom: 1.5rem; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

.medicaments-table { border: 2px solid #e0e6ed; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }

.table-header { display: grid; grid-template-columns: 2fr 1fr 2fr 80px; background: #f8f9fa; padding: 0.75rem; font-weight: bold; border-bottom: 1px solid #e0e6ed; gap: 0.5rem; }

.table-row { display: grid; grid-template-columns: 2fr 1fr 2fr 80px; padding: 0.5rem; gap: 0.5rem; align-items: start; border-bottom: 1px solid #f0f0f0; }

.table-row:last-child { border-bottom: none; }

.form-actions { display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap; }

/* Prescriptions List */
.prescriptions-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }

.prescription-item { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #28a745; overflow: hidden; }

.prescription-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; cursor: pointer; transition: background 0.3s; user-select: none; }

.prescription-header:hover { background: #f8f9fa; }

.prescription-header:active { background: #e9ecef; }

.header-info h4 { margin: 0 0 0.25rem 0; color: #333; }

.header-info p { margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem; }

.date-badge { background: #e8f5e8; color: #28a745; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; display: inline-block; }

.expand-arrow { font-size: 1.2rem; color: #28a745; transition: transform 0.3s; padding: 0.5rem; margin: -0.5rem; cursor: pointer; }

.expand-arrow.expanded { transform: rotate(90deg); }

.expand-arrow:hover { background: rgba(40, 167, 69, 0.1); border-radius: 50%; }

.prescription-details { background: #f8f9fa; }

.details-content { padding: 1rem; border-top: 1px solid #eee; }

.consultation-info { background: white; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }

.info-item { display: flex; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap; }

.info-item strong { min-width: 100px; color: #333; }

.alert-info { background: #fff3cd; color: #856404; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; }

.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.btn-pdf, .btn-delete { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }

.btn-pdf { background: linear-gradient(135deg, #17a2b8, #138496); color: white; box-shadow: 0 2px 4px rgba(23, 162, 184, 0.2); }

.btn-pdf:hover { background: linear-gradient(135deg, #138496, #117a8b); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3); }

.btn-delete { background: linear-gradient(135deg, #dc3545, #c82333); color: white; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2); }

.btn-delete:hover { background: linear-gradient(135deg, #c82333, #a71e2a); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3); }

.no-prescriptions { text-align: center; padding: 3rem; color: #666; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* ------------------------------ Mobile Responsive ------------------------------ */
@media (max-width: 992px) {
  .menu-burger { display: block; }

  .navbar { padding: 1rem; gap: 1rem; }

  .nav-brand h1 { font-size: 1.2rem; }

  .nav-user { display: none; }

  .sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 280px; transform: translateX(-100%); z-index: 1000; }

  .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15); }

  .sidebar-header { display: flex; justify-content: flex-end; }

  .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 999; }

  .sidebar.open ~ .sidebar-overlay { display: block; }

  .content { padding: 1.5rem 1rem; }

  .header { flex-direction: column; align-items: flex-start; }

  .header-actions { width: 100%; }

  .create-form { padding: 1.5rem; max-width: 100%; }

  .table-header, .table-row { grid-template-columns: 1.5fr 0.8fr 1.5fr 60px; font-size: 0.85rem; }
}

@media (max-width: 768px) {
  .navbar { padding: 0.75rem; }

  .nav-brand h1 { font-size: 1rem; }

  .content { padding: 1rem 0.75rem; }

  .header h2 { font-size: 1.3rem; }

  .create-form { padding: 1rem; }

  .table-header, .table-row { display: flex; flex-direction: column; gap: 0.5rem; }

  .table-header { display: none; }

  .table-row { padding: 1rem; }

  .btn-remove { align-self: flex-end; }

  .form-control { font-size: 16px; /* Prevents zoom on iOS */ }

  .actions { width: 100%; }

  .btn-pdf, .btn-delete { flex: 1; justify-content: center; }

  .info-item { flex-direction: column; gap: 0.25rem; }

  .info-item strong { min-width: auto; }
}

@media (max-width: 576px) {
  .header { padding: 1rem; }

  .header-actions { flex-direction: column; }

  .btn-primary, .btn-secondary { width: 100%; justify-content: center; }

  .create-form { border-radius: 0; max-height: 100vh; }

  .form-actions { flex-direction: column; }

  .form-actions button { width: 100%; }
}
  `]
})
export class MedecinRendezVousComponent implements OnInit {
  rendezVous: any[] = [];
  filteredRendezVous: any[] = [];
  currentUser: User | null = null;
  statusFilter = '';
  dateFilter = '';
  notificationCount = 0;
  showProfileModal = false;
  showNotifications = false;
  viewMode: 'calendar' | 'list' = 'calendar';
  currentPage = 1;
  showUpcoming = false;
  itemsPerPage = 10;
  totalPages = 0;
  isSidebarOpen = false; // for mobile

  constructor(
    private rendezVousService: RendezVousService,
    private notificationService: NotificationService,
    private authService: AuthService,
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
    this.loadRendezVous();
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

  loadRendezVous(): void {
    const service = this.showUpcoming ? 
      this.rendezVousService.getUpcomingRendezVous() : 
      this.rendezVousService.getAllRendezVous();
    
    service.subscribe({
      next: rdv => {
        this.rendezVous = rdv.filter(r => r.medecinDTO?.id === this.currentUser?.id);
        if (this.showUpcoming) {
          const now = new Date();
          this.rendezVous = this.rendezVous.filter(r => new Date(r.dateHeureDebut) > now);
        }
        this.currentPage = 1;
        this.filterRendezVous();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les rendez-vous');
      }
    });
  }

  toggleUpcoming(): void {
    this.showUpcoming = !this.showUpcoming;
    this.loadRendezVous();
  }

  filterRendezVous(): void {
    const filtered = this.rendezVous.filter(rdv => {
      const statusMatch = !this.statusFilter || rdv.statut === this.statusFilter;
      const dateMatch = !this.dateFilter || rdv.dateHeureDebut?.startsWith(this.dateFilter);
      return statusMatch && dateMatch;
    });
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.updatePaginatedResults(filtered);
  }

  updatePaginatedResults(filtered: any[]): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredRendezVous = filtered.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterRendezVous();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterRendezVous();
    }
  }

  confirmRendezVous(rdv: any): void {
    this.rendezVousService.updateRendezVousStatus(rdv.id, 'CONFIRME').subscribe({
      next: () => {
        this.loadRendezVous();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de confirmer le rendez-vous');
      }
    });
  }

  cancelRendezVous(rdv: any): void {
    const motif = prompt('Motif d\'annulation (optionnel):');
    if (motif !== null) {
      this.rendezVousService.updateRendezVousStatus(rdv.id, 'ANNULE').subscribe({
        next: () => {
          this.loadRendezVous();
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible d\'annuler le rendez-vous');
        }
      });
    }
  }

  completeRendezVous(rdv: any): void {
    this.rendezVousService.updateRendezVousStatus(rdv.id, 'TERMINE').subscribe({
      next: () => {
        this.loadRendezVous();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de terminer le rendez-vous');
      }
    });
  }

  subscribeToNotifications(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notificationCount = notifications.length;
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  getStatusDisplay(statut: string): string {
    switch(statut) {
      case 'PLANIFIE': return 'Planifié';
      case 'CONFIRME': return 'Confirmé';
      case 'ANNULE': return 'Annulé';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      default: return statut;
    }
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  logout(): void {
    this.notificationService.disconnectWebSocket();
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