import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
}

export interface SearchResult {
  id: number;
  type: 'patient' | 'medecin' | 'rendezvous';
  title: string;
  subtitle: string;
  description: string;
  date?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8080/api/search';

  constructor(private http: HttpClient) {}

  globalSearch(query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult[]>(`${this.apiUrl}/global`, { params });
  }

  searchPatients(filters: SearchFilters): Observable<SearchResult[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<SearchResult[]>(`${this.apiUrl}/patients`, { params });
  }

  searchMedecins(filters: SearchFilters): Observable<SearchResult[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<SearchResult[]>(`${this.apiUrl}/medecins`, { params });
  }

  searchRendezVous(filters: SearchFilters): Observable<SearchResult[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<SearchResult[]>(`${this.apiUrl}/rendezvous`, { params });
  }
}