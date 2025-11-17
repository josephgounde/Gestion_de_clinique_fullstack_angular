import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, UserProfile, SecuritySettings, NotificationSettings, SystemSettings, BackupSettings, ThemeSettings } from '../../../services/settings.service';
import { Subject, takeUntil } from 'rxjs';
import { AppHeaderComponent } from '../../../components/app-header/app-header.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent]
})
export class SettingsComponent implements OnInit, OnDestroy {
  
  // Données
  userProfile: UserProfile = {
    id: '',
    username: '',
    email: '',
    fullName: '',
    role: '',
    lastLogin: '',
    isActive: false
  };
  
  securitySettings: SecuritySettings = {
    requirePasswordChange: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    passwordExpiryDays: 90
  };
  
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    systemAlerts: true,
    marketingEmails: false
  };
  
  systemSettings: SystemSettings = {
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    timezone: '',
    language: '',
    currency: '',
    dateFormat: '',
    backupFrequency: '',
    maintenanceMode: false
  };
  
  backupSettings: BackupSettings = {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackup: '',
    nextBackup: '',
    backupLocation: ''
  };
  
  themeSettings: ThemeSettings = {
    primaryColor: '#1fa183',
    secondaryColor: '#2a80ec',
    darkMode: false,
    compactMode: false
  };

  // États
  loading = false;
  error = '';
  success = '';
  activeTab = 'profile';
  
  // Formulaires
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private destroy$ = new Subject<void>();

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadAllSettings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllSettings() {
    this.loading = true;
    this.error = '';

    // Charger toutes les données en parallèle
    this.loadUserProfile();
    this.loadSecuritySettings();
    this.loadNotificationSettings();
    this.loadSystemSettings();
    this.loadBackupSettings();
    this.loadThemeSettings();
  }

  private loadUserProfile() {
    this.settingsService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
          this.error = 'Erreur lors du chargement des données';
          this.loading = false;
        }
      });
  }

  private loadSecuritySettings() {
    this.settingsService.getSecuritySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.securitySettings = settings;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paramètres de sécurité:', error);
        }
      });
  }

  private loadNotificationSettings() {
    this.settingsService.getNotificationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.notificationSettings = settings;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paramètres de notification:', error);
        }
      });
  }

  private loadSystemSettings() {
    this.settingsService.getSystemSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.systemSettings = settings;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paramètres système:', error);
        }
      });
  }

  private loadBackupSettings() {
    this.settingsService.getBackupSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.backupSettings = settings;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paramètres de sauvegarde:', error);
        }
      });
  }

  private loadThemeSettings() {
    this.settingsService.getThemeSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.themeSettings = settings;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des paramètres de thème:', error);
        }
      });
  }

  // Méthodes de sauvegarde
  saveUserProfile() {
    this.loading = true;
    this.settingsService.updateUserProfile(this.userProfile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Profil mis à jour avec succès');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          this.showError('Erreur lors de la mise à jour du profil');
          this.loading = false;
        }
      });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }

    this.loading = true;
    this.settingsService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Mot de passe changé avec succès');
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du changement de mot de passe:', error);
          this.showError('Erreur lors du changement de mot de passe');
          this.loading = false;
        }
      });
  }

  saveSecuritySettings() {
    this.loading = true;
    this.settingsService.updateSecuritySettings(this.securitySettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Paramètres de sécurité mis à jour');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour des paramètres de sécurité:', error);
          this.showError('Erreur lors de la mise à jour des paramètres de sécurité');
          this.loading = false;
        }
      });
  }

  saveNotificationSettings() {
    this.loading = true;
    this.settingsService.updateNotificationSettings(this.notificationSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Paramètres de notification mis à jour');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
          this.showError('Erreur lors de la mise à jour des paramètres de notification');
          this.loading = false;
        }
      });
  }

  saveSystemSettings() {
    this.loading = true;
    this.settingsService.updateSystemSettings(this.systemSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Paramètres système mis à jour');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour des paramètres système:', error);
          this.showError('Erreur lors de la mise à jour des paramètres système');
          this.loading = false;
        }
      });
  }

  saveBackupSettings() {
    this.loading = true;
    this.settingsService.updateBackupSettings(this.backupSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Paramètres de sauvegarde mis à jour');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour des paramètres de sauvegarde:', error);
          this.showError('Erreur lors de la mise à jour des paramètres de sauvegarde');
          this.loading = false;
        }
      });
  }

  saveThemeSettings() {
    this.loading = true;
    this.settingsService.updateThemeSettings(this.themeSettings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Paramètres de thème mis à jour');
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour des paramètres de thème:', error);
          this.showError('Erreur lors de la mise à jour des paramètres de thème');
          this.loading = false;
        }
      });
  }

  // Méthodes utilitaires
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  showSuccess(message: string) {
    this.success = message;
    this.error = '';
    setTimeout(() => {
      this.success = '';
    }, 3000);
  }

  showError(message: string) {
    this.error = message;
    this.success = '';
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }

  exportSettings() {
    this.settingsService.exportSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Erreur lors de l\'export:', error);
          this.showError('Erreur lors de l\'export des paramètres');
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.settingsService.importSettings(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Paramètres importés avec succès');
            this.loadAllSettings();
          },
          error: (error) => {
            console.error('Erreur lors de l\'import:', error);
            this.showError('Erreur lors de l\'import des paramètres');
          }
        });
    }
  }

  retryLoad() {
    this.error = '';
    this.loadAllSettings();
  }
}
