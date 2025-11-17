import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Secretaire } from '../models/secretaire.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class SecretaireService {
  constructor(private http: HttpClient) { }

  // Récupérer tous les secrétaires
  getAll(): Observable<Secretaire[]> {
    return this.http.get<Secretaire[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.ALL}`);
  }

  // Créer un secrétaire
  create(secretaire: Secretaire): Observable<Secretaire> {
    return this.http.post<Secretaire>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.CREATE}`, secretaire);
  }

  // Mettre à jour un secrétaire
  update(id: number, secretaire: Secretaire): Observable<Secretaire> {
    return this.http.put<Secretaire>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.UPDATE.replace('{id}', id.toString())}`, secretaire);
  }

  // Supprimer un secrétaire
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.DELETE.replace('{id}', id.toString())}`);
  }

  // Trouver un secrétaire par ID
  findById(id: number): Observable<Secretaire> {
    return this.http.get<Secretaire>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.BY_ID.replace('{id}', id.toString())}`);
  }

  // Méthode de compatibilité
  findAll(): Observable<Secretaire[]> {
    return this.getAll();
  }

  createSecretaire(secretaire: Secretaire): Observable<Secretaire> {
    return this.create(secretaire);
  }

  updateSecretaire(id: number, secretaire: Secretaire): Observable<Secretaire> {
    return this.update(id, secretaire);
  }

  deleteSecretaire(id: number): Observable<void> {
    return this.delete(id);
  }
}
