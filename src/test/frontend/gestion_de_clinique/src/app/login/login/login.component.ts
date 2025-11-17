import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequestDto } from '../../models/auth.model';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequestDto = {
      email: this.email,
      password: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Vérification que la réponse contient un token
        if (!response || !response.token) {
          console.error('Réponse de connexion invalide:', response);
          this.errorMessage = 'Erreur de connexion: token manquant';
          return;
        }
        
        // Récupérer l'utilisateur depuis le service (déjà décodé du JWT)
        const currentUser = this.authService.currentUser;
        if (!currentUser || !currentUser.role) {
          console.error('Utilisateur non trouvé après connexion');
          this.errorMessage = 'Erreur de connexion: informations utilisateur manquantes';
          return;
        }
        
        // Redirection selon le rôle
        if (currentUser.role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else if (currentUser.role === 'MEDECIN') {
          this.router.navigate(['/dashboard-medecin']);
        } else if (currentUser.role === 'SECRETAIRE') {
          this.router.navigate(['/dashboard-secretaire']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur de connexion:', error);
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else {
          this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        }
      }
    });
  }
}
