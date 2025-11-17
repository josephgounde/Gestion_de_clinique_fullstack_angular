import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      
      <div class="login-card">
        <div class="card-header">
          <span class="context-label">Gestion Clinique</span>
        </div>

        <h2 class="log-in-title">Log in</h2>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          
          <div class="form-group email-group">
            <div class="input-icon-container">
              <span class="icon">&#64;</span>
              <input 
                type="email" 
                id="email" 
                [(ngModel)]="credentials.email" 
                name="email" 
                required 
                autocomplete="email"
                placeholder="e-mail address"
                class="minimal-input">
            </div>
          </div>
          
          <div class="form-group password-group">
            <div class="input-icon-container">
              <span class="icon">🔒</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                [(ngModel)]="credentials.password" 
                name="password" 
                required 
                autocomplete="current-password"
                placeholder="password"
                class="form-control minimal-input password-input">
              <button
                type="button"
                class="password-toggle"
                (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="legal-notice">
            Pour usage interne exclusivement. En cas de difficultés, contacter le support technique.
          </div>

          <button type="submit" [disabled]="!loginForm.valid || loading" class="btn-primary login-button-style">
            {{ loading ? 'Connexion...' : 'Se connecter' }} 
            <span class="arrow-icon">➔</span>
          </button>
          
          <div *ngIf="error" class="error-message">{{ error }}</div>
        </form>

        <div class="social-login-mimic">
          <button class="facebook-button">
            <span class="f-icon">f</span> Facebook
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Base Container */
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      /* Original background image from your first code snippet */
      background: linear-gradient(rgba(44, 44, 44, 0.4), rgba(36, 36, 36, 0.4)), 
                  url('https://i.pinimg.com/1200x/d7/02/a3/d702a35b02a070645c94d31606b7aa80.jpg') center/cover;
      position: relative;
      overflow: hidden;
    }
    
    /* Login Card - Now with transparency */
    .login-card {
      background: rgba(255, 255, 255, 0.2); /* Semi-transparent white */
      backdrop-filter: blur(10px); /* Frosted glass effect */
      border: 1px solid rgba(255, 255, 255, 0.3); /* Lighter border for transparency */
      padding: 2.5rem;
      border-radius: 20px; 
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); /* Subtle shadow */
      width: 100%;
      max-width: 400px;
      z-index: 1; 
      position: relative;
      color: #fff; /* Ensure text is visible on dark background */
    }

    /* Header and 'Sign up' button */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }
    .context-label {
      font-size: 1.9rem;
      color: rgba(255, 255, 255, 0.7); /* Lighter color for context label */
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    /* Login Title */
    .log-in-title {
      text-align: left;
      color: #fff; /* White text for title */
      margin-bottom: 2.5rem;
      font-size: 2.5rem;
      font-weight: 700;
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 1.5rem;
    }

    /* Input Styling */
    .input-icon-container {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1); /* Transparent input background */
      border-radius: 12px;
      padding: 0 1rem;
      height: 60px; 
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle inner shadow */
    }
    .icon {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.7); /* Lighter icon color */
      margin-right: 1rem;
    }
    .minimal-input {
      border: none;
      background: transparent;
      padding: 0;
      flex-grow: 1;
      font-size: 1rem;
      color: #fff; /* White text for inputs */
    }
    .minimal-input::placeholder {
      color: rgba(255, 255, 255, 0.5); /* Lighter placeholder text */
    }
    .minimal-input:focus {
      outline: none;
    }

    /* Password Specific Styling */
    .password-input-container {
      position: relative;
    }
    .password-input {
      padding-right: 70px; 
    }
    .password-toggle {
      position: absolute;
      right: 55px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      z-index: 1;
    }
    

    /* Legal Notice (Contextual text) */
    .legal-notice {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7); /* Lighter color */
      text-align: center;
      margin: 1.5rem 0;
    }

    /* Submit Button */
    .login-button-style {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 60px; 
      padding: 0 2rem;
      background: rgba(255, 255, 255, 0.8); /* Slightly less transparent white for contrast */
      color: #1a1a1a; /* Dark text for contrast */
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      transition: background 0.3s ease, transform 0.2s ease;
      margin-top: 2rem;
    }
    .login-button-style:hover:not(:disabled) {
      background: #ffffff; /* Fully white on hover */
      transform: translateY(-1px);
    }
    .login-button-style:disabled {
      background: rgba(255, 255, 255, 0.4);
      color: rgba(26, 26, 26, 0.6);
      cursor: not-allowed;
    }
    .arrow-icon {
      font-size: 1.5rem;
    }

    /* Social Login Mimic */
    .social-login-mimic {
        display: flex;
        justify-content: flex-end; 
        margin-top: 1.5rem;
    }
    .facebook-button {
      background: rgba(255, 255, 255, 0.1); /* Transparent background */
      border: 1px solid rgba(255, 255, 255, 0.3); /* Light border */
      color: #fff; /* White text */
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      transition: background 0.2s;
    }
    .facebook-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .f-icon {
      font-weight: 900;
      color: #4267B2; /* Facebook blue */
      margin-right: 5px;
      font-size: 1.1rem;
    }

    /* Error Message */
    .error-message {
      color: #e74c3c;
      margin-top: 1rem;
      text-align: center;
      padding: 0.75rem;
      background: rgba(231, 76, 60, 0.2); /* Slightly transparent error background */
      border-radius: 6px;
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = { email: '', password: '' };
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            switch (user.role) {
              case 'ADMIN':
                this.router.navigate(['/dashboard']);
                break;
              case 'MEDECIN':
                this.router.navigate(['/medecin']);
                break;
              case 'SECRETAIRE':
                this.router.navigate(['/secretaire']);
                break;
              default:
                this.router.navigate(['/dashboard']);
            }
          }
        });
      },
      error: (err) => {
        this.error = 'Identifiants invalides';
        this.loading = false;
      }
    });
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked!');
  }
}