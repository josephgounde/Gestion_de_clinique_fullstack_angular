import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous, RendezVousRequest } from '../models/rendezvous.model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = 'http://localhost:8080/api/rendezvous';

  constructor(private http: HttpClient) {}

  getAllRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/all`);
  }

  getRendezVousById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  createRendezVous(rendezVous: RendezVousRequest): Observable<RendezVous> {
    return this.http.post<RendezVous>(`${this.apiUrl}/create`, rendezVous);
  }

  updateRendezVous(id: number, rendezVous: RendezVousRequest): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/update/${id}`, rendezVous);
  }

  cancelRendezVous(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cancel/${id}`);
  }

  deleteRendezVous(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  updateRendezVousStatus(id: number, statut: string): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/update-status/${id}?statut=${statut}`, {});
  }

  getUpcomingRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/all/upcoming`);
  }

  getRendezVousPaginated(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/paginated?page=${page}&size=${size}`);
  }
}