import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conflict-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="conflict-icon">⚠️</div>
          <h3>Conflit d'horaire détecté</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
          <div class="suggestion">
            💡 Suggestion : Vérifiez les créneaux disponibles ou choisissez une autre heure.
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="close()" class="btn-ok">Compris</button>
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
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }
    .modal-header {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
      padding: 1.5rem;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .conflict-icon {
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
      text-align: center;
    }
    .modal-body p {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1rem;
    }
    .suggestion {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      color: #666;
      font-size: 0.9rem;
      border-left: 4px solid #ffc107;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      text-align: center;
    }
    .btn-ok {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-ok:hover {
      background: linear-gradient(135deg, #20c997, #1e7e34);
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
export class ConflictModalComponent {
  @Input() isVisible = false;
  @Input() message = '';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }
}