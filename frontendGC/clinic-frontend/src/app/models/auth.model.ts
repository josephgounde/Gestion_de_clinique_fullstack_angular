export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id?: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatarUrl?: string;
  motDePasse?: string;
}