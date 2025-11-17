import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';

export interface ChatMessage {
  id?: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessageRequest {
  senderId: number;
  receiverId: number;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api/chat';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private unreadCountsSubject = new BehaviorSubject<Map<number, number>>(new Map());

  public messages$ = this.messagesSubject.asObservable();
  public unreadCounts$ = this.unreadCountsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {
    // Delay WebSocket setup until connection is established
    setTimeout(() => this.setupWebSocketListeners(), 1000);
  }

  private setupWebSocketListeners(): void {
    // Check if WebSocket is connected before subscribing
    if (this.webSocketService.client?.connected) {
      this.webSocketService.client.subscribe('/user/queue/chat', (message) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        console.log('Nouveau message reçu via WebSocket:', chatMessage);
        this.addMessageToConversation(chatMessage);
        this.updateUnreadCounts();
      });
    } else {
      // Retry after a delay if not connected
      setTimeout(() => this.setupWebSocketListeners(), 2000);
    }
  }

  sendMessage(request: ChatMessageRequest): void {
    console.log('ChatService.sendMessage appelé avec:', request);
    
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token ? 'Présent' : 'Absent');
    
    console.log('WebSocket status:', this.webSocketService.getConnectionStatus());
    console.log('WebSocket isConnected:', this.webSocketService.isConnected());
    
    if (this.webSocketService.client?.connected) {
      console.log('Envoi du message via WebSocket...');
      this.webSocketService.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(request),
        headers: { 
          'Authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        }
      });
      console.log('Message publié sur WebSocket');
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
      console.log('Tentative de connexion WebSocket...');
      this.webSocketService.connect();
    }
  }

  getConversation(otherUserId: number): Observable<ChatMessage[]> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/conversation/${otherUserId}`, { headers });
  }

  getUnreadMessages(): Observable<ChatMessage[]> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/unread`, { headers });
  }

  getUnreadCounts(): Observable<Map<number, number>> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<{[key: number]: number}>(`${this.baseUrl}/unread/counts`, { headers })
      .pipe(
        map(counts => new Map(Object.entries(counts).map(([k, v]) => [+k, v])))
      );
  }

  markAsRead(senderId: number): void {
    const token = localStorage.getItem('token');
    if (this.webSocketService.client?.connected) {
      this.webSocketService.client.publish({
        destination: '/app/chat.markAsRead',
        body: JSON.stringify({ senderId }),
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      // Fallback HTTP request if WebSocket is not connected
      const headers = { 'Authorization': `Bearer ${token}` };
      this.http.put(`${this.baseUrl}/mark-read/${senderId}`, {}, { headers }).subscribe({
        next: () => {
          console.log('Messages marqués comme lus via HTTP');
        },
        error: error => console.error('Erreur lors du marquage comme lu:', error)
      });
    }
    // Mettre à jour immédiatement les compteurs
    this.updateUnreadCounts();
  }

  private addMessageToConversation(message: ChatMessage): void {
    const current = this.messagesSubject.value;
    // Vérifier si le message n'existe pas déjà pour éviter les doublons
    const exists = current.some(m => 
      m.senderId === message.senderId && 
      m.receiverId === message.receiverId && 
      m.content === message.content && 
      Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
    );
    
    if (!exists) {
      const updated = [...current, message].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      console.log('Ajout du message à la conversation:', message);
      this.messagesSubject.next(updated);
    }
  }

  private updateUnreadCounts(): void {
    this.getUnreadCounts().subscribe({
      next: counts => {
        console.log('Mise à jour compteurs non lus:', counts);
        this.unreadCountsSubject.next(counts);
      },
      error: error => {
        console.warn('Erreur lors de la récupération des compteurs non lus:', error);
      }
    });
  }

  // Method to initialize WebSocket listeners when connection is ready
  initializeWebSocketListeners(): void {
    this.setupWebSocketListeners();
  }

  loadConversation(otherUserId: number): void {
    console.log('ChatService.loadConversation pour userId:', otherUserId);
    this.getConversation(otherUserId).subscribe({
      next: messages => {
        console.log('Conversation chargée, nombre de messages:', messages.length);
        console.log('Messages:', messages);
        this.messagesSubject.next(messages);
      },
      error: error => {
        console.error('Erreur lors du chargement de la conversation:', error);
        this.messagesSubject.next([]);
      }
    });
  }
}