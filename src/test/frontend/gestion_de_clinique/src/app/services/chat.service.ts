import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatMessageRequestDto, ChatMessageDto, UnreadMessageCounts } from '../models/chat.model';
import { AuthService } from './auth.service'; // Service qui gère l’authentification / token
import { API_CONFIG } from '../config/api.config';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: WebSocket | null = null;

  // Observables pour message et comptage non lus
  private messagesSubject = new BehaviorSubject<ChatMessageDto[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountsSubject = new BehaviorSubject<UnreadMessageCounts>({});
  public unreadCounts$ = this.unreadCountsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Initialise la connexion WebSocket et gère les événements
  initializeWebSocket(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Déjà connecté
      return;
    }

    // Connexion au WebSocket défini dans la config
    this.socket = new WebSocket(API_CONFIG.WEBSOCKET.URL);

    // À l’ouverture, envoie le token d’authentification
    this.socket.onopen = () => {
      console.log('WebSocket connecté');
      const token = this.authService.getToken();
      if (token) {
        this.socket?.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    // À la réception d’un message, le traite
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleIncomingMessage(message);
    };

    // Tentative de reconnexion automatique en cas de déconnexion
    this.socket.onclose = () => {
      console.log('WebSocket déconnecté, reconnexion dans 5s');
      setTimeout(() => {
        this.initializeWebSocket();
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
  }

  // Envoie un message via WebSocket (ne fonctionne que si socket est ouverte)
  sendMessage(receiverId: number, content: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: ChatMessageRequestDto = { receiverId, content };
      this.socket.send(JSON.stringify({ type: 'message', data: message }));
    } else {
      console.warn('WebSocket non connectée, message non envoyé');
    }
  }

  // Marque les messages reçus d’un expéditeur comme lus via API REST
  markAsRead(senderId: number): void {
    const url = API_CONFIG.BASE_URL + (API_CONFIG.CHAT.MARK_READ?.replace('{senderId}', senderId.toString()) ?? '');
    this.http.post(url, {}).subscribe(() => {
      this.updateMessageReadStatus(senderId);
    });
  }

  // Récupère une conversation complète via HTTP GET
  getConversation(otherUserId: number): Observable<ChatMessageDto[]> {
    const url = API_CONFIG.BASE_URL + API_CONFIG.CHAT.CONVERSATION.replace('{otherUserId}', otherUserId.toString());
    return this.http.get<ChatMessageDto[]>(url);
  }

  // Récupère les messages non lus via HTTP GET
  getUnreadMessages(): Observable<ChatMessageDto[]> {
    const url = API_CONFIG.BASE_URL + API_CONFIG.CHAT.UNREAD;
    return this.http.get<ChatMessageDto[]>(url);
  }

  // Récupère le nombre de messages non lus par expéditeur via HTTP GET
  getUnreadMessageCounts(): Observable<UnreadMessageCounts> {
    const url = API_CONFIG.BASE_URL + API_CONFIG.CHAT.UNREAD_COUNTS;
    return this.http.get<UnreadMessageCounts>(url);
  }

  // Charge et met à jour les messages d’une conversation dans l’observable
  loadConversation(otherUserId: number): void {
    this.getConversation(otherUserId).subscribe(messages => {
      this.messagesSubject.next(messages);
    });
  }

  // Déconnecte proprement le websocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Vérifie si le websocket est ouvert
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Traite les messages reçus du websocket
  private handleIncomingMessage(message: any): void {
    if (message.type === 'chat_message') {
      const currentMessages = this.messagesSubject.value;
      const newMessage: ChatMessageDto = message.data;
      this.messagesSubject.next([...currentMessages, newMessage]);

    } else if (message.type === 'unread_counts') {
      this.unreadCountsSubject.next(message.data);
    }
  }

  // Met à jour localement les messages comme lus d’un expéditeur
  private updateMessageReadStatus(senderId: number): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.senderId === senderId ? { ...msg, isRead: true } : msg
    );
    this.messagesSubject.next(updatedMessages);
  }
}
