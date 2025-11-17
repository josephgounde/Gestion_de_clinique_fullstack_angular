import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendezvous.service';
import { MedecinService } from '../../services/medecin.service';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../services/notification.service';
import { RendezVous, RendezVousRequest } from '../../models/rendezvous.model';
import { Medecin } from '../../models/medecin.model';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <h2>📅 Calendrier des Rendez-vous</h2>
        <div class="filters">
          <select [(ngModel)]="selectedMedecinId" (change)="updateFilters()" class="filter-select">
            <option value="">Tous les médecins</option>
            <option *ngFor="let medecin of medecins" [value]="medecin.id">
              Dr. {{medecin.nom}} {{medecin.prenom}}
            </option>
          </select>
          <select [(ngModel)]="selectedSalle" (change)="updateFilters()" class="filter-select">
            <option value="">Toutes les salles</option>
            <option *ngFor="let salle of salles" [value]="salle">
              {{salle}}
            </option>
          </select>
          <button (click)="showCreateModal = true" class="btn-primary">➕ Nouveau RDV</button>
        </div>
      </div>

      <!-- Calendrier simple -->
      <div class="simple-calendar">
        <div class="calendar-nav">
          <button (click)="previousWeek()" class="nav-btn">‹ Précédent</button>
          <h3>{{getCurrentWeekLabel()}}</h3>
          <button (click)="nextWeek()" class="nav-btn">Suivant ›</button>
        </div>
        
        <div class="calendar-grid">
          <div class="time-column">
            <div class="time-header">Heure</div>
            <div *ngFor="let hour of hours" class="time-slot">{{hour}}:00</div>
          </div>
          
          <div *ngFor="let day of currentWeekDays" class="day-column">
            <div class="day-header">{{day.label}}</div>
            <div *ngFor="let hour of hours" class="hour-slot" 
                 (click)="selectTimeSlot(day.date, hour)"
                 [class.has-rdv]="hasRendezVous(day.date, hour)">
              <div *ngFor="let rdv of getRendezVousForSlot(day.date, hour)" 
                   class="rdv-item" 
                   [style.background-color]="getEventColor(rdv)"
                   (click)="editRendezVous(rdv); $event.stopPropagation()">
                {{rdv.motif}} - {{rdv.patientNom}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal création RDV -->
      <div *ngIf="showCreateModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Nouveau Rendez-vous</h3>
          <div *ngIf="conflictWarning" class="conflict-warning">{{conflictWarning}}</div>
          <form (ngSubmit)="createRendezVous()">
            <div class="form-group">
              <label>Patient:</label>
              <select [(ngModel)]="newRdv.patientId" name="patientId" (change)="checkConflicts()" required>
                <option value="">Sélectionner un patient</option>
                <option *ngFor="let patient of patients" [value]="patient.id">
                  {{patient.nom}} {{patient.prenom}}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Date/Heure:</label>
              <input type="datetime-local" [(ngModel)]="newRdv.dateHeureDebut" name="dateHeureDebut" 
                     (change)="checkConflicts()" required>
            </div>
            <div class="form-group">
              <label>Médecin:</label>
              <select [(ngModel)]="newRdv.medecinId" name="medecinId" (change)="checkConflicts()" required>
                <option value="">Sélectionner</option>
                <option *ngFor="let medecin of medecins" [value]="medecin.id">
                  Dr. {{medecin.nom}} {{medecin.prenom}}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Motif:</label>
              <input [(ngModel)]="newRdv.motif" name="motif" required>
            </div>
            <div class="form-group">
              <label>Salle:</label>
              <input [(ngModel)]="newRdv.salle" name="salle">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Créer</button>
              <button type="button" (click)="closeModal()" class="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container { padding: 2rem; }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .filters { display: flex; gap: 1rem; align-items: center; }
    .filter-select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .btn-primary { background: #007bff; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; }
    .simple-calendar { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .calendar-nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
    .nav-btn { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .calendar-grid { display: flex; }
    .time-column { width: 80px; border-right: 1px solid #dee2e6; }
    .time-header { padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; font-weight: bold; text-align: center; }
    .time-slot { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: center; font-size: 0.9rem; }
    .day-column { flex: 1; border-right: 1px solid #dee2e6; }
    .day-header { padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; font-weight: bold; text-align: center; }
    .hour-slot { min-height: 60px; border-bottom: 1px solid #eee; cursor: pointer; position: relative; padding: 2px; }
    .hour-slot:hover { background: #f8f9fa; }
    .hour-slot.has-rdv { background: #e3f2fd; }
    .rdv-item { background: #007bff; color: white; padding: 0.25rem 0.5rem; margin: 2px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 400px; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .conflict-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class CalendarComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  medecins: Medecin[] = [];
  patients: Patient[] = [];
  selectedMedecinId = '';
  selectedSalle = '';
  salles: string[] = [];
  showCreateModal = false;
  conflictWarning = '';
  currentWeekStart = new Date();
  hours = Array.from({length: 12}, (_, i) => i + 8); // 8h à 19h
  currentWeekDays: {date: Date, label: string}[] = [];
  
  newRdv: RendezVousRequest = {
    dateHeureDebut: '',
    motif: '',
    salle: '',
    patientId: 0,
    medecinId: 0
  };

  constructor(
    private rendezVousService: RendezVousService,
    private medecinService: MedecinService,
    private patientService: PatientService,
    private notificationService: NotificationService
  ) {
    this.setCurrentWeek();
  }

  ngOnInit(): void {
    this.loadRendezVous();
    this.loadMedecins();
    this.loadPatients();
    // WebSocket optionnel
    try {
      this.subscribeToNotifications();
    } catch (error) {
      console.warn('WebSocket non disponible, fonctionnement en mode dégradé');
    }
  }

  subscribeToNotifications(): void {
    // Simuler les notifications si WebSocket non disponible
  }

  loadRendezVous(): void {
    this.rendezVousService.getAllRendezVous().subscribe({
      next: (rdvs) => {
        this.rendezVous = rdvs;
        this.extractSalles();
        this.updateFilters();
      },
      error: () => this.notificationService.error('Erreur', 'Impossible de charger les rendez-vous')
    });
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe(medecins => {
      this.medecins = medecins;
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  extractSalles(): void {
    const sallesSet = new Set(this.rendezVous.map(rdv => rdv.salle).filter(salle => salle != null) as string[]);
    this.salles = Array.from(sallesSet).sort();
  }

  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + mondayOffset);
    this.updateWeekDays();
  }

  updateWeekDays(): void {
    this.currentWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      this.currentWeekDays.push({
        date: date,
        label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }
  }

  getCurrentWeekLabel(): string {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(this.currentWeekStart.getDate() + 6);
    return `${this.currentWeekStart.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.updateWeekDays();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.updateWeekDays();
  }

  updateFilters(): void {
    this.filteredRendezVous = this.rendezVous
      .filter(rdv => !this.selectedMedecinId || rdv.medecinDTO?.id?.toString() === this.selectedMedecinId)
      .filter(rdv => !this.selectedSalle || rdv.salle === this.selectedSalle);
  }

  selectTimeSlot(date: Date, hour: number): void {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    this.newRdv.dateHeureDebut = dateTime.toISOString().slice(0, 16);
    this.showCreateModal = true;
    this.checkConflicts();
  }

  hasRendezVous(date: Date, hour: number): boolean {
    return this.getRendezVousForSlot(date, hour).length > 0;
  }

  getRendezVousForSlot(date: Date, hour: number): RendezVous[] {
    return this.filteredRendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.dateHeureDebut);
      return rdvDate.toDateString() === date.toDateString() && rdvDate.getHours() === hour;
    });
  }

  getEventColor(rdv: RendezVous): string {
    const statut = rdv.statut?.toString();
    switch (statut) {
      case 'CONFIRME': return '#28a745';
      case 'PLANIFIE': return '#007bff';
      case 'ANNULE': return '#dc3545';
      case 'TERMINE': return '#6c757d';
      default: return '#007bff';
    }
  }

  editRendezVous(rdv: RendezVous): void {
    if (confirm(`Modifier le RDV: ${rdv.motif}?`)) {
      // Navigation vers modification
    }
  }

  createRendezVous(): void {
    if (this.conflictWarning && !confirm('Conflit détecté. Continuer?')) {
      return;
    }

    this.rendezVousService.createRendezVous(this.newRdv).subscribe({
      next: () => {
        this.loadRendezVous();
        this.closeModal();
        this.notificationService.success('Succès', 'Rendez-vous créé');
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMsg);
      }
    });
  }

  checkConflicts(): void {
    if (!this.newRdv.medecinId || !this.newRdv.dateHeureDebut) {
      this.conflictWarning = '';
      return;
    }

    // Conflit médecin (même heure)
    if (this.hasConflictForDateTime(this.newRdv.dateHeureDebut, this.newRdv.medecinId)) {
      this.conflictWarning = '⚠️ Conflit: Le médecin a déjà un RDV à cette heure';
    }
    // Conflit patient (même jour)
    else if (this.newRdv.patientId && this.hasPatientConflict(this.newRdv.dateHeureDebut, this.newRdv.patientId)) {
      this.conflictWarning = '⚠️ Conflit: Le patient a déjà un RDV ce jour-là';
    }
    else {
      this.conflictWarning = '';
    }
  }

  hasConflictForDateTime(dateTime: string, medecinId: number, excludeId?: number): boolean {
    const selectedDateTime = new Date(dateTime);
    return this.rendezVous.some(rdv => {
      if (rdv.id === excludeId || rdv.statut?.toString() === 'ANNULE') return false;
      if (rdv.medecinDTO?.id !== medecinId) return false;
      
      const rdvDateTime = new Date(rdv.dateHeureDebut);
      return rdvDateTime.getTime() === selectedDateTime.getTime();
    });
  }

  hasPatientConflict(dateTime: string, patientId: number, excludeId?: number): boolean {
    const selectedDate = new Date(dateTime).toDateString();
    return this.rendezVous.some(rdv => {
      if (rdv.id === excludeId || rdv.statut?.toString() === 'ANNULE') return false;
      if (rdv.patientId !== patientId) return false;
      
      const rdvDate = new Date(rdv.dateHeureDebut).toDateString();
      return rdvDate === selectedDate;
    });
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.conflictWarning = '';
    this.newRdv = {
      dateHeureDebut: '',
      motif: '',
      salle: '',
      patientId: 0,
      medecinId: 0
    };
  }
}