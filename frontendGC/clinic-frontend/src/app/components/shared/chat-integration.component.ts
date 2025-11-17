import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { ChatContactsComponent } from './chat-contacts.component';
import { WebSocketService } from '../../services/websocket.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-chat-integration',
  standalone: true,
  imports: [CommonModule, ChatComponent, ChatContactsComponent],
  template: `
    <!-- Chat Button -->
    <div class="chat-button" (click)="toggleContacts()" [class.has-unread]="totalUnreadCount > 0">
      💬
      <span class="unread-count" *ngIf="totalUnreadCount > 0">{{ totalUnreadCount }}</span>
    </div>

    <!-- Debug Button (temporary) -->
    <div class="debug-button" (click)="debugWebSocket()" title="Debug WebSocket">
      🔧
    </div>

    <!-- Chat Contacts Modal -->
    <app-chat-contacts 
      [isVisible]="showContacts"
      (closed)="showContacts = false"
      (contactSelected)="openChat($event)">
    </app-chat-contacts>

    <!-- Chat Modal -->
    <app-chat 
      [isVisible]="showChat"
      [otherUser]="selectedUser"
      (closed)="closeChat()">
    </app-chat>
  `,
  styles: [`
    .chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #28a745;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 995;
      transition: all 0.3s ease;
    }
    .chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    .chat-button.has-unread {
      animation: pulse 2s infinite;
    }
    .unread-count {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
      100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
    }
    .debug-button {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: #ffc107;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 994;
    }
  `]
})
export class ChatIntegrationComponent implements OnInit {
  showContacts = false;
  showChat = false;
  selectedUser: User | null = null;
  totalUnreadCount = 0;
  currentUser: User | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Wait for user authentication before connecting WebSocket
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Initialize WebSocket connection after user is authenticated
        setTimeout(() => {
          this.webSocketService.connect();
          // Initialize chat service WebSocket listeners after connection
          setTimeout(() => {
            this.chatService.initializeWebSocketListeners();
            this.loadUnreadCounts();
          }, 1000);
        }, 500);
      }
    });
    
    // Rafraîchir les compteurs toutes les 30 secondes
    setInterval(() => {
      if (this.currentUser) {
        this.loadUnreadCounts();
      }
    }, 30000);

    // Subscribe to unread counts
    this.chatService.unreadCounts$.subscribe(counts => {
      this.totalUnreadCount = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
    });
    
    // Load initial unread counts
    this.loadUnreadCounts();
  }

  toggleContacts(): void {
    this.showContacts = !this.showContacts;
    if (this.showContacts) {
      console.log('Ouverture liste contacts, rechargement compteurs...');
      this.loadUnreadCounts();
    }
  }

  openChat(user: User): void {
    this.selectedUser = user;
    this.showChat = true;
    this.showContacts = false;
  }

  closeChat(): void {
    this.showChat = false;
    this.selectedUser = null;
  }

  private loadUnreadCounts(): void {
    this.chatService.getUnreadCounts().subscribe({
      next: counts => {
        console.log('Compteurs non lus chargés:', counts);
        // Les compteurs sont automatiquement mis à jour via le service
      },
      error: error => {
        console.error('Erreur chargement compteurs:', error);
      }
    });
  }

  debugWebSocket(): void {
    console.log('=== DEBUG WEBSOCKET ===');
    console.log('WebSocket Status:', this.webSocketService.getConnectionStatus());
    console.log('WebSocket Connected:', this.webSocketService.isConnected());
    console.log('Current User:', this.currentUser);
    console.log('Total Unread Count:', this.totalUnreadCount);
    
    // Test connection
    if (!this.webSocketService.isConnected()) {
      console.log('Tentative de reconnexion...');
      this.webSocketService.connect();
    }
    
    // Force reload unread counts
    console.log('Rechargement forcé des compteurs...');
    this.loadUnreadCounts();
    
    // Test message
    if (this.currentUser?.id) {
      console.log('Test d\'envoi de message...');
      this.chatService.sendMessage({
        senderId: this.currentUser.id,
        receiverId: 1, // Test avec ID 1
        content: 'Message de test - ' + new Date().toLocaleTimeString()
      });
    }
  }
}