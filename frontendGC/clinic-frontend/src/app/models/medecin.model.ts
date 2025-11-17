import { Adresse } from './patient.model';

export enum Role {
  ADMIN = 'ADMIN',
  MEDECIN = 'MEDECIN',
  SECRETAIRE = 'SECRETAIRE'
}

export interface Medecin {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  motDePasse?: string;
  adressDto: Adresse;
  role: Role;
}