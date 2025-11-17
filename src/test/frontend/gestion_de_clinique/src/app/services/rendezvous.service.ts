import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../models/rendezvous.model';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RendezvousService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Récupérer tous les rendez-vous
  private getAuthHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.ALL}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Récupérer un rendez-vous par ID
  getById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.BY_ID.replace('{id}', id.toString())}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Créer un rendez-vous
  create(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.CREATE}`,
      rdv,
      { headers: this.getAuthHeaders() }
    );
  }

  // Mettre à jour un rendez-vous (assurez-vous que PUT est supporté backend)
  update(id: number, rdv: RendezVous): Observable<RendezVous> {
    return this.http.put<RendezVous>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.UPDATE.replace('{id}', id.toString())}`,
      rdv,
      { headers: this.getAuthHeaders() }
    );
  }

  // Supprimer un rendez-vous par ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.DELETE.replace('{rendezvousId}', id.toString())}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Annuler un rendez-vous spécifique
  cancel(id: number): Observable<any> {
    return this.http.delete(
      `${API_CONFIG.BASE_URL}${API_CONFIG.RENDEZVOUS.CANCEL.replace('{id}', id.toString())}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
