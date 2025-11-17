import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Medecin } from '../models/medecin.model';
import { Patient } from '../models/patient.model';
import { Secretaire } from '../models/secretaire.model';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  nom: string;
  role: string;
  email: string;
  statut: string;
  password?: string;
  photo?: string;
  // Champs spécifiques selon le rôle
  specialite?: string; // Pour médecin
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  numeroSecuriteSociale?: string; // Pour patient
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Préparer les headers par défaut pour les requêtes HTTP
  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Récupérer tous les utilisateurs (médecins, secrétaires, patients) en une seule requête forkJoin
  getAllUsers(): Observable<User[]> {
    const headers = this.getDefaultHeaders();

    return forkJoin({
      medecins: this.http.get<Medecin[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.ALL}`, { headers }).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, 'doctors'))
      ),
      secretaires: this.http.get<Secretaire[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.ALL}`, { headers }).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, 'secretaries'))
      ),
      patients: this.http.get<Patient[]>(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.ALL}`, { headers }).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error, 'patients'))
      )
    }).pipe(
      map(results => {
        const users: User[] = [];

        // Conversion des médecins en User
        results.medecins.forEach((medecin: { id: any; nom: any; email: any; specialite: any; telephone: any; photo: any; }) => {
          users.push({
            id: medecin.id || 0,
            nom: medecin.nom,
            role: 'Médecin',
            email: medecin.email,
            statut: 'Active',
            specialite: medecin.specialite,
            telephone: medecin.telephone,
            photo: medecin.photo || 'assets/images/users/default-doctor.svg'
          });
        });

        // Conversion des secrétaires en User
        results.secretaires.forEach((secretaire: { id: any; nom: any; email: any; telephone: any; photo: any; }) => {
          users.push({
            id: secretaire.id || 0,
            nom: secretaire.nom,
            role: 'Secrétaire',
            email: secretaire.email,
            statut: 'Active',
            telephone: secretaire.telephone,
            photo: secretaire.photo || 'assets/images/users/default-secretary.svg'
          });
        });

        // Conversion des patients en User
        results.patients.forEach((patient: { id: any; nom: any; email: any; telephone: any; adresse: any; dateNaissance: any; numeroSecuriteSociale: any; photo: any; }) => {
          users.push({
            id: patient.id || 0,
            nom: patient.nom,
            role: 'Patient',
            email: patient.email || '',
            statut: 'Active',
            telephone: patient.telephone,
            adresse: patient.adresse,
            dateNaissance: patient.dateNaissance,
            numeroSecuriteSociale: patient.numeroSecuriteSociale,
            photo: patient.photo || 'assets/images/users/default-patient.svg'
          });
        });

        return users;
      })
    );
  }

  // Créer un utilisateur selon son rôle (POST)
  createUser(user: User): Observable<any> {
    const headers = this.getDefaultHeaders();

    switch (user.role) {
      case 'Médecin':
        const medecinData: Partial<Medecin> = {
          nom: user.nom,
          email: user.email,
          specialite: user.specialite,
          telephone: user.telephone,
          photo: user.photo
        };
        return this.http.post(`${API_CONFIG.BASE_URL}${API_CONFIG.MEDECIN.CREATE}`, medecinData, { headers });

      case 'Secrétaire':
        const secretaireData: Partial<Secretaire> = {
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          photo: user.photo
        };
        return this.http.post(`${API_CONFIG.BASE_URL}${API_CONFIG.SECRETAIRE.CREATE}`, secretaireData, { headers });

      case 'Patient':
        const patientData: Partial<Patient> = {
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse,
          dateNaissance: user.dateNaissance,         
          photo: user.photo
        };
        return this.http.post(`${API_CONFIG.BASE_URL}${API_CONFIG.PATIENT.CREATE}`, patientData, { headers });

      default:
        throw new Error('Type d\'utilisateur non supporté');
    }
  }

  // Récupérer un utilisateur par son ID (GET)
  getUserById(id: number, userType: string): Observable<User> {
    const headers = this.getDefaultHeaders();
    let url: string;

    switch (userType) {
      case 'Médecin':
        url = API_CONFIG.MEDECIN.BY_ID.replace('{id}', id.toString());
        break;
      case 'Secrétaire':
        url = API_CONFIG.SECRETAIRE.BY_ID.replace('{id}', id.toString());
        break;
      case 'Patient':
        url = API_CONFIG.PATIENT.BY_ID.replace('{id}', id.toString());
        break;
      default:
        throw new Error('Type d\'utilisateur non supporté');
    }

    return this.http.get<User>(`${API_CONFIG.BASE_URL}${url}`, { headers });
  }

  // Mettre à jour un utilisateur (PUT)
  updateUser(user: User): Observable<any> {
    const headers = this.getDefaultHeaders();

    switch (user.role) {
      case 'Médecin':
        const medecinData: Partial<Medecin> = {
          id: user.id,
          nom: user.nom,
          email: user.email,
          specialite: user.specialite,
          telephone: user.telephone,
          photo: user.photo
        };
        const medecinUrl = API_CONFIG.MEDECIN.UPDATE.replace('{id}', user.id.toString());
        return this.http.put(`${API_CONFIG.BASE_URL}${medecinUrl}`, medecinData, { headers });

      case 'Secrétaire':
        const secretaireData: Partial<Secretaire> = {
          id: user.id,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          photo: user.photo
        };
        const secretaireUrl = API_CONFIG.SECRETAIRE.UPDATE.replace('{id}', user.id.toString());
        return this.http.put(`${API_CONFIG.BASE_URL}${secretaireUrl}`, secretaireData, { headers });

      case 'Patient':
        const patientData: Partial<Patient> = {
          id: user.id,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse,
          dateNaissance: user.dateNaissance,
          photo: user.photo
        };
        const patientUrl = API_CONFIG.PATIENT.UPDATE.replace('{id}', user.id.toString());
        return this.http.put(`${API_CONFIG.BASE_URL}${patientUrl}`, patientData, { headers });

      default:
        throw new Error('Type d\'utilisateur non supporté');
    }
  }

  // Supprimer un utilisateur (DELETE)
  deleteUser(user: User): Observable<any> {
    const headers = this.getDefaultHeaders();
    let url: string;

    switch (user.role) {
      case 'Médecin':
        url = API_CONFIG.MEDECIN.DELETE.replace('{id}', user.id.toString());
        break;

      case 'Secrétaire':
        url = API_CONFIG.SECRETAIRE.DELETE.replace('{id}', user.id.toString());
        break;

      case 'Patient':
        url = API_CONFIG.PATIENT.DELETE.replace('{id}', user.id.toString());
        break;

      default:
        throw new Error('Type d\'utilisateur non supporté');
    }

    return this.http.delete(`${API_CONFIG.BASE_URL}${url}`, { headers });
  }

  // Gestion centralisée des erreurs HTTP
  private handleError(error: HttpErrorResponse, entity: string): Observable<any> {
    if (error.status === 401) {
      // Déconnexion en cas d’erreur d’authentification
      this.authService.logout().subscribe();
    }
    console.error(`Error fetching ${entity}:`, error);
    return of([]); // Retourne un Observable vide pour continuer le flux
  }
}
