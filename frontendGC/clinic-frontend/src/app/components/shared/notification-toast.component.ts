import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notifications" 
           class="notification-toast" 
           [class]="'toast-' + notification.type"
           >
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="notification.type === 'success'">✅</span>
            <span *ngIf="notification.type === 'error'">❌</span>
            <span *ngIf="notification.type === 'warning'">⚠️</span>
            <span *ngIf="notification.type === 'info'">ℹ️</span>
          </div>
          <div class="toast-text">
            <div class="toast-title">{{ notification.title }}</div>
            <div class="toast-message">{{ notification.message }}</div>
          </div>
          <button class="toast-close" (click)="removeNotification(notification.id)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .notification-toast {
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      background: white;
    }

    .toast-icon {
      margin-right: 12px;
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-text {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .toast-message {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 0;
      margin-left: 12px;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #666;
    }

    .toast-success {
      border-left: 4px solid #28a745;
    }

    .toast-error {
      border-left: 4px solid #dc3545;
    }

    .toast-warning {
      border-left: 4px solid #ffc107;
    }

    .toast-info {
      border-left: 4px solid #17a2b8;
    }
  `]
})
export class NotificationToastComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}