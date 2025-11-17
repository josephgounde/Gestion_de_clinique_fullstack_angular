import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface StatCard {
  title: string;
  value: number | string;
  unit: string;
  trend: number;
  icon: string;
  color: string;
}

export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  today: number;
}

export interface RevenueStats {
  monthly: number;
  weekly: number;
  daily: number;
  growth: number;
}

export interface PatientStats {
  total: number;
  newThisMonth: number;
  active: number;
  inactive: number;
  averageAge: number;
}

export interface DoctorRanking {
  name: string;
  patients: number;
  rating: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  time: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  patients: number;
  appointments: number;
  revenue: number;
}

export interface ReportFilters {
  period: string;
  startDate?: string;
  endDate?: string;
  doctorId?: number;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api`;

  constructor(private http: HttpClient) {}

  // Récupérer les statistiques principales
  getMainStats(filters: ReportFilters): Observable<StatCard[]> {
    return this.http.get<any>(`${this.apiUrl}/reports/main-stats`, { params: filters as any })
      .pipe(
        map(response => this.transformMainStats(response))
      );
  }

  // Récupérer les statistiques des rendez-vous
  getAppointmentStats(filters: ReportFilters): Observable<AppointmentStats> {
    return this.http.get<AppointmentStats>(`${this.apiUrl}/reports/appointment-stats`, { params: filters as any });
  }

  // Récupérer les statistiques des revenus
  getRevenueStats(filters: ReportFilters): Observable<RevenueStats> {
    return this.http.get<RevenueStats>(`${this.apiUrl}/reports/revenue-stats`, { params: filters as any });
  }

  // Récupérer les statistiques des patients
  getPatientStats(filters: ReportFilters): Observable<PatientStats> {
    return this.http.get<PatientStats>(`${this.apiUrl}/reports/patient-stats`, { params: filters as any });
  }

  // Récupérer le classement des médecins
  getTopDoctors(filters: ReportFilters): Observable<DoctorRanking[]> {
    return this.http.get<DoctorRanking[]>(`${this.apiUrl}/reports/top-doctors`, { params: filters as any });
  }

  // Récupérer l'activité récente
  getRecentActivity(filters: ReportFilters): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/reports/recent-activity`, { params: filters as any });
  }

  // Récupérer les données mensuelles pour les graphiques
  getMonthlyData(filters: ReportFilters): Observable<MonthlyData[]> {
    return this.http.get<MonthlyData[]>(`${this.apiUrl}/reports/monthly-data`, { params: filters as any });
  }

  // Générer un rapport complet
  generateFullReport(filters: ReportFilters): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/generate`, filters);
  }

  // Exporter un rapport
  exportReport(filters: ReportFilters, format: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/reports/export`, { ...filters, format }, { responseType: 'blob' });
  }

  // Récupérer les filtres disponibles
  getAvailableFilters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/filters`);
  }

  // Méthodes privées pour transformer les données
  private transformMainStats(data: any): StatCard[] {
    return [
      {
        title: 'Patients Total',
        value: data.totalPatients || 0,
        unit: 'patients',
        trend: data.patientsGrowth || 0,
        icon: '👥',
        color: '#1fa183'
      },
      {
        title: 'RDV ce mois',
        value: data.monthlyAppointments || 0,
        unit: 'rendez-vous',
        trend: data.appointmentsGrowth || 0,
        icon: '📅',
        color: '#2a80ec'
      },
      {
        title: 'Revenus mensuels',
        value: data.monthlyRevenue || 0,
        unit: 'FCFA',
        trend: data.revenueGrowth || 0,
        icon: '💰',
        color: '#14d260'
      },
      {
        title: 'Utilisateurs actifs',
        value: data.activeUsers || 0,
        unit: 'utilisateurs',
        trend: data.usersGrowth || 0,
        icon: '👨‍⚕️',
        color: '#e07f1b'
      }
    ];
  }

  // Méthodes pour les données de démonstration (fallback)
  getDemoData(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          mainStats: [
            { title: 'Patients Total', value: 1250, unit: 'patients', trend: 12.5, icon: '👥', color: '#1fa183' },
            { title: 'RDV ce mois', value: 320, unit: 'rendez-vous', trend: 8.3, icon: '📅', color: '#2a80ec' },
            { title: 'Revenus mensuels', value: 253000, unit: 'FCFA', trend: 15.2, icon: '💰', color: '#14d260' },
            { title: 'Utilisateurs actifs', value: 15, unit: 'utilisateurs', trend: 5.7, icon: '👨‍⚕️', color: '#e07f1b' }
          ],
          appointmentStats: {
            total: 320,
            completed: 285,
            cancelled: 20,
            pending: 15,
            today: 8
          },
          revenueStats: {
            monthly: 253000,
            weekly: 63250,
            daily: 8433,
            growth: 15.2
          },
          patientStats: {
            total: 1250,
            newThisMonth: 45,
            active: 1180,
            inactive: 70,
            averageAge: 42
          },
          topDoctors: [
            { name: 'Dr. Louis', patients: 156, rating: 4.8 },
            { name: 'Dr. John', patients: 142, rating: 4.7 },
            { name: 'Dr. Anna', patients: 128, rating: 4.9 },
            { name: 'Dr. Marie', patients: 115, rating: 4.6 }
          ],
          recentActivity: [
            { type: 'Nouveau patient', description: 'M. Dupont Jean', time: 'Il y a 2h', icon: '👤' },
            { type: 'RDV confirmé', description: 'Dr. Louis - 14h30', time: 'Il y a 3h', icon: '✅' },
            { type: 'Paiement reçu', description: '25,000 FCFA', time: 'Il y a 4h', icon: '💳' },
            { type: 'Rapport généré', description: 'Rapport mensuel', time: 'Il y a 6h', icon: '📊' }
          ],
          monthlyData: [
            { month: 'Jan', patients: 120, appointments: 280, revenue: 220000 },
            { month: 'Fév', patients: 135, appointments: 295, revenue: 235000 },
            { month: 'Mar', patients: 150, appointments: 310, revenue: 248000 },
            { month: 'Avr', patients: 165, appointments: 325, revenue: 253000 }
          ]
        });
        observer.complete();
      }, 500);
    });
  }
} 