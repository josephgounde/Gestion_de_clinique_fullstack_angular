// Modèle Prescription avec liaison au rendez-vous par rendezvousId
export interface Prescription {
  id?: number;                 
  rendezvousId: number;        
  patientId: number;           
  medecinId: number;           
  datePrescription: string;    
  medicaments: string;         
  posologie: string;           
  dureeTraitement: string;     
  notes?: string;              
  statut: 'Active' | 'Suspendue' | 'Terminée';
  actions?: string;  
}
