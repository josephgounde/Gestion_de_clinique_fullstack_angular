import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../models/medecin.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  constructor(private http: HttpClient) { }

  // Récupérer tous les médecins
  getAll(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.ALL}`);
  }

  // Créer un médecin
  create(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.CREATE}`, medecin);
  }

  // Mettre à jour un médecin
  update(id: number, medecin: Medecin): Observable<Medecin> {
    return this.http.put<Medecin>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.UPDATE.replace('{id}', id.toString())}`, medecin);
  }
  
  // Supprimer un médecin
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.DELETE.replace('{id}', id.toString())}`);
  }

  // Trouver un médecin par ID
  findById(id: number): Observable<Medecin> {
    return this.http.get<Medecin>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.BY_ID.replace('{id}', id.toString())}`);
  }

  // Méthode de compatibilité
  findAll(): Observable<Medecin[]> {
    return this.getAll();
  }

  createMedecin(medecin: Medecin): Observable<Medecin> {
    return this.create(medecin);
  }

  updateMedecin(id: number, medecin: Medecin): Observable<Medecin> {
    return this.update(id, medecin);
  }

  deleteMedecin(id: number): Observable<void> {
    return this.delete(id);
  }
}
