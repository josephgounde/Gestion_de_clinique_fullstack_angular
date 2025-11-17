import { Component, OnInit } from '@angular/core';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
  imports: [AppHeaderComponent, FormsModule, CommonModule]
})
export class PatientsComponent implements OnInit {

  patients: Patient[] = [];
  search = '';
  selectedPatient: Patient | null = null;
  showForm = false;
  isEdit = false;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  /**
   * Charger les patients depuis le backend et filtrer ceux sans ID valide
   */
  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (patients) => {
        // Ici on ne filtre pas sur les IDs, on prend tous les patients reçus
        this.patients = patients;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des patients', err);
        alert('Une erreur est survenue lors du chargement des patients');
      }
    });
  }

  /**
   * Filtrer les patients en fonction du champ "nom" dans la recherche
   */
  get filteredPatients(): Patient[] {
    const term = this.search.toLowerCase();
    return this.patients.filter(p => p.nom.toLowerCase().includes(term));
  }
  /**
   * Initialiser l'ajout d'un nouveau patient (sans id, créé par backend)
   */
  addPatient(): void {
    this.selectedPatient = {
      nom: '',
      prenom: '',
      dateNaissance: '',
      sexe: 'Homme',
      telephone: '',
      email: '',
      adresse: '',
      photo: ''
    };
    this.isEdit = false;
    this.showForm = true;
  }

  /**
   * Initialiser la modification d'un patient en cours
   */
  editPatient(patient: Patient): void {
    this.selectedPatient = { ...patient };
    this.isEdit = true;
    this.showForm = true;
  }

  /**
   * Sauvegarder un patient : mise à jour si édition, création sinon
   */
  savePatient(): void {
    if (!this.selectedPatient) {
      console.error('Aucun patient sélectionné');
      return;
    }

    if (this.isEdit) {
      if (!this.selectedPatient.id || this.selectedPatient.id <= 0) {
        console.error('ID patient manquant ou invalide pour mise à jour');
        return;
      }
      this.patientService.update(this.selectedPatient.id, this.selectedPatient).subscribe({
        next: () => {
          this.loadPatients();
          this.showForm = false;
          this.selectedPatient = null;
        },
        error: err => console.error('Erreur mise à jour patient', err)
      });
    } else {
      this.patientService.create(this.selectedPatient).subscribe({
        next: () => {
          this.loadPatients();
          this.showForm = false;
          this.selectedPatient = null;
        },
        error: err => console.error('Erreur création patient', err)
      });
    }
  }

  /**
   * Supprimer un patient en validant l'ID et confirmation utilisateur
   */
  deletePatient(id?: number): void {
    if (!id || id <= 0) {
      console.error('ID patient manquant ou invalide');
      alert('Impossible de supprimer le patient : ID invalide.');
      return;
    }
    if (!confirm('Voulez-vous vraiment supprimer ce patient ?')) {
      return;
    }
    this.patientService.delete(id).subscribe({
      next: () => {
        this.loadPatients();
      },
      error: err => {
        console.error('Erreur suppression patient', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  /**
   * Annuler ajout/modification
   */
  cancel(): void {
    this.showForm = false;
    this.selectedPatient = null;
  }
}
