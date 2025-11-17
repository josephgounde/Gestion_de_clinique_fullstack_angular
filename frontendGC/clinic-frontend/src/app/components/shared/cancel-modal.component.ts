import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cancel-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="cancel-icon">❌</div>
          <h3>Annuler le rendez-vous</h3>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir annuler ce rendez-vous ?</p>
          <div class="form-group">
            <label>Motif d'annulation (optionnel) :</label>
            <textarea [(ngModel)]="reason" placeholder="Ex: Patient indisponible, urgence..." 
                     rows="3" class="form-control"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="confirm()" class="btn-confirm">Confirmer l'annulation</button>
          <button (click)="close()" class="btn-cancel">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }
    .modal-header {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .cancel-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .modal-body {
      padding: 1.5rem;
    }
    .modal-body p {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1rem;
      text-align: center;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      box-sizing: border-box;
      resize: vertical;
    }
    .form-control:focus {
      border-color: #dc3545;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-confirm, .btn-cancel {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-confirm {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
    }
    .btn-confirm:hover {
      background: linear-gradient(135deg, #c82333, #a71e2a);
      transform: translateY(-2px);
    }
    .btn-cancel {
      background: linear-gradient(135deg, #6c757d, #5a6268);
      color: white;
    }
    .btn-cancel:hover {
      background: linear-gradient(135deg, #5a6268, #495057);
      transform: translateY(-2px);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class CancelModalComponent {
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<string>();

  reason = '';

  confirm(): void {
    this.confirmed.emit(this.reason);
    this.close();
  }

  close(): void {
    this.reason = '';
    this.isVisible = false;
    this.closed.emit();
  }
}