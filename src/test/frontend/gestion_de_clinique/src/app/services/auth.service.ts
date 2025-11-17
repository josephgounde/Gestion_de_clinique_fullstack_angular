// services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequestDto, AuthResponse, Utilisateur } from '../models/auth.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si un token existe au démarrage
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  login(loginRequest: LoginRequestDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`,
        loginRequest
    )
          .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          // Décoder le JWT pour extraire les informations utilisateur
          const user = this.decodeJwtPayload(response.token);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    // Clear local storage and user state first
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    
    // Try to notify the server, but don't wait for it
    return this.http.post(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGOUT}`, {}).pipe(
      catchError(() => {
        // Even if the server call fails, we still want to proceed with logout
        return of({ success: true });
      })
    );
  }

  getCurrentUser(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.ME}`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
          throw error;
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private decodeJwtPayload(token: string): Utilisateur | null {
    try {
      // Décoder le JWT (format: header.payload.signature)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      // Créer un objet utilisateur à partir du payload JWT
      return {
        id: decodedPayload.sub || decodedPayload.email,
        nom: decodedPayload.nom || '',
        email: decodedPayload.email || decodedPayload.sub,
        role: decodedPayload.role,
        photo: undefined // Pas de photo dans le JWT
      };
    } catch (error) {
      console.error('Erreur lors du décodage du JWT:', error);
      return null;
    }
  }

  get currentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  getAuthHeaders(): any {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}
