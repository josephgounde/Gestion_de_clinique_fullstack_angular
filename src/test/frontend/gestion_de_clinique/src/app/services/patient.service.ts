import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Patient } from '../models/patient.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  // En-têtes HTTP communs et JSON
  private getDefaultHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // GET : récupérer tous les patients
  getAll(): Observable<Patient[]> {
    const headers = this.getDefaultHeaders();
    return this.http.get<Patient[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.ALL}`, { headers })
      .pipe(
        catchError(error => this.handleError<Patient[]>('getAll', [], error))
      );
  }

  // POST : créer un patient
  create(patient: Patient): Observable<Patient> {
    const headers = this.getDefaultHeaders();
    return this.http.post<Patient>(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.CREATE}`, patient, { headers })
      .pipe(
        catchError(error => this.handleError<Patient>('create', undefined, error))
      );
  }

  // PUT : mettre à jour un patient via son ID
  update(id: number, patient: Patient): Observable<Patient> {
    const headers = this.getDefaultHeaders();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.UPDATE.replace('{patientId}', id.toString())}`;
    
    console.log('Update request:', {
      url,
      headers: headers.keys().reduce((acc, key) => ({
        ...acc,
        [key]: headers.get(key)
      }), {})
    });

    return this.http.put<Patient>(url, patient, { 
      headers,
      observe: 'response' as const
    }).pipe(
      tap(response => {
        console.log('Update response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers.keys().reduce((acc, key) => ({
            ...acc,
            [key]: response.headers.getAll(key)
          }), {})
        });
      }),
      map(response => response.body as Patient),
      catchError((error: HttpErrorResponse) => {
        console.error('Update error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          headers: error.headers?.keys().reduce((acc, key) => ({
            ...acc,
            [key]: error.headers?.getAll(key)
          }), {})
        });
        return this.handleError<Patient>('update', undefined, error);
      })
    );
  }

  // DELETE : supprimer un patient via son ID
  delete(id: number): Observable<void> {
    const headers = this.getDefaultHeaders();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.DELETE.replace('{patientId}', id.toString())}`; // IMPORTANT : remplacer patientId !
    return this.http.delete<void>(url, { headers })
      .pipe(
        catchError(error => this.handleError<void>('delete', undefined, error))
      );
  }

  // GET : trouver un patient par ID
  findById(id: number): Observable<Patient> {
    const headers = this.getDefaultHeaders();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.BY_ID.replace('{patientId}', id.toString())}`;
    return this.http.get<Patient>(url, { headers })
      .pipe(
        catchError(error => this.handleError<Patient>('findById', undefined, error))
      );
  }

  // Gestion centralisée des erreurs HTTP
  private handleError<T>(operation = 'operation', result?: T, error?: HttpErrorResponse): Observable<T> {
    console.error(`${operation} failed:`, error);
    return of(result as T);
  }
}
