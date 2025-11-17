import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prescription, PrescriptionRequest } from '../models/prescription.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private apiUrl = 'http://localhost:8080/api/prescription';

  constructor(private http: HttpClient) {}

  createPrescription(prescription: PrescriptionRequest): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/create`, prescription);
  }

  getPrescriptionsByPatient(patientId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getPrescriptionsByMedecin(medecinId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/medecin/${medecinId}`);
  }

  downloadPrescriptionPdf(prescriptionId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${prescriptionId}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  getAllPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/all`);
  }

  getPrescriptionsPaginated(page: number = 0, size: number = 6): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/paginated?page=${page}&size=${size}`);
  }

  getPrescriptionsByMedecinPaginated(medecinId: number, page: number = 0, size: number = 6): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medecin/${medecinId}/paginated?page=${page}&size=${size}`);
  }

  createMultiplePrescription(data: any): Observable<Prescription[]> {
    return this.http.post<Prescription[]>(`${this.apiUrl}/create-multiple`, data);
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}