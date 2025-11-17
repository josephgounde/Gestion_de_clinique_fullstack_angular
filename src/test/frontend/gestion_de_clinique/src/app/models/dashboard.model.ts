// dashboard.model.ts
import { Patient } from './patient.model';
import { Medecin } from './medecin.model';

export interface DashboardStats {
  patients: Patient[];
  medecins: Medecin[];
  rendezvous: any[];
}
