import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-overlay" *ngIf="isVisible" (click)="close()"></div>
    <div class="chat-container" *ngIf="isVisible" (click)="$event.stopPropagation()">
      <div class="chat-header">
        <h4>💬 Chat avec {{ otherUser?.prenom }} {{ otherUser?.nom }}</h4>
        <button (click)="close()" class="close-btn">✕</button>
      </div>
      
      <div class="chat-messages" #messagesContainer>
        <ng-container *ngFor="let group of getMessagesByDay(); let i = index">
          <div class="date-separator">
            <span class="date-label">{{ group.date | date:'dd/MM/yyyy' }}</span>
          </div>
          <div *ngFor="let message of group.messages" 
               class="message" 
               [class.own-message]="message.senderId === currentUser?.id"
               [class.other-message]="message.senderId !== currentUser?.id">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ message.timestamp | date:'HH:mm' }}</div>
          </div>
        </ng-container>
        <div *ngIf="messages.length === 0" class="no-messages">
          Aucun message. Commencez la conversation !
        </div>
      </div>
      
      <div class="chat-input">
        <input [(ngModel)]="newMessage" 
               (keyup.enter)="sendMessage()" 
               placeholder="Tapez votre message..."
               class="message-input">
        <button (click)="sendMessage()" 
                [disabled]="!newMessage.trim()" 
                class="send-btn">Envoyer</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      z-index: 998;
    }
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 999;
      display: flex;
      flex-direction: column;
    }
    .chat-header {
      padding: 1rem;
      background: #007bff;
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-header h4 {
      margin: 0;
      font-size: 1rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .message {
      max-width: 80%;
      padding: 0.75rem;
      border-radius: 12px;
      word-wrap: break-word;
    }
    .own-message {
      align-self: flex-end;
      background: #007bff;
      color: white;
    }
    .other-message {
      align-self: flex-start;
      background: #f1f3f4;
      color: #333;
    }
    .message-content {
      margin-bottom: 0.25rem;
    }
    .message-time {
      font-size: 0.7rem;
      opacity: 0.7;
    }
    .date-separator {
      text-align: center;
      margin: 1rem 0;
      position: relative;
    }
    .date-separator::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
    .date-label {
      background: white;
      padding: 0.25rem 0.75rem;
      color: #666;
      font-size: 0.8rem;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      position: relative;
      z-index: 1;
    }
    .no-messages {
      text-align: center;
      color: #666;
      font-style: italic;
      margin-top: 2rem;
    }
    .chat-input {
      padding: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      gap: 0.5rem;
    }
    .message-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    .send-btn {
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
    }
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ChatComponent implements OnInit {
  @Input() isVisible = false;
  @Input() otherUser: User | null = null;
  @Output() closed = new EventEmitter<void>();

  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser: User | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.chatService.messages$.subscribe(messages => {
      console.log('Messages mis à jour dans le chat:', messages.length);
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnChanges(): void {
    if (this.isVisible && this.otherUser) {
      console.log('Chat ouvert avec:', this.otherUser);
      this.loadConversation();
      this.markAsRead();
    }
  }

  loadConversation(): void {
    if (this.otherUser?.id) {
      console.log('Chargement conversation avec ID:', this.otherUser.id);
      this.chatService.loadConversation(this.otherUser.id);
    }
  }

  sendMessage(): void {
    console.log('Tentative d\'envoi de message:', this.newMessage, 'vers:', this.otherUser);
    
    if (!this.newMessage.trim()) {
      console.warn('Message vide, envoi annulé');
      return;
    }
    
    if (!this.otherUser?.id || !this.currentUser?.id) {
      console.warn('Destinataire ou expéditeur manquant');
      return;
    }

    const messageContent = this.newMessage.trim();
    
    // Ajouter le message localement pour affichage immédiat
    const localMessage: ChatMessage = {
      senderId: this.currentUser.id,
      senderName: `${this.currentUser.prenom} ${this.currentUser.nom}`,
      receiverId: this.otherUser.id,
      receiverName: `${this.otherUser.prenom} ${this.otherUser.nom}`,
      content: messageContent,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter immédiatement le message à la conversation pour l'affichage
    this.messages = [...this.messages, localMessage];
    setTimeout(() => this.scrollToBottom(), 100);

    console.log('Envoi du message via ChatService...');
    this.chatService.sendMessage({
      senderId: this.currentUser.id,
      receiverId: this.otherUser.id,
      content: messageContent
    });

    this.newMessage = '';
    console.log('Message envoyé, champ vidé');
  }

  markAsRead(): void {
    if (this.otherUser?.id) {
      this.chatService.markAsRead(this.otherUser.id);
    }
  }

  close(): void {
    this.markAsRead();
    this.isVisible = false;
    this.closed.emit();
  }

  getMessagesByDay(): any[] {
    const groups = new Map<string, any>();
    
    this.messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups.has(date)) {
        groups.set(date, {
          date: new Date(message.timestamp),
          messages: []
        });
      }
      groups.get(date)!.messages.push(message);
    });
    
    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}