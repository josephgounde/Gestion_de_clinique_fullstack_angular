export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Utilisateur;
}

export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  role: string;
  name?: string; // Pour compatibilité avec l'ancien code
  photo?: string; // Pour compatibilité avec l'ancien code
} 