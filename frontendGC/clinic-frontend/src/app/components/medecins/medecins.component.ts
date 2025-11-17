import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { NotificationService } from '../../services/notification.service';
import { Medecin, Role } from '../../models/medecin.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-medecins',
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
        <!-- Mobile Header -->
        <div class="mobile-header">
          <button class="menu-burger" (click)="toggleSidebar()" title="Ouvrir le menu">☰</button>
          <h2 class="mobile-title">Médecins</h2>
        </div>

        <div class="medecins-container">
          
          <div class="header-card">
            <div class="header-info">
              <h2>Gestion des Médecins</h2>
              <span class="subtitle">Administrer les informations et les accès du personnel médical</span>
            </div>
            <div class="header-actions">
              <button (click)="showAddForm = !showAddForm" class="btn-primary">
                <span class="btn-icon">{{ showAddForm ? '✖' : '➕' }}</span>
                <span class="btn-text">{{ showAddForm ? 'Annuler' : 'Ajouter un Médecin' }}</span>
              </button>
            </div>
          </div>

          <div *ngIf="showAddForm" class="form-card">
            <h3>{{ editingMedecin ? 'Modifier' : 'Ajouter' }} un Médecin</h3>
            <form (ngSubmit)="saveMedecin()" #medecinForm="ngForm">
              <div class="form-grid">
                <div class="form-group">
                  <label for="nom">Nom:</label>
                  <input id="nom" [(ngModel)]="currentMedecin.nom" name="nom" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="prenom">Prénom:</label>
                  <input id="prenom" [(ngModel)]="currentMedecin.prenom" name="prenom" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="email">Email:</label>
                  <input id="email" type="email" [(ngModel)]="currentMedecin.email" name="email" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="specialite">Spécialité:</label>
                  <input id="specialite" [(ngModel)]="currentMedecin.specialite" name="specialite" required class="form-control">
                </div>
                <div class="form-group" *ngIf="!editingMedecin">
                  <label for="motDePasse">Mot de passe:</label>
                  <input id="motDePasse" type="password" [(ngModel)]="currentMedecin.motDePasse" name="motDePasse" required class="form-control">
                </div>
                <div class="form-group" *ngIf="!editingMedecin"></div> 
              </div>
              
              <h4 class="form-section-title">Adresse</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="street">Rue:</label>
                  <input id="street" [ngModel]="currentMedecin.adressDto.street" (ngModelChange)="updateAdresse('street', $event)" name="street" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="houseNumber">Numéro:</label>
                  <input id="houseNumber" [ngModel]="currentMedecin.adressDto.houseNumber" (ngModelChange)="updateAdresse('houseNumber', $event)" name="houseNumber" class="form-control">
                </div>
                <div class="form-group">
                  <label for="city">Ville:</label>
                  <input id="city" [ngModel]="currentMedecin.adressDto.city" (ngModelChange)="updateAdresse('city', $event)" name="city" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="postalCode">Code Postal:</label>
                  <input id="postalCode" type="number" [ngModel]="currentMedecin.adressDto.postalCode" (ngModelChange)="updateAdresse('postalCode', $event)" name="postalCode" required class="form-control">
                </div>
                <div class="form-group">
                  <label for="country">Pays:</label>
                  <input id="country" [ngModel]="currentMedecin.adressDto.country" (ngModelChange)="updateAdresse('country', $event)" name="country" required class="form-control">
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" (click)="cancelEdit()" class="btn-secondary">Annuler</button>
                <button type="submit" [disabled]="!medecinForm.valid" class="btn-primary btn-save">Sauvegarder</button>
              </div>
            </form>
          </div>

          <div class="table-card">
            <div class="table-scroll-wrapper">
              <table class="medecins-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Spécialité</th>
                    <th class="action-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let medecin of medecins">
                    <td>{{ medecin.nom }}</td>
                    <td>{{ medecin.prenom }}</td>
                    <td><span class="email-text">{{ medecin.email }}</span></td>
                    <td><span class="specialite-tag">{{ medecin.specialite }}</span></td>
                    <td class="action-column">
                      <button (click)="editMedecin(medecin)" class="btn-action btn-edit" title="Modifier">✏️</button>
                      <button (click)="deleteMedecin(medecin.id!)" class="btn-action btn-delete" title="Supprimer">🗑️</button>
                    </td>
                  </tr>
                  <tr *ngIf="medecins.length === 0">
                    <td colspan="5" class="no-data-row">Aucun médecin trouvé.</td>
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
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      overflow-x: hidden;
      height: 100vh;
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
        padding: 0 0.5rem;
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
    .medecins-container {
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

    /* ------------------------------ Forms ------------------------------ */
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 0;
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

    /* ------------------------------ Buttons ------------------------------ */
    .btn-primary, .btn-secondary {
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

    .medecins-table {
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

    .email-text {
      font-weight: 500;
      color: var(--color-secondary);
    }

    .specialite-tag {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 15px;
      background-color: #ecf0f1;
      color: var(--color-text-dark);
      font-size: 0.85rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .action-column {
      width: 120px;
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

      .btn-primary {
        width: 100%;
        justify-content: center;
      }

      .btn-text {
        display: none;
      }

      .form-card {
        padding: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .medecins-table {
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

      .table-scroll-wrapper {
        margin: 0 -0.75rem;
        padding: 0 0.75rem;
      }

      .form-section-title {
        font-size: 1rem;
        margin-top: 1.5rem;
      }
    }
  `]
})
export class MedecinsComponent implements OnInit {
  medecins: Medecin[] = [];
  currentMedecin: Medecin = this.initMedecin();
  showAddForm = false;
  editingMedecin = false;
  isSidebarOpen: boolean = false;
  loggedUser: any = null;

  constructor(
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

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe({
      next: medecins => {
        this.medecins = medecins;
        this.notificationService.info('Médecins', 'Liste des médecins mise à jour.');
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de charger les médecins');
      }
    });
  }

  initMedecin(): Medecin {
    return {
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      motDePasse: '',
      role: Role.MEDECIN,
      adressDto: {
        street: '',
        houseNumber: '',
        city: '',
        postalCode: 0,
        country: ''
      }
    };
  }

  saveMedecin(): void {
    console.log('Tentative de sauvegarde du médecin:', this.currentMedecin);
    
    if (this.editingMedecin) {
      this.medecinService.updateMedecin(this.currentMedecin.id!, this.currentMedecin).subscribe({
        next: (response) => {
          this.loadMedecins();
          this.cancelEdit();
          this.notificationService.success('Modification', 'Médecin modifié avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.notificationService.error('Erreur', 'Impossible de modifier le médecin');
        }
      });
    } else {
      this.currentMedecin.role = Role.MEDECIN; 
      this.medecinService.createMedecin(this.currentMedecin).subscribe({
        next: (response) => {
          this.loadMedecins();
          this.cancelEdit();
          this.notificationService.success('Création', 'Médecin créé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.notificationService.error('Erreur', 'Impossible de créer le médecin');
        }
      });
    }
  }

  editMedecin(medecin: Medecin): void {
    this.currentMedecin = { 
      ...medecin,
      adressDto: medecin.adressDto ? { ...medecin.adressDto } : this.initMedecin().adressDto
    };
    this.editingMedecin = true;
    this.showAddForm = true;
  }

  deleteMedecin(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible.')) {
      this.medecinService.deleteMedecin(id).subscribe({
        next: () => {
          this.loadMedecins();
          this.notificationService.success('Suppression', 'Médecin supprimé avec succès');
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de supprimer le médecin');
        }
      });
    }
  }

  updateAdresse(field: string, value: string | number): void {
    if (!this.currentMedecin.adressDto) {
      this.currentMedecin.adressDto = this.initMedecin().adressDto;
    }
    (this.currentMedecin.adressDto as any)[field] = value;
  }

  cancelEdit(): void {
    this.currentMedecin = this.initMedecin();
    this.editingMedecin = false;
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
}