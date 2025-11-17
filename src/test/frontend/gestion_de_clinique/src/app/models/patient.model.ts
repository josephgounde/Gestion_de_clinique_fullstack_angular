export interface Patient {
  dateCreation?: string;
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'Homme' | 'Femme';
  telephone: string;
  email?: string;
  adresse?: string;
  photo?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  allergies?: string[];
  antecedents?: string[];
  
}