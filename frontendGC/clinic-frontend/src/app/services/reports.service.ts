import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id: string;
  title: string;
  description: string;
  data: any;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getDailyReport(): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/daily`);
  }

  getWeeklyReport(): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/weekly`);
  }

  getMonthlyReport(): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/monthly`);
  }

  getPatientReport(): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/patients`);
  }

  getMedecinReport(): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/medecins`);
  }

  exportToPDF(reportType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportType}/pdf`, { responseType: 'blob' });
  }

  exportToExcel(reportType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportType}/excel`, { responseType: 'blob' });
  }
}