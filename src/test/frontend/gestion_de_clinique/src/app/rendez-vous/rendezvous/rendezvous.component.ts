import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { RendezvousService } from '../../services/rendezvous.service';
import { RendezVous } from '../../models/rendezvous.model';

@Component({
  selector: 'app-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  templateUrl: './rendezvous.component.html',
  styleUrls: ['./rendezvous.component.css']
})
export class RendezvousComponent implements OnInit {

  rendezvous: RendezVous[] = [];
  search = '';
  selectedRdv: RendezVous | null = null;
  showForm = false;
  isEdit = false;

  constructor(private rdvService: RendezvousService) { }

  ngOnInit(): void {
    this.loadRendezvous();
  }

  // Charger tous les rendez-vous
  loadRendezvous(): void {
    this.rdvService.getAll().subscribe({
      next: data => this.rendezvous = data,
      error: err => {
        console.error('Erreur chargement rendez-vous', err);
        alert('Erreur lors du chargement des rendez-vous');
      }
    });
  }

  // Filtrer d’après le motif ou id patient
  get filteredRdv(): RendezVous[] {
    const term = this.search.toLowerCase();
    return this.rendezvous.filter(r =>
      r.motif.toLowerCase().includes(term) || r.patientId.toString().includes(term)
    );
  }

  // Préparer formulaire ajout
  addRdv(): void {
    this.selectedRdv = {
      patientId: 0,
      medecinId: 0,
      secretaireId: 0,
      dateHeureDebut: '',
      dateHeureFin: '',
      motif: '',
      statut: 'Planifié',
      salle: '',
      notes: ''
    };
    this.isEdit = false;
    this.showForm = true;
  }

  // Préparer formulaire modification
  editRdv(rdv: RendezVous): void {
    this.selectedRdv = { ...rdv };
    this.isEdit = true;
    this.showForm = true;
  }

  // Sauvegarder (création ou mise à jour)
  saveRdv(): void {
    if (!this.selectedRdv) {
      console.error('Aucun rendez-vous sélectionné');
      return;
    }

    if (this.isEdit) {
      if (!this.selectedRdv.id) {
        console.error('ID rendez-vous manquant pour mise à jour');
        return;
      }
      this.rdvService.update(this.selectedRdv.id, this.selectedRdv).subscribe({
        next: () => {
          this.loadRendezvous();
          this.showForm = false;
          this.selectedRdv = null;
        },
        error: err => {
          console.error('Erreur mise à jour rendez-vous', err);
          alert('Erreur lors de la mise à jour');
        }
      });
    } else {
      this.rdvService.create(this.selectedRdv).subscribe({
        next: () => {
          this.loadRendezvous();
          this.showForm = false;
          this.selectedRdv = null;
        },
        error: err => {
          console.error('Erreur création rendez-vous', err);
          alert('Erreur lors de la création');
        }
      });
    }
  }

  // Supprimer un rendez-vous après confirmation
  deleteRdv(id?: number): void {
    if (!id || id <= 0) {
      console.error('ID rendez-vous manquant ou invalide');
      alert('Impossible de supprimer ce rendez-vous, ID invalide.');
      return;
    }
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      return;
    }
    this.rdvService.delete(id).subscribe({
      next: () => this.loadRendezvous(),
      error: err => {
        console.error('Erreur suppression rendez-vous', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  // Annuler ajout ou modification
  cancel(): void {
    this.showForm = false;
    this.selectedRdv = null;
  }
}
