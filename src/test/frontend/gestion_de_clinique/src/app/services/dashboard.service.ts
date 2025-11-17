import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { RendezvousService } from './rendezvous.service';
import { MedecinService } from './medecin.service';
import { PatientService } from './patient.service';

// Interfaces pour le dashboard
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  totalUsers: number;
  activeAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  newPatientsThisMonth: number;
  revenueThisMonth: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  databaseUsage: number;
  serverStatus: string;
  lastBackup: string;
  activeUsers: number;
  systemLoad: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  severity: string;
  icon: string;
}

export interface UserSummary {
  id: string;
  name: string;
  role: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api`;

  constructor(
    private http: HttpClient,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private rendezvousService: RendezvousService
  ) {}

  // Récupérer les statistiques principales du dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      patients: this.patientService.getAll(),
      medecins: this.medecinService.getAll(),
      rendezvous: this.rendezvousService.getAll()
    }).pipe(
      map(({ patients, medecins, rendezvous }) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculer les nouveaux patients ce mois-ci
        const newPatientsThisMonth = patients.filter(patient => {
          if (!patient.dateCreation) return false;
          const createdDate = new Date(patient.dateCreation);
          return createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear;
        }).length;

        // Compter les rendez-vous par statut
        const activeAppointments = rendezvous.filter(r => 
          r.statut === 'Planifié' 
        ).length;

        const pendingAppointments = rendezvous.filter(r => 
          r.statut === 'En attente'
        ).length;

        const completedAppointments = rendezvous.filter(r => 
          r.statut === 'Terminé'
        ).length;

        const cancelledAppointments = rendezvous.filter(r => 
          r.statut === 'Annulé'
        ).length;

        return {
          totalPatients: patients.length,
          totalAppointments: rendezvous.length,
          totalRevenue: this.calculateRevenue(rendezvous),
          totalUsers: medecins.length,
          activeAppointments,
          pendingAppointments,
          completedAppointments,
          cancelledAppointments,
          newPatientsThisMonth,
          revenueThisMonth: this.calculateMonthlyRevenue(rendezvous),
          systemHealth: this.getDemoSystemHealth() // Utilisez getDemoSystemHealth() en attendant
        };
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des statistiques:', error);
        return of(this.getDemoDashboardStats());
      })
    );
  }

  private calculateRevenue(rendezvous: any[]): number {
    // Implémentez la logique de calcul basée sur les rendez-vous
    return rendezvous.filter(r => r.statut === 'Terminé').length * 5000;
  }

  private calculateMonthlyRevenue(rendezvous: any[]): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRendezVous = rendezvous.filter(r => {
      if (!r.dateHeureDebut) return false;
      const rdvDate = new Date(r.dateHeureDebut);
      return rdvDate.getMonth() === currentMonth && 
             rdvDate.getFullYear() === currentYear &&
             r.statut === 'Terminé';
    });
    return monthlyRendezVous.length * 5000;
  }
  
  getRecentActivity(): Observable<RecentActivity[]> {
    return forkJoin({
      patients: this.patientService.getAll(),
      rendezvous: this.rendezvousService.getAll()
    }).pipe(
      map(({ patients, rendezvous }) => {
        const activities: RecentActivity[] = [];
        
        // Derniers patients ajoutés
        const recentPatients = patients
          .sort((a, b) => new Date(b.dateCreation || 0).getTime() - new Date(a.dateCreation || 0).getTime())
          .slice(0, 3);
        
        recentPatients.forEach(patient => {
          activities.push({
            id: `patient-${patient.id}`,
            type: 'user_created',
            title: 'Nouveau Patient',
            description: `${patient.prenom} ${patient.nom} ajouté`,
            timestamp: this.formatTimeAgo(patient.dateCreation),
            severity: 'success',
            icon: '👤'
          });
        });
        
        // Derniers rendez-vous
        const recentRendezVous = rendezvous
          .sort((a, b) => new Date(b.dateHeureDebut || 0).getTime() - new Date(a.dateHeureDebut || 0).getTime())
          .slice(0, 2);
        
        recentRendezVous.forEach(rdv => {
          activities.push({
            id: `rdv-${rdv.id}`,
            type: 'appointment_created',
            title: 'Nouveau Rendez-vous',
            description: `RDV pour le patient #${rdv.patientId}`,
            timestamp: this.formatTimeAgo(rdv.dateHeureDebut),
            severity: 'info',
            icon: '📅'
          });
        });
        
        return activities;
      }),
      catchError(error => {
        console.error('Erreur lors du chargement de l\'activité récente:', error);
        return of(this.getDemoRecentActivity()); // Correction: utiliser getDemoRecentActivity()
      })
    );
  }

  getRecentUsers(): Observable<UserSummary[]> {
    return this.medecinService.getAll().pipe(
      map(medecins => {
        return medecins
          .sort((a, b) => new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime())
          .slice(0, 4)
          .map(medecin => ({
            id: medecin.id?.toString() || '',
            name: `${medecin.prenom} ${medecin.nom}`,
            role: 'medecin',
            status: 'active',
            lastLogin: this.formatTimeAgo(medecin.lastLogin),
            avatar: '👨‍⚕️'
          }));
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des utilisateurs récents:', error);
        return of(this.getDemoRecentUsers()); // Correction: utiliser getDemoRecentUsers()
      })
    );
  }

  private formatTimeAgo(dateString: string | undefined): string {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString();
  }
  
  getQuickActions(): Observable<QuickAction[]> {
    return of(this.getDemoQuickActions());
  }

  getAlerts(): Observable<Alert[]> {
    return of(this.getDemoAlerts());
  }

  markAlertAsRead(alertId: string): Observable<any> {
    return of({ success: true }); // Simulation
  }

  getSystemHealth(): Observable<SystemHealth> {
    return of(this.getDemoSystemHealth());
  }

  // Méthodes de démonstration
  private getDemoDashboardStats(): DashboardStats {
    return {
      totalPatients: 1250,
      totalAppointments: 320,
      totalRevenue: 253000,
      totalUsers: 15,
      activeAppointments: 45,
      pendingAppointments: 23,
      completedAppointments: 285,
      cancelledAppointments: 12,
      newPatientsThisMonth: 45,
      revenueThisMonth: 253000,
      systemHealth: this.getDemoSystemHealth()
    };
  }

  private getDemoRecentActivity(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'user_created',
        title: 'Nouveau Compte Médecin',
        description: 'Dr. Louis Kamdem ajouté par Admin',
        timestamp: 'Il y a 2h',
        severity: 'success',
        icon: '👨‍⚕️'
      },
      {
        id: '2',
        type: 'user_updated',
        title: 'Mise à jour du profil',
        description: 'Secrétaire Mme. Marie - profil mis à jour',
        timestamp: 'Il y a 4h',
        severity: 'info',
        icon: '👩‍💼'
      },
      {
        id: '3',
        type: 'appointment_created',
        title: 'Nouveau rendez-vous',
        description: 'Patient M. Dupont - RDV confirmé pour 14h30',
        timestamp: 'Il y a 6h',
        severity: 'success',
        icon: '📅'
      }
    ];
  }

  private getDemoRecentUsers(): UserSummary[] {
    return [
      {
        id: '1',
        name: 'Dr. Louis Kamdem',
        role: 'medecin',
        status: 'active',
        lastLogin: 'Il y a 2h',
        avatar: '👨‍⚕️'
      },
      {
        id: '2',
        name: 'Mme. Marie Dupont',
        role: 'secretaire',
        status: 'active',
        lastLogin: 'Il y a 4h',
        avatar: '👩‍💼'
      },
      {
        id: '3',
        name: 'Dr. John Smith',
        role: 'medecin',
        status: 'active',
        lastLogin: 'Il y a 6h',
        avatar: '👨‍⚕️'
      }
    ];
  }

  private getDemoQuickActions(): QuickAction[] {
    return [
      {
        id: '1',
        title: 'Ajouter Utilisateur',
        description: 'Créer un nouveau compte',
        icon: '👤',
        route: '/admin/users',
        color: '#1fa183'
      },
      {
        id: '2',
        title: 'Gérer Rendez-vous',
        description: 'Voir tous les RDV',
        icon: '📅',
        route: '/rendez-vous',
        color: '#2a80ec'
      },
      {
        id: '3',
        title: 'Rapports',
        description: 'Générer des rapports',
        icon: '📊',
        route: '/admin/reports',
        color: '#14d260'
      },
      {
        id: '4',
        title: 'Paramètres',
        description: 'Configuration système',
        icon: '⚙️',
        route: '/admin/settings',
        color: '#e07f1b'
      }
    ];
  }

  private getDemoAlerts(): Alert[] {
    return [
      {
        id: '1',
        type: 'warning',
        title: 'Base de données',
        message: 'Utilisation à 80% de capacité',
        timestamp: 'Il y a 12h',
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Mise à jour système',
        message: 'Nouvelle version disponible',
        timestamp: 'Il y a 1j',
        read: true
      }
    ];
  }

  private getDemoSystemHealth(): SystemHealth {
    return {
      databaseUsage: 80,
      serverStatus: 'online',
      lastBackup: 'Il y a 2h',
      activeUsers: 8,
      systemLoad: 65
    };
  }
}