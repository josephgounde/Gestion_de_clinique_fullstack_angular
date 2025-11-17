import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalPatients: number;
  totalMedecins: number;
  totalRendezVous: number;
  rendezVousAujourdhui: number;
  rendezVousEnAttente: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getRecentRendezVous(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/recent-rendezvous`);
  }

  getMedecinStats(medecinId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/medecin/${medecinId}/stats`);
  }

  getRevenuAnnuel(annee: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/factures/revenus/${annee}`);
  }

  getRevenuMensuel(annee: number, mois: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/factures/revenus/${annee}/${mois}`);
  }

  downloadFacturePdf(factureId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/factures/${factureId}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  getAllFactures(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/factures/all');
  }

  updateFactureStatus(factureId: number, statut: string): Observable<any> {
    return this.http.put(`http://localhost:8080/api/factures/${factureId}/status?statut=${statut}`, {});
  }
}