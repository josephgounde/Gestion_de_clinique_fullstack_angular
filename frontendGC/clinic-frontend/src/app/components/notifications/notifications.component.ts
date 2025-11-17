import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notifications-overlay" *ngIf="isVisible" (click)="closeNotifications()"></div>
    <div class="notifications-container" *ngIf="isVisible" (click)="$event.stopPropagation()">
      <div class="notifications-header">
        <h4>Notifications ({{ filteredNotifications.length }})</h4>
        <div class="notifications-controls">
          <select [(ngModel)]="filterType" (change)="applyFilter()" class="filter-select">
            <option value="">Tous</option>
            <option value="NEW_RDV">Nouveaux RDV</option>
            <option value="RDV_CONFIRMED">RDV Confirmés</option>
            <option value="RDV_CANCELLED">RDV Annulés</option>
            <option value="RDV_COMPLETED">RDV Terminés</option>
            <option value="RDV_REMINDER">Rappels</option>
          </select>
          <button (click)="markAllAsRead()" class="btn-mark-read">Tout marquer lu</button>
        </div>
      </div>
      <div class="notifications-list">
        <div *ngFor="let notification of filteredNotifications" 
             class="notification" 
             [class]="'notification-' + notification.type"
             [class.unread]="!notification.read"
             (click)="markAsRead(notification.id)">
          <div class="notification-header">
            <span class="notification-icon">{{ getIcon(notification.type) }}</span>
            <strong>{{ notification.title }}</strong>
            <button (click)="removeNotification(notification.id); $event.stopPropagation()" class="close-btn">&times;</button>
          </div>
          <div class="notification-body">
            {{ notification.message }}
          </div>
          <div class="notification-footer">
            <span class="notification-time">{{ notification.timestamp | date:'HH:mm' }}</span>
            <button *ngIf="notification.rdvId" (click)="goToRendezVous(notification.rdvId!); $event.stopPropagation()" class="btn-action">Voir RDV</button>
          </div>
        </div>
        <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
          Aucune notification
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
    }
    .notifications-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000;
      max-width: 450px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      max-height: 80vh;
      overflow: hidden;
    }
    .notifications-header {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }
    .notifications-header h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    .notifications-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .filter-select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .btn-mark-read {
      padding: 0.25rem 0.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .notifications-list {
      max-height: 60vh;
      overflow-y: auto;
    }
    .notification {
      padding: 1rem;
      border-left: 4px solid;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background 0.2s;
    }
    .notification:hover {
      background: #f8f9fa;
    }
    .notification-success { border-left-color: #28a745; }
    .notification-error { border-left-color: #dc3545; }
    .notification-warning { border-left-color: #ffc107; }
    .notification-info { border-left-color: #17a2b8; }
    .notification-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .notification-icon {
      font-size: 1.2rem;
    }
    .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .notification-body {
      color: #666;
      margin-bottom: 0.5rem;
    }
    .notification-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }
    .notification-time {
      font-size: 0.8rem;
      color: #999;
    }
    .btn-action {
      padding: 0.25rem 0.5rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .no-notifications {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
    .unread {
      border-left-width: 6px;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  @Input() isVisible = false;
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filterType = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.filteredNotifications = this.notificationService.filterByType(this.filterType || undefined);
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.filteredNotifications.forEach(n => {
      if (!n.read) {
        this.notificationService.markAsRead(n.id);
      }
    });
  }

  goToRendezVous(rdvId: number): void {
    // Navigate based on user role
    const currentUrl = this.router.url;
    if (currentUrl.includes('/medecin')) {
      this.router.navigate(['/medecin/rendezvous']);
    } else if (currentUrl.includes('/secretaire')) {
      this.router.navigate(['/secretaire/rendezvous']);
    } else {
      this.router.navigate(['/rendezvous']);
    }
    this.closeNotifications();
  }

  closeNotifications(): void {
    this.isVisible = false;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }
}