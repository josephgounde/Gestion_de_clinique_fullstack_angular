import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from '../../../components/app-header/app-header.component';
import { FooterComponent } from "../../../components/app-footer/footer.component";
import { PatientService } from '../../../services/patient.service';
import { RendezvousService } from '../../../services/rendezvous.service';
import { PrescriptionService } from '../../../services/prescription.service';

@Component({
  selector: 'app-dashboard-medecin',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent, FooterComponent],
  templateUrl: './dashboard-medecin.component.html',
  styleUrls: ['./dashboard-medecin.component.css']
})
export class DashboardMedecinComponent implements OnInit {
  medecinId: number = 1;  // ID du médecin connecté (à adapter selon votre système d’auth)

  // Données dynamiques
  totalPatients = 0;
  rdvToday = 0;
  upcomingRdv = 0;

  prochainsRdv: any[] = [];
  patientsRisque: any[] = [];
  activiteRecente: any[] = [];

  constructor(
    private patientService: PatientService,
    private rendezvousService: RendezvousService,
    private prescriptionService: PrescriptionService,
  ) {}

  ngOnInit(): void {
    this.loadTotalPatients();
    this.loadRdvToday();
    this.loadUpcomingRdv();
    this.loadProchainsRdv();
    this.loadPatientsRisque();
    this.loadActiviteRecente();
  }

  // Charger le total des patients suivis par ce médecin
  loadTotalPatients(): void {
    this.patientService.getAll().subscribe({
      next: (patients: string | any[]) => {
        // Exemple : filtrer patients suivis par ce médecin (à ajuster selon vos données)
        this.totalPatients = patients.length;
      },
      error: (err: any) => console.error('Erreur chargement patients', err)
    });
  }

  // Charger le nombre de rendez-vous aujourd’hui pour ce médecin
  loadRdvToday(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.rendezvousService.getAll().subscribe({
      next: (rdvs: string | any[]) => {
        this.rdvToday = rdvs.length;
      },
      error: (err: any) => console.error('Erreur chargement RDV aujourd\'hui', err)
    });
  }

  // Charger le nombre de rendez-vous à venir (par ex. dans les prochaines 7 jours)
  loadUpcomingRdv(): void {
    const start = new Date().toISOString().substring(0, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const end = endDate.toISOString().substring(0, 10);

    this.rendezvousService.getAll().subscribe({
      next: (rdvs: string | any[]) => {
        this.upcomingRdv = rdvs.length;
      },
      error: (err: any) => console.error('Erreur chargement RDV à venir', err)
    });
  }

  // Charger les prochains rendez-vous détaillés (exemple : affiche 3 rdvs les plus proches)
  loadProchainsRdv(): void {
    this.rendezvousService.getAll().subscribe({
      next: (rdvs: any[]) => {
        // On filtre les RDV du médecin puis on prend les 3 premiers
        this.prochainsRdv = rdvs
          .filter((r: { medecinId: number; }) => r.medecinId === this.medecinId)
          .slice(0, 3)
          .map((r: { dateHeureDebut: string; patientId: any; motif: any; }) => ({
            heure: r.dateHeureDebut.substring(11,16), // extrait Heure mm:ss de date ISO
            patient: `Patient #${r.patientId}`,      // remplacer par nom si possible
            type: r.motif
          }));
      },
      error: (err: any) => console.error('Erreur chargement prochains RDV', err)
    });
  }

  // Charger les patients à risque (exemple simple, à adapter)
  loadPatientsRisque(): void {
    this.patientService.getAll().subscribe({
      next: (patients: any[]) => {
        // Exemple: filtrer ceux avec antécédents "à risque"
        this.patientsRisque = patients
          .filter((p: { antecedents: string | any[]; }) => p.antecedents && p.antecedents.length > 0)
          .map((p: { nom: string; prenom: string; antecedents: any; }) => ({
            nom: p.nom + ' ' + p.prenom,
            info: p.antecedents
          })).slice(0, 5);  // limit à 5
      },
      error: (err: any) => console.error('Erreur chargement patients à risque', err)
    });
  }

  // Charger activité récente (exemple basé sur prescriptions)
  loadActiviteRecente(): void {
    this.prescriptionService.getAll().subscribe({
      next: (prescs: any[]) => {
        // Exemple : derniers mouvements de prescriptions (simplifié)
        this.activiteRecente = prescs.slice(-5).reverse().map(p => ({
          icon: '💊',
          desc: `Prescription modifiée pour patient #${p.patientId}`,
          time: 'récemment'  // vous pouvez améliorer en formatant la date
        }));
      },
      error: (err: any) => console.error('Erreur chargement activité récente', err)
    });
  }
}
