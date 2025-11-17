export interface Prescription {
  id?: number;
  patientId?: number;
  medecinId?: number;
  dateCreation?: string;
  prescriptionDate?: string;
  medicament?: string;
  medicaments?: string;
  posologie?: string;
  dosage?: string;
  duree?: string;
  instructions?: string;
  patientNom?: string;
  patientPrenom?: string;
  medecinNom?: string;
  medecinPrenom?: string;
  effective?: boolean;
  hospitalisationNecessaire?: boolean;
  examensNecessaires?: string;
  motifConsultation?: string;
  dateConsultation?: string;
}

export interface PrescriptionRequest {
  rendezvousId: number;
  medicament: string;
  posologie: string;
  dosage: string;
  prescriptionDate?: string;
  effective?: boolean;
}