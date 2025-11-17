import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notification {
  objMessage: string;
  message: string;
  rdvId?: number;
  timestamp: string;
  recipientType: string;
  recipientId: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public client: Client;
  private connected = false;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.client = new Client();
    this.setupClient();
  }

  private setupClient(): void {
    this.client.webSocketFactory = () => {
      return new SockJS('http://localhost:8080/ws');
    };

    // Simplified connection without auth headers
    this.client.connectHeaders = {};

    this.client.onConnect = () => {
      console.log('WebSocket connecté avec succès');
      this.connected = true;
      this.subscribeToNotifications();
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket déconnecté');
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('Erreur STOMP WebSocket:', frame);
      this.connected = false;
    };
  }

  connect(): void {
    if (!this.connected && !this.client.active) {
      console.log('Tentative de connexion WebSocket...');
      try {
        this.client.activate();
      } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error);
        // Ne pas retry automatiquement pour éviter les boucles
      }
    }
  }

  disconnect(): void {
    if (this.connected && this.client.active) {
      this.client.deactivate();
    }
  }

  private subscribeToNotifications(): void {
    if (!this.client.connected) {
      setTimeout(() => this.subscribeToNotifications(), 100);
      return;
    }

    this.authService.currentUser$.subscribe(currentUser => {
      try {
        // Notifications publiques
        this.client.subscribe('/topic/publicNotifications', (message) => {
          const notification: Notification = JSON.parse(message.body);
          this.addNotification(notification);
        });

        // Notifications privées pour l'utilisateur connecté
        if (currentUser && currentUser.id) {
          this.client.subscribe(`/user/queue/privateNotifications`, (message) => {
            const notification: Notification = JSON.parse(message.body);
            this.addNotification(notification);
          });
          
          // Chat messages
          this.client.subscribe(`/user/queue/chat`, (message) => {
            // Chat messages will be handled by ChatService
            console.log('Chat message received:', message.body);
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'abonnement aux notifications:', error);
      }
    });
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications].slice(0, 50); // Garder max 50 notifications
    this.notificationsSubject.next(updatedNotifications);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  // Méthode pour simuler une notification sans WebSocket
  simulateNotification(notification: Notification): void {
    this.addNotification(notification);
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  markAsRead(notificationId: string): void {
    // Logique pour marquer comme lu si nécessaire
  }

  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  getConnectionStatus(): string {
    return `Connected: ${this.connected}, Client Active: ${this.client?.active}, Client Connected: ${this.client?.connected}`;
  }
}