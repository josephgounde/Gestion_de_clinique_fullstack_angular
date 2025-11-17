export interface RendezVous {
  id?: number;               
  patientId: number;         
  medecinId: number;         
  secretaireId: number;      
  dateHeureDebut: string;    
  dateHeureFin: string;      
  dateAnnulation?: string;   
  motif: string;             
  statut: 'Planifié' | 'Annulé' | 'Terminé' | 'En attente'; 
  salle: string;              
  notes?: string;            
}
