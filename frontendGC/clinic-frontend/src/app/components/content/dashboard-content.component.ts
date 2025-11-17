import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-content">
      <h2>📊 Tableau de bord</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ stats?.totalPatients || 0 }}</h3>
            <p>Patients</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👨⚕️</div>
          <div class="stat-info">
            <h3>{{ stats?.totalMedecins || 0 }}</h3>
            <p>Médecins</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>{{ stats?.rendezVousAujourdhui || 0 }}</h3>
            <p>RDV Aujourd'hui</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>🚀 Actions Rapides</h3>
        <div class="actions-grid">
          <a routerLink="/patients" class="action-btn">
            <span class="action-icon">👥</span>
            <span>Gérer Patients</span>
          </a>
          <a routerLink="/medecins" class="action-btn">
            <span class="action-icon">👨⚕️</span>
            <span>Gérer Médecins</span>
          </a>
          <a routerLink="/rendezvous" class="action-btn">
            <span class="action-icon">📅</span>
            <span>Planifier RDV</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content { }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
    .stat-icon { font-size: 2.5rem; }
    .stat-info h3 { font-size: 2rem; margin: 0; color: #333; }
    .stat-info p { margin: 0; color: #666; }
    .quick-actions { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .action-btn { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: #333; }
    .action-btn:hover { background: #007bff; color: white; }
    .action-icon { font-size: 1.5rem; }
  `]
})
export class DashboardContentComponent implements OnInit {
  stats: any = {};

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: stats => this.stats = stats,
      error: () => this.stats = { totalPatients: 0, totalMedecins: 0, rendezVousAujourdhui: 0 }
    });
  }
}