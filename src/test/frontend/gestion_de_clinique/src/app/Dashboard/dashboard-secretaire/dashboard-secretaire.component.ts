import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FooterComponent } from "../../components/app-footer/footer.component";

// Importer vos services pour patients, rendez-vous, médecins
import { PatientService } from '../../services/patient.service';
import { RendezvousService } from '../../services/rendezvous.service';
import { MedecinService } from '../../services/medecin.service';  // à créer/exister

@Component({
  selector: 'app-dashboard-secretaire',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent, FooterComponent],
  templateUrl: './dashboard-secretaire.component.html',
  styleUrls: ['./dashboard-secretaire.component.css']
})
export class DashboardSecretaireComponent implements OnInit {

  rdvTotal: number = 0;         // Total des RDV
  patientsDuJour: number = 0;   // Patients reçus aujourd’hui
  medecinsActifs: number = 0;   // Médecins actifs
  rdvAujourdHui: number = 0;    // RDV prévus aujourd’hui

  notifications: { type: string, label: string, text: string }[] = [];
  prochainsRdv: { heure: string, patient: string, type: string }[] = [];
  tachesDuJour: string[] = [];

  roleDebug: string | null = null;

  constructor(
    private patientService: PatientService,
    private rdvService: RendezvousService,
    private medecinService: MedecinService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadNotifications();
    this.loadProchainsRdv();
    this.loadTachesDuJour();

    // Récupérer le rôle utilisateur pour debug ou logique d'affichage
    const user = localStorage.getItem('user');
    this.roleDebug = user ? JSON.parse(user).role : null;
    console.log('ROLE COURANT (debug):', this.roleDebug);
  }

  // Charger les statistiques dynamiques depuis le backend via les services
  loadStats(): void {
    // Total rendez-vous
    this.rdvService.getAll().subscribe(rdvList => {
      this.rdvTotal = rdvList.length;

      const today = new Date();
      // Rendez-vous aujourd’hui
      this.rdvAujourdHui = rdvList.filter(rdv => {
        const rdvDate = new Date(rdv.dateHeureDebut);
        return rdvDate.toDateString() === today.toDateString();
      }).length;
    });

    // Patients du jour (exemple : patients avec un RDV aujourd’hui ou inscriptions aujourd’hui)
    this.patientService.getAll().subscribe(patientList => {
      // Hypothèse simple : tous les patients comptés (à adapter côté backend ou logique)
      this.patientsDuJour = patientList.length;
    });

    // Médecins actifs (exemple : nombre total, ou filtrage côté backend)
    this.medecinService.getAll().subscribe(medecins => {
      this.medecinsActifs = medecins.length;
    });
  }

  // Charger les notifications (à adapter selon vos données réelles)
  loadNotifications(): void {
    this.notifications = [
      { type: 'info', label: 'Nouveau patient', text: 'Paul Kamga ajouté ce matin.' },
      { type: 'alert', label: 'Annulation RDV', text: 'Dr Bilongo absent à 14:00.' },
      { type: 'info', label: 'Tâche', text: 'Imprimer factures de la semaine.' }
    ];
  }

  // Charger les prochains rendez-vous (exemple : prochains 3 RDV)
  loadProchainsRdv(): void {
    this.rdvService.getAll().subscribe(rdvList => {
      // Mapper selon besoin: heure, patient (nom), type (motif)
      this.prochainsRdv = rdvList.slice(0, 3).map(rdv => ({
        heure: new Date(rdv.dateHeureDebut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patient: `Patient #${rdv.patientId}`,  // Vous pouvez charger nom complet via patientService si besoin
        type: rdv.motif || 'Consultation'
      }));
    });
  }

  // Charger les tâches du jour (à personnaliser)
  loadTachesDuJour(): void {
    this.tachesDuJour = [
      'Vérifier les dossiers patients',
      'Confirmer les RDV de demain',
      'Envoyer les rappels SMS'
    ];
  }
}
