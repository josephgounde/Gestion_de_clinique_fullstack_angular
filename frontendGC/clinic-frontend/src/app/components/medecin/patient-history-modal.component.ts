import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-patient-history-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>📋 Historique Médical - {{ patient?.prenom }} {{ patient?.nom }}</h3>
          <button (click)="close()" class="btn-close">✖</button>
        </div>
        
        <div class="modal-body">
          <div class="patient-summary">
            <div class="summary-item">
              <strong>👤 Patient:</strong>
              <span>{{ patient?.prenom }} {{ patient?.nom }}</span>
            </div>
            <div class="summary-item">
              <strong>🎂 Âge:</strong>
              <span>{{ calculateAge(patient?.dateNaissance) }} ans</span>
            </div>
            <div class="summary-item">
              <strong>📧 Email:</strong>
              <span>{{ patient?.email }}</span>
            </div>
            <div class="summary-item">
              <strong>📞 Téléphone:</strong>
              <span>{{ patient?.telephone }}</span>
            </div>
          </div>

          <div class="medical-info" *ngIf="patient?.antecedents || patient?.allergies">
            <h4>🏥 Informations Médicales</h4>
            <div *ngIf="patient?.antecedents" class="info-section">
              <strong>📋 Antécédents:</strong>
              <p>{{ patient.antecedents }}</p>
            </div>
            <div *ngIf="patient?.allergies" class="info-section alert">
              <strong>⚠️ Allergies:</strong>
              <p>{{ patient.allergies }}</p>
            </div>
          </div>

          <div class="history-sections">
            <div class="section">
              <h4>📅 Rendez-vous Récents</h4>
              <div class="history-list" *ngIf="patientHistory?.rendezvous?.length > 0; else noRendezvous">
                <div *ngFor="let rdv of patientHistory.rendezvous.slice(0, 5)" class="history-item">
                  <div class="item-date">{{ rdv.dateHeureDebut | date:'dd/MM/yyyy' }}</div>
                  <div class="item-details">
                    <strong>{{ rdv.motif || 'Consultation' }}</strong>
                    <p>Statut: {{ getStatusLabel(rdv.statut) }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noRendezvous>
                <p class="no-data">Aucun rendez-vous enregistré</p>
              </ng-template>
            </div>

            <div class="section">
              <h4>💊 Prescriptions Récentes</h4>
              <div class="history-list" *ngIf="patientHistory?.prescriptions?.length > 0; else noPrescriptions">
                <div *ngFor="let prescription of patientHistory.prescriptions.slice(0, 5)" class="history-item">
                  <div class="item-date">{{ prescription.prescriptionDate | date:'dd/MM/yyyy' }}</div>
                  <div class="item-details">
                    <strong>{{ prescription.medicament }}</strong>
                    <p>{{ prescription.posologie }}</p>
                  </div>
                </div>
              </div>
              <ng-template #noPrescriptions>
                <p class="no-data">Aucune prescription enregistrée</p>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="downloadHistoryPdf()" class="btn-primary">📄 Télécharger PDF</button>
          <button (click)="close()" class="btn-secondary">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 2px solid #007bff; }
    .modal-header h3 { margin: 0; color: #007bff; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; }
    .modal-body { padding: 1.5rem; }
    .patient-summary { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .summary-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .summary-item strong { color: #333; min-width: 120px; }
    .medical-info { margin-bottom: 1.5rem; }
    .medical-info h4 { color: #333; margin-bottom: 1rem; }
    .info-section { background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .info-section.alert { background: #fff3cd; border-left: 4px solid #ffc107; }
    .info-section strong { display: block; margin-bottom: 0.5rem; color: #333; }
    .info-section p { margin: 0; color: #666; }
    .history-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .section h4 { color: #333; margin-bottom: 1rem; }
    .history-list { display: flex; flex-direction: column; gap: 1rem; }
    .history-item { display: flex; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 6px; }
    .item-date { font-weight: bold; color: #007bff; min-width: 80px; font-size: 0.9rem; }
    .item-details { flex: 1; }
    .item-details strong { display: block; margin-bottom: 0.25rem; color: #333; }
    .item-details p { margin: 0; color: #666; font-size: 0.9rem; }
    .modal-footer { padding: 1.5rem; border-top: 1px solid #eee; text-align: right; }
    .btn-primary { 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; 
      background: linear-gradient(135deg, #28a745, #20c997); 
      color: white; 
      margin-right: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #20c997, #17a2b8);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }
    .btn-primary:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
    }
    .btn-secondary { 
      padding: 0.75rem 1.5rem; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: 600; 
      background: linear-gradient(135deg, #6c757d, #5a6268); 
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
    }
    .btn-secondary:hover {
      background: linear-gradient(135deg, #5a6268, #495057);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(108, 117, 125, 0.3);
    }
    .btn-secondary:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
    }
    .no-data { color: #666; font-style: italic; text-align: center; padding: 1rem; }
    @media (max-width: 768px) {
      .history-sections { grid-template-columns: 1fr; }
    }
  `]
})
export class PatientHistoryModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() patient: any = null;
  @Output() closed = new EventEmitter<void>();
  
  patientHistory: any = null;
  loading = false;
  
  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && this.patient && this.isVisible) {
      this.loadPatientHistory();
    }
  }
  
  loadPatientHistory(): void {
    if (!this.patient?.id) return;
    
    this.loading = true;
    this.patientService.getPatientHistory(this.patient.id).subscribe({
      next: (history) => {
        this.patientHistory = history;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.loading = false;
        this.notificationService.error('Erreur', 'Impossible de charger l\'historique du patient');
      }
    });
  }
  
  downloadHistoryPdf(): void {
    if (!this.patient?.id) return;
    
    this.patientService.downloadPatientHistoryPdf(this.patient.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique_${this.patient.nom}_${this.patient.prenom}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Téléchargement', 'Historique patient téléchargé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.notificationService.error('Erreur', 'Impossible de télécharger l\'historique');
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  calculateAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  
  getStatusLabel(statut: string): string {
    switch(statut) {
      case 'PLANIFIE': return 'Planifié';
      case 'CONFIRME': return 'Confirmé';
      case 'ANNULE': return 'Annulé';
      case 'TERMINE': return 'Terminé';
      default: return statut || 'Non défini';
    }
  }
}