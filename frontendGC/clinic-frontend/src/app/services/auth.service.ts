import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest, AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          const userFromToken = this.decodeToken(response.token);
          this.currentUserSubject.next(userFromToken);
        })
      );
  }

  getRedirectUrl(): string {
    const user = this.currentUserSubject.value;
    if (user?.role === 'SECRETAIRE') {
      return '/secretaire';
    } else if (user?.role === 'MEDECIN') {
      return '/medecin';
    }
    return '/dashboard';
  }

  logout(): Observable<any> {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {}),
      // En cas d'erreur, on ignore car le token est déjà supprimé
      catchError(() => of(null))
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const userFromToken = this.decodeToken(token);
      this.currentUserSubject.next(userFromToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private decodeToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || 1,
        nom: payload.nom || 'Utilisateur',
        prenom: payload.prenom || 'Connecté',
        email: payload.sub,
        role: payload.role || 'ADMIN'
      };
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return {
        id: 1,
        nom: 'Utilisateur',
        prenom: 'Connecté',
        email: 'user@example.com',
        role: 'ADMIN'
      };
    }
  }
}