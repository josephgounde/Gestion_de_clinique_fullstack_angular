import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService, Notification as WSNotification } from './websocket.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  rdvId?: number;
  objMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  constructor(private webSocketService: WebSocketService) {
    this.loadNotificationsFromStorage();
    this.webSocketService.getNotifications().subscribe(wsNotifications => {
      wsNotifications.forEach(wsNotif => {
        this.showWebSocketNotification(wsNotif);
      });
    });
  }

  addNotification(type: Notification['type'], title: string, message: string, rdvId?: number, objMessage?: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      rdvId,
      objMessage
    };

    const current = this.notifications.value;
    const updated = [notification, ...current];
    this.notifications.next(updated);
    this.saveNotificationsToStorage(updated);

    // Auto-remove after 5 seconds for success/info
    if (type === 'success' || type === 'info') {
      setTimeout(() => this.removeNotification(notification.id), 5000);
    }
  }

  removeNotification(id: string): void {
    const current = this.notifications.value;
    this.notifications.next(current.filter(n => n.id !== id));
  }

  markAsRead(id: string): void {
    const current = this.notifications.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(updated);
    this.saveNotificationsToStorage(updated);
  }

  clearAll(): void {
    this.notifications.next([]);
  }

  success(title: string, message: string): void {
    this.addNotification('success', title, message);
  }

  error(title: string, message: string): void {
    this.addNotification('error', title, message);
  }

  warning(title: string, message: string): void {
    this.addNotification('warning', title, message);
  }

  info(title: string, message: string): void {
    this.addNotification('info', title, message);
  }

  private showWebSocketNotification(wsNotif: WSNotification): void {
    let type: Notification['type'] = 'info';
    let title = 'Notification';
    
    switch (wsNotif.objMessage) {
      case 'NEW_RDV':
        type = 'success';
        title = 'Nouveau RDV';
        break;
      case 'RDV_CANCELLED':
        type = 'warning';
        title = 'RDV Annulé';
        break;
      case 'RDV_REMINDER':
        type = 'info';
        title = 'Rappel RDV';
        break;
      case 'RDV_CONFIRMED':
        type = 'success';
        title = 'RDV Confirmé';
        break;
      case 'RDV_COMPLETED':
        type = 'info';
        title = 'RDV Terminé';
        break;
    }
    
    this.addNotification(type, title, wsNotif.message, wsNotif.rdvId, wsNotif.objMessage);
  }

  private saveNotificationsToStorage(notifications: Notification[]): void {
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 20)));
  }

  private loadNotificationsFromStorage(): void {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications.next(notifications);
      } catch (e) {
        console.error('Erreur lors du chargement des notifications:', e);
      }
    }
  }

  filterByType(type?: string): Notification[] {
    const all = this.notifications.value;
    return type ? all.filter(n => n.objMessage === type) : all;
  }

  getUnreadCount(): number {
    return this.notifications.value.filter(n => !n.read).length;
  }

  connectWebSocket(): void {
    this.webSocketService.connect();
  }

  disconnectWebSocket(): void {
    this.webSocketService.disconnect();
  }
}