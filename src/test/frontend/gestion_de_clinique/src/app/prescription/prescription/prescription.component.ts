import { Component, OnInit } from '@angular/core';
import { Prescription } from '../../models/prescription.model';
import { PrescriptionService } from '../../services/prescription.service';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  selector: 'app-prescriptions',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css'],
  standalone: true
})
export class PrescriptionComponent implements OnInit {
  prescriptions: Prescription[] = [];
  search = '';
  selectedPrescription: Prescription | null = null;
  showForm = false;
  isEdit = false;

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  // Charger toutes les prescriptions au démarrage
  loadPrescriptions(): void {
    this.prescriptionService.getAll().subscribe({
      next: (data) => {
        // Nettoyer les données pour remplacer les null par des valeurs par défaut
        this.prescriptions = data.map(prescription => ({
          ...prescription,
          medicaments: prescription.medicaments || 'Non spécifié',
          posologie: prescription.posologie || 'Non spécifié',
          dureeTraitement: prescription.dureeTraitement || 'Non spécifié',
          notes: prescription.notes || ''
        }));
      },
      error: (err: Error) => {
        console.error('Erreur chargement prescriptions', err);
        alert('Impossible de charger les prescriptions');
      }
    });
  }

  // Filtrer par médicaments ou notes
  get filteredPrescriptions(): Prescription[] {
    const term = this.search.toLowerCase();
    return this.prescriptions.filter(p =>
      (p.medicaments?.toLowerCase() || '').includes(term) ||
      (p.notes?.toLowerCase() || '').includes(term)
    );
  }

  // Préparer formulaire nouvelle prescription
  addPrescription(): void {
    this.selectedPrescription = {
      rendezvousId: 0,
      patientId: 0,
      medecinId: 0,
      datePrescription: new Date().toISOString().substring(0, 10),
      medicaments: '',
      posologie: '',
      dureeTraitement: '',
      statut: 'Active'
    };
    this.isEdit = false;
    this.showForm = true;
  }

  // Préparer modification
  editPrescription(p: Prescription): void {
    this.selectedPrescription = { ...p };
    this.isEdit = true;
    this.showForm = true;
  }

  // Sauvegarder (créer ou modifier)
  savePrescription(): void {
    if (!this.selectedPrescription) return;

    // Ensure required fields are not null by providing default empty strings
    const cleanedPrescription = {
      ...this.selectedPrescription,
      medicaments: this.selectedPrescription.medicaments || '',
      posologie: this.selectedPrescription.posologie || '',
      dureeTraitement: this.selectedPrescription.dureeTraitement || '',
      notes: this.selectedPrescription.notes || ''
    };

    if (this.isEdit && this.selectedPrescription.id) {
      this.prescriptionService.update(this.selectedPrescription.id, cleanedPrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.showForm = false;
          this.selectedPrescription = null;
        },
        error: (err: Error) => console.error('Erreur mise à jour prescription', err)
      });
    } else {
      this.prescriptionService.create(cleanedPrescription).subscribe({
        next: () => {
          this.loadPrescriptions();
          this.showForm = false;
          this.selectedPrescription = null;
        },
        error: (err: Error) => console.error('Erreur création prescription', err)
      });
    }
  }

  // Supprimer une prescription
  deletePrescription(id?: number): void {
    if (!id || id <= 0) {
      alert('ID prescription invalide');
      return;
    }
    if (!confirm('Voulez-vous vraiment supprimer cette prescription ?')) {
      return;
    }
    this.prescriptionService.delete(id).subscribe({
      next: () => this.loadPrescriptions(),
      error: (err: Error) => {
        console.error('Erreur suppression prescription', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  // Annuler formulaire
  cancel(): void {
    this.showForm = false;
    this.selectedPrescription = null;
  }
}