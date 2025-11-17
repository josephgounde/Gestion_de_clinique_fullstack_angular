import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationsComponent } from "../../notifications/notifications.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationsComponent],
  template: `
    <div class=" sticky top-0 flex justify-between items-center py-5 px-7 bg-white  shadow-[0_2px_10px_rgba(0,0,0,0.1)] mb-7 flex-col md:flex-row gap-5 md:gap-0 my-0 z-50">
      <div class="flex items-center">
        <!-- <div class="flex items-center gap-4">
          <svg class="w-8 h-8 flex-shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#1fa183"/>
            <path d="M19 14L17.5 15.5L19 17L17.5 18.5L19 20L17.5 21.5L19 23" stroke="#1fa183" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 14L6.5 15.5L5 17L6.5 18.5L5 20L6.5 21.5L5 23" stroke="#1fa183" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="flex flex-col">
            <h1 class="text-3xl font-bold text-[#1fa183] m-0 tracking-wide md:text-2xl sm:text-xl">MediClin</h1>
            <p class="text-sm text-gray-600 m-0 font-medium">Centre de Santé</p>
          </div>
        </div> -->
      </div>
      
      <div class="text-center flex-1 mx-5 order-first md:order-none">
        <h2 class="text-2xl font-semibold text-gray-800 mb-1 md:text-xl sm:text-lg">{{ pageTitle }}</h2>
        <p class="text-sm text-gray-600 m-0">{{ pageSubtitle }}</p>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <app-notifications></app-notifications>
        
        <!-- User Profile -->
        <div class="flex items-center gap-3 flex-col md:flex-row md:gap-3">
          <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-50 sm:w-10 sm:h-10">
            <img [src]="getUserPhoto()" [alt]="getUserName()" class="w-full h-full object-cover rounded-full">
          </div>
          <div class="flex flex-col items-start gap-0.5 items-center md:items-start text-center md:text-left">
            <span class="text-xs text-gray-600 font-medium">{{ getUserRole() }}</span>
            <span class="text-base font-semibold text-gray-800">{{ getUserName() }}</span>
          </div>
        </div>
        <!-- <button class="flex items-center justify-center bg-red-500 text-white border-none p-0 rounded-full cursor-pointer w-9 h-9 min-w-9 min-h-9 transition-all duration-300 shadow-[0_2px_6px_rgba(233,68,68,0.08)] hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(233,68,68,0.18)] hover:-translate-y-0.5 hover:scale-105 focus:bg-red-600 focus:shadow-[0_4px_12px_rgba(233,68,68,0.18)] focus:-translate-y-0.5 focus:scale-105 sm:w-9 sm:h-9 sm:p-2" (click)="onLogout()" title="Se déconnecter">
          <span aria-hidden="true">
            <svg class="block w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17L21 12L16 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12H9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button> -->
      </div>
    </div>
  `,
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent {
  @Input() pageTitle: string = '';
  @Input() pageSubtitle: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  getUserName(): string {
    const user = this.authService.currentUser;
    return user ? (user.name || user.nom) : '';
  }

  getUserRole(): string {
    const user = this.authService.currentUser;
    if (!user) return '';
    
    switch (user.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MEDECIN':
        return 'Médecin';
      case 'SECRETAIRE':
        return 'Secrétaire';
      default:
        return user.role;
    }
  }

  getUserPhoto(): string {
    const user = this.authService.currentUser;
    if (user && user.photo) {
      return user.photo;
    }
    return this.getDefaultPhoto(user?.role || '');
  }

  getDefaultPhoto(role: string): string {
    switch (role) {
      case 'MEDECIN':
        return '/assets/images/users/default-doctor.svg';
      case 'SECRETAIRE':
        return '/assets/images/users/default-secretary.svg';
      case 'ADMIN':
        return '/assets/images/users/default-admin.svg';
      default:
        return '/assets/images/users/default-user.svg';
    }
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
} 