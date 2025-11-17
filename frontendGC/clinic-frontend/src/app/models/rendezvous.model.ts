export enum StatutRendezVous {
  PLANIFIE = 'PLANIFIER',
  CONFIRME = 'CONFIRMER', 
  ANNULE = 'ANNULER',
  TERMINE = 'TERMINER'
}

export interface RendezVous {
  id?: number;
  dateHeureDebut: string;
  motif: string;
  salle?: string;
  statut: StatutRendezVous;
  patientId: number;
  patientNom?: string;
  medecinDTO?: {
    id: number;
    nom: string;
    prenom: string;
    specialite: string;
  };
}

export interface RendezVousRequest {
  dateHeureDebut: string;
  motif: string;
  salle?: string;
  patientId: number;
  medecinId: number;
}