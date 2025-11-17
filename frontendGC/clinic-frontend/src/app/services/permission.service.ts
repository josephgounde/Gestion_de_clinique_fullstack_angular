import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) {}

  canAccessMedecins(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role === 'ADMIN')
    );
  }

  canAccessUsers(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role === 'ADMIN')
    );
  }

  canAccessPatients(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => !!user) // Tous les utilisateurs connectés peuvent accéder aux patients
    );
  }

  canAccessRendezVous(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => !!user) // Tous les utilisateurs connectés peuvent accéder aux rendez-vous
    );
  }

  getCurrentUserRole(): Observable<string | null> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role || null)
    );
  }
}