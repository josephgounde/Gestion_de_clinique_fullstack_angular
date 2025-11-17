import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📸 Changer la photo de profil</h3>
          <button (click)="close()" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="current-avatar">
            <img [src]="currentUser?.avatarUrl || getDefaultAvatar()" alt="Avatar actuel" class="avatar-preview">
          </div>
          <div class="avatar-options">
            <h4>Choisir un avatar :</h4>
            <div class="avatar-grid">
              <img *ngFor="let avatar of avatarOptions" 
                   [src]="avatar" 
                   (click)="selectAvatar(avatar)"
                   [class.selected]="selectedAvatar === avatar"
                   class="avatar-option">
            </div>
          </div>
          <div class="custom-url">
            <label>Ou entrer une URL personnalisée :</label>
            <input [(ngModel)]="customUrl" placeholder="https://..." class="url-input">
            <button (click)="selectAvatar(customUrl)" [disabled]="!customUrl" class="btn-use-url">Utiliser</button>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="saveAvatar()" [disabled]="!selectedAvatar" class="btn-save">💾 Sauvegarder</button>
          <button (click)="close()" class="btn-cancel">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow: hidden; }
    .modal-content { background: white; border-radius: 12px; width: 500px; max-height: 600px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .modal-body { padding: 1.5rem; max-height: 450px; overflow-y: auto; }
    .current-avatar { text-align: center; margin-bottom: 1.5rem; }
    .avatar-preview { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ddd; }
    .avatar-options h4 { margin-bottom: 1rem; }
    .avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .avatar-option { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid transparent; transition: all 0.3s; }
    .avatar-option:hover { border-color: #007bff; transform: scale(1.1); }
    .avatar-option.selected { border-color: #28a745; transform: scale(1.1); }
    .custom-url { margin-bottom: 1rem; }
    .custom-url label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .url-input { width: 70%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .btn-use-url { padding: 0.5rem 1rem; margin-left: 0.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .modal-footer { display: flex; gap: 1rem; padding: 1rem; border-top: 1px solid #eee; justify-content: flex-end; }
    .btn-save { background: #28a745; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; }
    .btn-cancel { background: #6c757d; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; }
    .btn-save:disabled { background: #ccc; cursor: not-allowed; }
  `]
})
export class ProfileModalComponent {
  @Input() isVisible = false;
  @Input() currentUser: any = null;
  @Output() closed = new EventEmitter<void>();
  @Output() avatarUpdated = new EventEmitter<string>();

  selectedAvatar = '';
  customUrl = '';

  avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=8'
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  getDefaultAvatar(): string {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  saveAvatar(): void {
    if (!this.selectedAvatar) return;

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.put('http://localhost:8080/api/profile/avatar', 
      { avatarUrl: this.selectedAvatar }, 
      { headers }
    ).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Photo de profil mise à jour');
        this.avatarUpdated.emit(this.selectedAvatar);
        this.close();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de mettre à jour la photo');
      }
    });
  }

  close(): void {
    this.isVisible = false;
    this.selectedAvatar = '';
    this.customUrl = '';
    this.closed.emit();
  }
}