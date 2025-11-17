import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService, DashboardStats, RecentActivity, QuickAction, UserSummary, Alert, SystemHealth } from '../../services/dashboard.service';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FooterComponent } from "../../components/app-footer/footer.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent, FooterComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Variables pour stocker les données dynamiques
  dashboardStats: DashboardStats = {} as DashboardStats;
  recentActivity: RecentActivity[] = [];
  quickActions: QuickAction[] = [];
  recentUsers: UserSummary[] = [];
  alerts: Alert[] = [];
  systemHealth: SystemHealth = {} as SystemHealth;

  loading = false;  // Indique si le chargement est en cours
  error = '';       // Message d’erreur à afficher

  private destroy$ = new Subject<void>();  // Pour gérer les désinscriptions

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();  // Chargement des données au lancement du composant
  }

  ngOnDestroy(): void {
    // Éviter les fuites mémoire en désabonnant toutes les observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Charge toutes les données nécessaires en parallèles
  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // On charge les différentes données via les méthodes spécifiques
    this.loadDashboardStats();
    this.loadRecentActivity();
    this.loadQuickActions();
    this.loadRecentUsers();
    this.loadAlerts();
    this.loadSystemHealth();
  }

  private loadDashboardStats(): void {
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.systemHealth = stats.systemHealth;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement stats:', err);
          this.error = 'Impossible de charger les statistiques.';
          this.loading = false;
        }
      });
  }

  private loadRecentActivity(): void {
    this.dashboardService.getRecentActivity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => this.recentActivity = activities,
        error: (err) => console.error('Erreur chargement activité récente:', err)
      });
  }

  private loadQuickActions(): void {
    this.dashboardService.getQuickActions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actions) => this.quickActions = actions,
        error: (err) => console.error('Erreur chargement actions rapides:', err)
      });
  }

  private loadRecentUsers(): void {
    this.dashboardService.getRecentUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => this.recentUsers = users,
        error: (err) => console.error('Erreur chargement utilisateurs récents:', err)
      });
  }

  private loadAlerts(): void {
    this.dashboardService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alerts) => this.alerts = alerts,
        error: (err) => console.error('Erreur chargement alertes:', err)
      });
  }

  private loadSystemHealth(): void {
    this.dashboardService.getSystemHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (health: SystemHealth) => this.systemHealth = health,
        error: (err: any) => console.error('Erreur chargement santé système:', err)
      });
  }

  // Gestion du clic sur "Réessayer" en cas d’erreur globale
  retryLoad(): void {
    this.error = '';
    this.loadDashboardData();
  }

  // Marque une alerte spécifique comme lue
  markAlertAsRead(alertId: string): void {
    this.dashboardService.markAlertAsRead(alertId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const alert = this.alerts.find(a => a.id === alertId);
          if (alert) {
            alert.read = true;
          }
        },
        error: (err) => console.error('Erreur marquage alerte:', err)
      });
  }

  // Utilitaires pour classes CSS dynamiques

  getSeverityClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'success': return 'severity-success';
      case 'warning': return 'severity-warning';
      case 'error': return 'severity-error';
      case 'info': return 'severity-info';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getRoleIcon(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return '👨‍💻';
      case 'medecin': return '👨‍⚕️';
      case 'secretaire': return '👩‍💼';
      default: return '👤';
    }
  }

  getSystemStatusClass(): string {
    switch (this.systemHealth.serverStatus?.toLowerCase()) {
      case 'online': return 'status-online';
      case 'offline': return 'status-offline';
      case 'warning': return 'status-warning';
      default: return '';
    }
  }

  getDatabaseUsageClass(): string {
    if (this.systemHealth.databaseUsage >= 90) return 'usage-critical';
    if (this.systemHealth.databaseUsage >= 80) return 'usage-warning';
    return 'usage-normal';
  }
}
