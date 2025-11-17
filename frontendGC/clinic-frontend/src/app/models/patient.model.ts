export interface Adresse {
  id?: number;
  street: string;
  houseNumber?: string;
  city: string;
  postalCode: number;
  country: string;
}

export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string;
  telephone: string;
  antecedents?: string;
  allergies?: string;
  adressDto: Adresse;
}