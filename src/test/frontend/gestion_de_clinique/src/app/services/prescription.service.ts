import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Prescription } from '../models/prescription.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  constructor(private http: HttpClient) { }

  // Récupérer toutes les prescriptions
  getAll(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.ALL}`)
      .pipe(
        catchError(error => {
          console.error('Erreur getAll prescriptions:', error);
          return of([]);
        })
      );
  }

  // Récupérer une prescription par ID
  getById(id: number): Observable<Prescription> {
    return this.http.get<Prescription>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.BY_ID.replace('{id}', id.toString())}`);
  }

  // Créer une nouvelle prescription liée à un rendez-vous
  create(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.CREATE}`, prescription);
  }

  // Mettre à jour une prescription via ID
  update(id: number, prescription: Prescription): Observable<Prescription> {
    return this.http.put<Prescription>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.UPDATE.replace('{id}', id.toString())}`, prescription);
  }

  // Supprimer une prescription via ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.DELETE.replace('{id}', id.toString())}`);
  }

  // Récupérer toutes les prescriptions d’un rendez-vous (optionnel)
  getByRendezvous(rendezvousId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.PRESCRIPTION.BY_RDV.replace('{rendezvousId}', rendezvousId.toString())}`);
  }
}
