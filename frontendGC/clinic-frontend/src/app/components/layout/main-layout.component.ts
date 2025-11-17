import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/auth.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- Header fixe -->
      <nav class="navbar" [class.secretaire]="currentUser?.role === 'SECRETAIRE'">
        <div class="nav-brand">
          <h1>🏥 Gestion Clinique</h1>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">{{ currentUser.prenom }} {{ currentUser.nom }}</span>
          <span class="user-role-badge" [class]="'role-' + currentUser.role.toLowerCase()">
            {{ getUserRoleLabel(currentUser.role) }}
          </span>
          <button (click)="logout()" class="btn-logout">🚪 Déconnexion</button>
        </div>
      </nav>

      <!-- Sidebar fixe -->
      <aside class="sidebar">
        <ul class="nav-menu">
          <li *ngIf="currentUser?.role === 'SECRETAIRE'">
            <a routerLink="/secretaire" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">📊 Tableau de bord</a>
          </li>
          <li *ngIf="currentUser?.role !== 'SECRETAIRE'">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">📊 Tableau de bord</a>
          </li>
          
          <li *ngIf="currentUser?.role === 'SECRETAIRE'">
            <a routerLink="/secretaire/patients" routerLinkActive="active">👥 Patients</a>
          </li>
          <li *ngIf="currentUser?.role !== 'SECRETAIRE'">
            <a routerLink="/patients" routerLinkActive="active">👥 Patients</a>
          </li>
          
          <li *ngIf="canAccessMedecins$ | async">
            <a routerLink="/medecins" routerLinkActive="active">👨⚕️ Médecins</a>
          </li>
          
          <li *ngIf="currentUser?.role === 'SECRETAIRE'">
            <a routerLink="/secretaire/rendezvous" routerLinkActive="active">📅 Rendez-vous</a>
          </li>
          <li *ngIf="currentUser?.role !== 'SECRETAIRE'">
            <a routerLink="/rendezvous" routerLinkActive="active">📅 Rendez-vous</a>
          </li>
          
          <li *ngIf="canAccessUsers$ | async">
            <a routerLink="/users" routerLinkActive="active">👥 Utilisateurs</a>
          </li>
        </ul>
      </aside>

      <!-- Contenu principal (changeable) -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer fixe -->
      <footer class="footer">
        <div class="footer-content">
          © kfokam48 2025 - Gestion Clinique
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: grid;
      grid-template-areas: 
        "navbar navbar"
        "sidebar main"
        "footer footer";
      grid-template-rows: 80px 1fr 60px;
      grid-template-columns: 250px 1fr;
    }
    
    .navbar {
      grid-area: navbar;
      /*background: linear-gradient(135deg, #007bff, #0056b3);*/
      /*background: #72c9b2ff;*/
      background: #0aae51ff;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    
    .navbar.secretaire {
      background: linear-gradient(135deg, #ffc107, #ffb300);
      color: #000;
    }
    
    .nav-brand h1 {
      margin: 0;
      font-weight: bold;
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
    
    .role-admin { background: rgba(255,255,255,0.2); color: #fff; }
    .role-medecin { background: rgba(40,167,69,0.8); color: #fff; }
    .role-secretaire { background: rgba(0,0,0,0.1); color: #000; }
    
    .btn-logout {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .sidebar {
      grid-area: sidebar;
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
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
      transition: all 0.3s ease;
    }
    
    .nav-menu li a:hover,
    .nav-menu li a.active {
      background: #007bff;
      color: white;
      font-weight: bold;
    }
    
    .main-content {
      grid-area: main;
      overflow-y: auto;
      background: #f8f9fa;
      padding: 2rem;
    }
    
    .footer {
      grid-area: footer;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .footer-content {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  canAccessMedecins$!: Observable<boolean>;
  canAccessUsers$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.canAccessMedecins$ = this.permissionService.canAccessMedecins();
    this.canAccessUsers$ = this.permissionService.canAccessUsers();
  }

  getUserRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MEDECIN': return 'Médecin';
      case 'SECRETAIRE': return 'Secrétaire';
      default: return role;
    }
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