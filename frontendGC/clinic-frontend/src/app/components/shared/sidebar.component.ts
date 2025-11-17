import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PermissionService } from '../../services/permission.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <ul class="nav-menu">
        <li><a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">📊 Tableau de bord</a></li>
        <li><a routerLink="/patients" routerLinkActive="active">👥 Patients</a></li>
        <li *ngIf="canAccessMedecins$ | async"><a routerLink="/medecins" routerLinkActive="active">👨⚕️ Médecins</a></li>
        <li><a routerLink="/rendezvous" routerLinkActive="active">📅 Rendez-vous</a></li>
        <li><a routerLink="/calendar" routerLinkActive="active">🗓️ Calendrier</a></li>
        <li *ngIf="canAccessUsers$ | async"><a routerLink="/users" routerLinkActive="active">👥 Utilisateurs</a></li>
      </ul>
      <div class="sidebar-footer"></div>
    </aside>
  `,
  styles: [`
    .sidebar { width: 250px; background-color: white; min-height: calc(100vh - 80px); box-shadow: 2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
    .nav-menu { list-style: none; padding: 0; margin: 0; flex: 1; }
    .nav-menu li a { display: block; padding: 1rem 1.5rem; text-decoration: none; color: #333; border-bottom: 1px solid #eee; }
    .nav-menu li a:hover, .nav-menu li a.active { background-color: #007bff; color: white; }
    .sidebar-footer { padding: 1rem; border-top: 1px solid #eee; background: #f8f9fa; }
  `]
})
export class SidebarComponent implements OnInit {
  canAccessMedecins$!: Observable<boolean>;
  canAccessUsers$!: Observable<boolean>;

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.canAccessMedecins$ = this.permissionService.canAccessMedecins();
    this.canAccessUsers$ = this.permissionService.canAccessUsers();
  }
}