import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { PaginationComponent } from '../shared/pagination.component';
import { DashboardService } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-secretaire-factures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfileModalComponent, PaginationComponent],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">{{ currentUser.prenom }} {{ currentUser.nom }}</span>
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
              <li><a routerLink="/secretaire" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">📊 Tableau de bord</a></li>
              <li><a routerLink="/secretaire/patients" routerLinkActive="active" (click)="closeSidebar()">👥 Patients</a></li>
              <li><a routerLink="/secretaire/rendezvous" routerLinkActive="active" (click)="closeSidebar()">📅 Rendez-vous</a></li>
              <li><a routerLink="/secretaire/prescriptions" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">💊 Prescriptions</a></li>
              <li><a routerLink="/secretaire/factures" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">💰 Factures</a></li>
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

        <!-- Overlay for mobile when sidebar open -->
        <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>
        
        <main class="content">
          <div class="header">
            <h2>💰 Suivi des Factures</h2>
            <div class="header-actions">
              <button (click)="loadFactures()" class="btn-secondary">🔄 Actualiser</button>
            </div>
          </div>

          <div class="filters-section">
            <div class="filter-tabs">
              <button (click)="setFilter('ALL')" [class.active]="currentFilter === 'ALL'" class="filter-tab">
                📋 Toutes ({{ getTotalCount() }})
              </button>
              <button (click)="setFilter('IMPAYEE')" [class.active]="currentFilter === 'IMPAYEE'" class="filter-tab alert">
                ⚠️ Impayées ({{ getUnpaidCount() }})
              </button>
              <button (click)="setFilter('PAYEE')" [class.active]="currentFilter === 'PAYEE'" class="filter-tab success">
                ✅ Payées ({{ getPaidCount() }})
              </button>
            </div>
          </div>

          <div class="factures-grid">
            <div *ngFor="let facture of getPaginatedFactures()" class="facture-card" [class]="'status-' + facture.statut?.toLowerCase()">
              <div class="facture-header">
                <h4>📄 {{ facture.numeroFacture }}</h4>
                <span class="facture-status" [class]="'badge-' + facture.statut?.toLowerCase()">
                  {{ getStatusLabel(facture.statut) }}
                </span>
              </div>
              <div class="facture-details">
                <div class="detail-row">
                  <strong>👤 Patient:</strong>
                  <span>{{ getPatientName(facture) }}</span>
                </div>
                <div class="detail-row">
                  <strong>📅 Date:</strong>
                  <span>{{ facture.dateCreation | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <strong>💰 Montant:</strong>
                  <span class="amount">{{ facture.montantTotal | number:'1.0-0' }} FCFA</span>
                </div>
                <div class="detail-row">
                  <strong>📆 Échéance:</strong>
                  <span [class.overdue]="isOverdue(facture)">{{ facture.dateEcheance | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <div class="facture-actions">
                <button (click)="downloadFacture(facture)" class="btn-pdf">📄 PDF</button>
                <button *ngIf="facture.statut === 'IMPAYEE'" (click)="markAsPaid(facture)" class="btn-pay">✅ Marquer payée</button>
                <button *ngIf="facture.statut === 'IMPAYEE' && isOverdue(facture)" (click)="sendReminder(facture)" class="btn-reminder">📧 Relance</button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredFactures.length === 0" class="no-factures">
            <p>💰 Aucune facture trouvée</p>
          </div>
          
          <app-pagination 
            [currentPage]="currentPage" 
            [totalPages]="getTotalPages()" 
            [totalElements]="filteredFactures.length"
            (pageChange)="onPageChange($event)">
          </app-pagination>
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
      background: linear-gradient(135deg, #e8f5e8, #f0f8f0, #e1f5e1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Navbar */
    .navbar {
      background-color: #72c9b2ff;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      flex-shrink: 0;
      position: relative;
      z-index: 10;
    }

    .menu-burger {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.8rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .menu-burger:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      font-weight: 600;
    }

    .user-role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .role-secretaire {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    /* Main Content */
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background: white;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease;
      position: relative;
      z-index: 100;
    }

    .sidebar-header {
      display: none;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .close-sidebar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #333;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
      margin-left: auto;
    }

    .close-sidebar:hover {
      background-color: #f0f0f0;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-menu li a {
      display: block;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #333;
      border-bottom: 1px solid #eee;
      transition: all 0.2s;
    }

    .nav-menu li a:hover,
    .nav-menu li a.active {
      background-color: #72c9b2ff;
      color: white;
    }

    .sidebar-footer {
      padding: 1rem;
      padding-bottom: 1.5rem;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #28a745, #20c997);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: white;
      cursor: pointer;
      transition: transform 0.3s;
      flex-shrink: 0;
    }

    .user-avatar:hover {
      transform: scale(1.1);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: bold;
      font-size: 0.9rem;
      color: #333;
    }

    .user-role {
      font-size: 0.8rem;
      color: #666;
    }

    .btn-logout-sidebar {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-logout-sidebar:hover {
      background: linear-gradient(135deg, #c82333, #a71e2a);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }

    .logout-icon {
      font-size: 1.1rem;
    }

    .sidebar-overlay {
      display: none;
    }

    /* Content Area */
    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .global-footer {
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      padding: 1rem 0;
      flex-shrink: 0;
    }

    .footer-content {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Buttons */
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      background: #6c757d;
      color: white;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    /* Filters Section */
    .filters-section {
      margin-bottom: 2rem;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e0e6ed;
      background: white;
      color: #333;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .filter-tab.active {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .filter-tab.alert.active {
      background: #dc3545;
      border-color: #dc3545;
    }

    .filter-tab.success.active {
      background: #28a745;
      border-color: #28a745;
    }

    /* Factures Grid */
    .factures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .facture-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border-left: 4px solid #28a745;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .facture-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .facture-card.status-impayee {
      border-left-color: #dc3545;
    }

    .facture-card.status-payee {
      border-left-color: #28a745;
    }

    .facture-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .facture-header h4 {
      margin: 0;
      color: #333;
    }

    .facture-status {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      white-space: nowrap;
    }

    .badge-impayee {
      background: #ffebee;
      color: #c62828;
    }

    .badge-payee {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .facture-details {
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .detail-row strong {
      color: #333;
    }

    .detail-row span {
      color: #666;
    }

    .amount {
      font-weight: bold;
      color: #28a745;
    }

    .overdue {
      color: #dc3545;
      font-weight: bold;
    }

    .facture-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-pdf,
    .btn-pay,
    .btn-reminder {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 100px;
    }

    .btn-pdf {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
    }

    .btn-pdf:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .btn-pay {
      background: linear-gradient(135deg, #28a745, #218838);
      color: white;
    }

    .btn-pay:hover {
      background: linear-gradient(135deg, #218838, #1e7e34);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-reminder {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: #000;
    }

    .btn-reminder:hover {
      background: linear-gradient(135deg, #e0a800, #d39e00);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    }

    .no-factures {
      text-align: center;
      padding: 3rem;
      color: #666;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* ------------------------------ Mobile Responsive ------------------------------ */
    @media (max-width: 992px) {
      .menu-burger {
        display: block;
      }

      .navbar {
        padding: 1rem;
        gap: 1rem;
      }

      .nav-brand h1 {
        font-size: 1.2rem;
      }

      .nav-user {
        display: none;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 280px;
        transform: translateX(-100%);
        z-index: 1000;
      }

      .sidebar.open {
        transform: translateX(0);
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      }

      .sidebar-header {
        display: flex;
        justify-content: flex-end;
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

      .content {
        padding: 1.5rem 1rem;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .filter-tabs {
        flex-direction: column;
      }

      .filter-tab {
        width: 100%;
      }

      .factures-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem;
      }

      .nav-brand h1 {
        font-size: 1rem;
      }

      .content {
        padding: 1rem 0.75rem;
      }

      .header h2 {
        font-size: 1.3rem;
      }

      .header-actions button {
        flex: 1;
      }

      .filters-section {
        margin-bottom: 1rem;
      }

      .filter-tabs {
        padding: 0.75rem;
      }

      .facture-card {
        padding: 1rem;
      }

      .facture-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .facture-actions {
        width: 100%;
      }

      .btn-pdf,
      .btn-pay,
      .btn-reminder {
        width: 100%;
      }

      .detail-row {
        flex-direction: column;
      }
    }

    @media (max-width: 576px) {
      .header {
        padding: 1rem;
      }

      .header h2 {
        font-size: 1.1rem;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .header-actions button {
        width: 100%;
      }

      .filter-tabs {
        flex-direction: column;
        gap: 0.5rem;
      }

      .filter-tab {
        width: 100%;
        padding: 0.5rem 1rem;
      }

      .facture-card {
        padding: 0.75rem;
      }

      .facture-header h4 {
        font-size: 0.95rem;
      }

      .facture-status {
        font-size: 0.7rem;
      }

      .detail-row {
        font-size: 0.9rem;
      }

      .btn-pdf,
      .btn-pay,
      .btn-reminder {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        min-width: auto;
      }
    }
  `]
})
export class SecretaireFacturesComponent implements OnInit {
  factures: any[] = [];
  filteredFactures: any[] = [];
  currentUser: User | null = null;
  showProfileModal = false;
  currentFilter = 'ALL';
  currentPage = 0;
  pageSize = 5;
  isSidebarOpen = false; // for mobile

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
        this.loadFactures();
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

  loadFactures(): void {
    this.dashboardService.getAllFactures().subscribe({
      next: factures => {
        this.factures = factures;
        this.applyFilter();
        this.notificationService.success('Actualisation', `${factures.length} factures chargées`);
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les factures');
      }
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.currentFilter) {
      case 'IMPAYEE':
        this.filteredFactures = this.factures.filter(f => f.statut === 'IMPAYEE');
        break;
      case 'PAYEE':
        this.filteredFactures = this.factures.filter(f => f.statut === 'PAYEE');
        break;
      default:
        this.filteredFactures = this.factures;
    }
  }

  getTotalCount(): number {
    return this.factures.length;
  }

  getUnpaidCount(): number {
    return this.factures.filter(f => f.statut === 'IMPAYEE').length;
  }

  getPaidCount(): number {
    return this.factures.filter(f => f.statut === 'PAYEE').length;
  }

  getStatusLabel(statut: string): string {
    return statut === 'IMPAYEE' ? 'Impayée' : 'Payée';
  }

  getPatientName(facture: any): string {
    return facture.patientNom || 'Patient inconnu';
  }

  isOverdue(facture: any): boolean {
    return new Date(facture.dateEcheance) < new Date() && facture.statut === 'IMPAYEE';
  }

  downloadFacture(facture: any): void {
    this.dashboardService.downloadFacturePdf(facture.id).subscribe({
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

  markAsPaid(facture: any): void {
    console.log('Facture à marquer payée:', facture);
    if (!facture.id) {
      this.notificationService.error('Erreur', 'ID de facture manquant');
      return;
    }
    
    this.dashboardService.updateFactureStatus(facture.id, 'PAYEE').subscribe({
      next: () => {
        facture.statut = 'PAYEE';
        this.notificationService.success('Succès', 'Facture marquée comme payée');
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        this.notificationService.error('Erreur', 'Impossible de mettre à jour le statut');
      }
    });
  }

  sendReminder(facture: any): void {
    // Simulation - à implémenter côté backend
    this.notificationService.success('Relance', 'Email de relance envoyé');
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  getPaginatedFactures(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredFactures.slice(startIndex, startIndex + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredFactures.length / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  logout(): void {
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