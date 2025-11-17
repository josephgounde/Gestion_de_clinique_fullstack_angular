import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disponibilite } from '../models/disponibilite.model'; 

@Injectable({
  providedIn: 'root'
})
export class DisponibiliteService {

  private apiUrl = 'http://localhost:8080/api/disponibilites';


  constructor(private http: HttpClient) { }

  getAll(): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(this.apiUrl);
  }

  create(disponibilite: Disponibilite): Observable<Disponibilite> {
    return this.http.post<Disponibilite>(this.apiUrl, disponibilite);
  }

  update(id: number, disponibilite: Disponibilite): Observable<Disponibilite> {
    return this.http.put<Disponibilite>(`${this.apiUrl}/${id}`, disponibilite);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
