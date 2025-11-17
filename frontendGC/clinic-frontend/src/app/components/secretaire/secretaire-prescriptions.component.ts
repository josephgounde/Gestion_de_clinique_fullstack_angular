import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { PrescriptionService } from '../../services/prescription.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/auth.model';
import { Prescription, PrescriptionRequest } from '../../models/prescription.model';
import { MedecinService } from '../../services/medecin.service';
import { PatientService } from '../../services/patient.service';
import { Medecin } from '../../models/medecin.model';
import { Patient } from '../../models/patient.model';


@Component({
  selector: 'app-secretaire-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfileModalComponent],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">{{ currentUser.prenom }} {{ currentUser.nom }}</span>
          <span class="user-role-badge role-secretaire">SECRÉTAIRE</span>
        </div>
      </nav>
      
      <div class="main-content">
        <aside class="sidebar" [class.open]="isSidebarOpen">
          <div class="sidebar-header">
            <button class="close-sidebar" (click)="toggleSidebar()" title="Fermer">✖</button>
          </div>
          <div class="sidebar-content">
            <ul class="nav-menu">
              <li> <a routerLink="/secretaire" routerLinkActive="active"  (click)="closeSidebar()"> 📊 Tableau de bord </a> </li>
              <li> <a routerLink="/secretaire/patients" routerLinkActive="active"  (click)="closeSidebar()"> 👥 Mes Patients </a> </li>
              <li> <a routerLink="/secretaire/rendezvous" routerLinkActive="active" (click)="closeSidebar()"> 📅 Mes Rendez-vous </a> </li>
              <li> <a routerLink="/secretaire/prescriptions" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()"> 💊 Prescriptions </a> </li>
              <li><a routerLink="/secretaire/factures">💰 Factures</a></li>
            </ul>
          </div>
          <div class="sidebar-footer">
            <div class="user-profile" *ngIf="currentUser">
              <div class="user-avatar" (click)="showProfileModal = true">
                <img *ngIf="currentUser.avatarUrl; else defaultAvatar" [src]="currentUser.avatarUrl" alt="Avatar">
                <ng-template #defaultAvatar>👤</ng-template>
              </div>
              <div class="user-details">
                <div class="user-name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
                <div class="user-role">Secrétaire</div>
              </div>
            </div>
            <button (click)="logout()" class="btn-logout-sidebar">
              <span class="logout-icon">🚪</span>
              Déconnexion
            </button>
          </div>
        </aside>

        <!-- Overlay -->
        <div *ngIf="isSidebarOpen" class="sidebar-overlay" (click)="toggleSidebar()"></div>
        
        <main class="content">
          <div class="header">
            <h2>💊 Gestion des Prescriptions</h2>
            <div class="header-actions">
              <button (click)="openPrescriptionForm()" class="add-button btn-primary"> ➕ Nouvelle Prescription </button>
              <button (click)="loadPrescriptions()" class="btn-secondary">🔄 Actualiser</button>
            </div>
          </div>

          <!-- Create prescription form (popup) -->
          <div *ngIf="showPrescriptionForm" class="create-form-overlay">
            <div class="create-form">
              <div class="form-header">
                <h3>📝 Nouvelle Prescription</h3>
                <button (click)="cancelPrescription()" class="btn-close">✖</button>
              </div>
              <form (ngSubmit)="createPrescription()" #prescriptionForm="ngForm">
                <div class="form-group">
                  <label>📅 Rendez-vous *</label>
                  <select [(ngModel)]="newPrescription.rendezvousId" name="rendezvousId" required class="form-control">
                    <option value="">Sélectionner un rendez-vous</option>
                    <option *ngFor="let p of patients" [value]="p.id">{{ p.nom }} {{ p.prenom }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>💊 Médicament *</label>
                  <input [(ngModel)]="newPrescription.medicament" name="medicament" required class="form-control" placeholder="Ex: Paracétamol">
                </div>
                <div class="form-group">
                  <label>⏰ Posologie *</label>
                  <input [(ngModel)]="newPrescription.posologie" name="posologie" required class="form-control" placeholder="Ex: 3x/jour">
                </div>
                <div class="form-group">
                  <label>📊 Dosage *</label>
                  <input [(ngModel)]="newPrescription.dosage" name="dosage" required class="form-control" placeholder="Ex: 500mg">
                </div>
                <div class="form-actions">
                  <button type="submit" [disabled]="!prescriptionForm.valid" class="btn-primary">💾 Créer</button>
                  <button type="button" (click)="cancelPrescription()" class="btn-secondary">❌ Annuler</button>
                </div>
              </form>
            </div>
          </div>

          <div class="prescriptions-grid">
            <div *ngFor="let prescription of prescriptions" class="prescription-card" [class.expanded]="isPrescriptionExpanded(prescription.id)">
              <div class="prescription-header" (click)="togglePrescriptionExpand(prescription.id)">
                <div class="header-title">
                  <h4>👤 {{ prescription.patientPrenom }} {{ prescription.patientNom }}</h4>
                </div>
                <div class="expand-icon" [class.rotated]="isPrescriptionExpanded(prescription.id)">
                  ▶
                </div>
              </div>

              <div class="prescription-content" *ngIf="isPrescriptionExpanded(prescription.id)">
                <div class="prescription-section">
                  <strong>👨‍⚕️ Médecin:</strong>
                  <p>Dr. {{ prescription.medecinNom }}</p>
                </div>
                <div class="prescription-section">
                  <strong>💊 Médicament:</strong>
                  <p>{{ prescription.medicament || 'Non spécifié' }}</p>
                </div>
                <div class="prescription-section">
                  <strong>⏰ Posologie:</strong>
                  <p>{{ prescription.posologie || 'Non spécifiée' }}</p>
                </div>
                <div class="prescription-section">
                  <strong>📊 Dosage:</strong>
                  <p>{{ prescription.dosage || 'Non spécifié' }}</p>
                </div>
                <div class="prescription-date-detail">
                  <strong>📅 Date:</strong>
                  <p>{{ prescription.dateCreation | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>

              <div class="prescription-actions" *ngIf="isPrescriptionExpanded(prescription.id)">
                <button (click)="creerFacture(prescription)" class="btn-success">💰 Créer Facture</button>
                <button (click)="downloadPdf(prescription)" class="btn-pdf">📄 PDF</button>
                <button (click)="deletePrescription(prescription)" class="btn-delete">🗑️ Supprimer</button>
              </div>
            </div>
          </div>

          <div *ngIf="prescriptions.length === 0" class="no-prescriptions">
            <p>💊 Aucune prescription trouvée</p>
          </div>

          <!-- Facture form overlay -->
          <div *ngIf="showFactureForm" class="facture-form-overlay">
            <div class="facture-form">
              <div class="form-header">
                <h3>💰 Créer une Facture</h3>
                <button (click)="cancelFacture()" class="btn-close">✖</button>
              </div>
              <div class="patient-info">
                <h4>👤 Patient: {{ getPatientName() }}</h4>
                <p>👨‍⚕️ Médecin: Dr. {{ getMedecinName() }}</p>
                <p>📅 Prescription: {{ selectedPrescription?.dateCreation | date:'dd/MM/yyyy HH:mm' }}</p>
                <p>🕐 Facturation: {{ currentDateTime | date:'dd/MM/yyyy HH:mm:ss' }}</p>
              </div>
              <form (ngSubmit)="submitFacture()" #factureForm="ngForm">
                <div class="form-group">
                  <label>💊 Frais de consultation (FCFA) *</label>
                  <input [(ngModel)]="factureData.fraisConsultation" name="fraisConsultation" 
                          type="number" step="1" min="0" required class="form-control"
                          placeholder="Ex: 25000">
                </div>
                <div class="form-group">
                  <label>🏥 Frais d'hospitalisation (FCFA)</label>
                  <input [(ngModel)]="factureData.fraisHospitalisation" name="fraisHospitalisation" 
                          type="number" step="1" min="0" class="form-control"
                          placeholder="Ex: 100000">
                </div>
                <div class="form-group">
                  <label>🔬 Frais d'examens cliniques (FCFA)</label>
                  <input [(ngModel)]="factureData.fraisExamen" name="fraisExamen" 
                          type="number" step="1" min="0" class="form-control"
                          placeholder="Ex: 35000">
                </div>
                <div class="total-section">
                  <div class="total-display">
                    <strong>💰 Total: {{ calculateTotal() | number:'1.0-0' }} FCFA</strong>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" [disabled]="!factureForm.valid" class="btn-primary">💾 Créer Facture</button>
                  <button *ngIf="showDownloadButton" type="button" (click)="downloadFacture()" class="btn-success">📄 Télécharger PDF</button>
                  <button type="button" (click)="cancelFacture()" class="btn-secondary">❌ Annuler</button>
                </div>
              </form>
            </div>
          </div>
          </main>
      </div>
      
      <footer class="global-footer">
        <div class="footer-content">
          © kfokam48 2025 - Gestion Clinique
        </div>
      </footer>
      
      <app-profile-modal 
        [isVisible]="showProfileModal" 
        [currentUser]="currentUser"
        (closed)="showProfileModal = false"
        (avatarUpdated)="onAvatarUpdated($event)">
      </app-profile-modal>
    </div>
  `,
  styles: [`
        /* Base Container */
.dashboard-container {
  height: 100vh;
  // background: linear-gradient(rgba(255,255,255,0.3), rgba(0,123,255,0.2)), 
  //             url('https://mydoctorsclinicsurfers.com.au/wp-content/uploads/2023/04/contact-Banner.jpeg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Navbar */
.navbar { background-color: #72c9b2ff; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-shrink: 0; position: relative; z-index: 10; }

.menu-burger { display: none; background: none; border: none; color: white; font-size: 1.8rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: background-color 0.2s; }

.menu-burger:hover { background-color: rgba(255, 255, 255, 0.2); }

.nav-brand h1 { margin: 0; font-size: 1.5rem; }

.nav-user { display: flex; align-items: center; gap: 1rem; }

.welcome-text { font-weight: 600; }

.user-role-badge { padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }

.role-medecin { background: rgba(40,167,69,0.8); color: #fff; }

/* Main Content */
.main-content { display: flex; flex: 1; overflow: hidden; position: relative; }

/* Sidebar */
.sidebar { width: 250px; background: white; box-shadow: 2px 0 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; transition: transform 0.3s ease; position: relative; z-index: 100; }

.sidebar-header { display: none; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }

.close-sidebar { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #333; padding: 0.5rem; border-radius: 8px; transition: background-color 0.2s; margin-left: auto; }

.close-sidebar:hover { background-color: #f0f0f0; }

.sidebar-content { flex: 1; overflow-y: auto; }

.nav-menu { list-style: none; padding: 0; margin: 0; }

.nav-menu li a { display: block; padding: 1rem 1.5rem; text-decoration: none; color: #333; border-bottom: 1px solid #eee; transition: all 0.2s; }

.nav-menu li a:hover, .nav-menu li a.active { background-color: #72c9b2ff; color: white; }
.sidebar-footer { padding: 1rem; padding-bottom: 1.5rem; border-top: 1px solid #eee; background: #f8f9fa; }

.user-profile { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding: 0.75rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.user-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white; cursor: pointer; transition: transform 0.3s; flex-shrink: 0; }

.user-avatar:hover { transform: scale(1.1); }

.user-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.user-details { flex: 1; }

.user-name { font-weight: bold; font-size: 0.9rem; color: #333; }

.user-role { font-size: 0.8rem; color: #666; }

.btn-logout-sidebar { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #dc3545, #c82333); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.3s ease; }

.btn-logout-sidebar:hover { background: linear-gradient(135deg, #c82333, #a71e2a); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }

.logout-icon { font-size: 1.1rem; }

.sidebar-overlay { display: none; }

/* Content Area */
.content { flex: 1; padding: 2rem; overflow-y: auto; overflow-x: hidden; }

.global-footer { background-color: #f8f9fa; border-top: 1px solid #dee2e6; padding: 1rem 0; flex-shrink: 0; }

.footer-content { text-align: center; font-size: 0.9rem; color: #666; font-weight: 500; }

/* Header Section */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); flex-wrap: wrap; gap: 1rem; }

.header h2 { margin: 0; color: #333; }

.header-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* Buttons */
.btn-primary { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: #007bff; color: white; transition: all 0.2s; }

.btn-primary:hover { background: #0056b3; transform: translateY(-2px); }

.btn-primary:disabled { background: #6c757d; cursor: not-allowed; transform: none; }

.btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; background: #6c757d; color: white; transition: all 0.2s; }

.btn-secondary:hover { background: #5a6268; }

.btn-add { padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }

.btn-add:hover { background: #218838; }

.btn-remove { background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem; height: fit-content; transition: all 0.2s; }

.btn-remove:hover { background: #c82333; }

.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; transition: color 0.2s; }

.btn-close:hover { color: #333; }

/* Create Form Overlay */
.create-form-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }

.create-form { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; }

.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

.form-header h3 { margin: 0; color: #333; }

.form-group { margin-bottom: 1.5rem; }

.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }

.form-control { width: 100%; padding: 0.75rem; border: 2px solid #e0e6ed; border-radius: 8px; font-size: 1rem; outline: none; box-sizing: border-box; transition: border-color 0.2s; }

.form-control:focus { border-color: #007bff; }

.form-control.ng-invalid.ng-touched { border-color: #dc3545; box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25); }

.form-control.ng-valid.ng-touched { border-color: #28a745; box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25); }

.error-message { color: #dc3545; font-size: 0.8rem; margin-top: 0.25rem; display: block; }

.input-group { position: relative; }

.medicaments-section { margin-bottom: 1.5rem; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

.medicaments-table { border: 2px solid #e0e6ed; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }

.table-header { display: grid; grid-template-columns: 2fr 1fr 2fr 80px; background: #f8f9fa; padding: 0.75rem; font-weight: bold; border-bottom: 1px solid #e0e6ed; gap: 0.5rem; }

.table-row { display: grid; grid-template-columns: 2fr 1fr 2fr 80px; padding: 0.5rem; gap: 0.5rem; align-items: start; border-bottom: 1px solid #f0f0f0; }

.table-row:last-child { border-bottom: none; }

.form-actions { display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap; }

/* Prescriptions List */
.prescriptions-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }

.prescription-item { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #28a745; overflow: hidden; }

.prescription-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; cursor: pointer; transition: background 0.3s; user-select: none; }

.prescription-header:hover { background: #f8f9fa; }

.prescription-header:active { background: #e9ecef; }

.header-info h4 { margin: 0 0 0.25rem 0; color: #333; }

.header-info p { margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem; }

.date-badge { background: #e8f5e8; color: #28a745; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; display: inline-block; }

.expand-arrow { font-size: 1.2rem; color: #28a745; transition: transform 0.3s; padding: 0.5rem; margin: -0.5rem; cursor: pointer; }

.expand-arrow.expanded { transform: rotate(90deg); }

.expand-arrow:hover { background: rgba(40, 167, 69, 0.1); border-radius: 50%; }

.prescription-details { background: #f8f9fa; }

.details-content { padding: 1rem; border-top: 1px solid #eee; }

.consultation-info { background: white; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }

.info-item { display: flex; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap; }

.info-item strong { min-width: 100px; color: #333; }

.alert-info { background: #fff3cd; color: #856404; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; }

.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

/* Prescription Cards - Expandable List */
.prescriptions-grid { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }

.prescription-card { background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s ease; }

.prescription-card.expanded { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

.prescription-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; cursor: pointer; user-select: none; transition: background 0.3s ease; background: white; border-bottom: 2px solid #f0f0f0; }

.prescription-header:hover { background: #f8f9fa; }

.header-title { flex: 1; }

.header-title h4 { margin: 0; font-size: 1.1rem; color: #333; font-weight: 600; }

.expand-icon { font-size: 1.2rem; color: #666; transition: transform 0.3s ease; margin-left: 1rem; display: flex; align-items: center; justify-content: center; min-width: 30px; height: 30px; cursor: pointer; }

.expand-icon.rotated { transform: rotate(90deg); color: #72c9b2ff; }

.prescription-content { padding: 1.5rem; background: white; border-bottom: 1px solid #f0f0f0; animation: slideDown 0.3s ease-out; }

@keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }

.prescription-section { margin-bottom: 1rem; }

.prescription-section:last-of-type { margin-bottom: 0; }

.prescription-section strong { display: block; color: #555; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.95rem; }

.prescription-section p { margin: 0; color: #333; font-size: 1rem; }

.prescription-date-detail { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e6ed; }

.prescription-date-detail strong { color: #666; }

.prescription-date-detail p { color: #555; }

.prescription-actions { display: flex; gap: 0.75rem; padding: 1.25rem 1.5rem; background: #f8f9fa; flex-wrap: wrap; justify-content: flex-start; }

.btn-success { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease; background: linear-gradient(135deg, #28a745, #20c997); color: white; box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2); }

.btn-success:hover { background: linear-gradient(135deg, #20c997, #17a2b8); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); }

.btn-pdf, .btn-delete { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease; }

.btn-pdf { background: linear-gradient(135deg, #17a2b8, #138496); color: white; box-shadow: 0 2px 4px rgba(23, 162, 184, 0.2); }

.btn-pdf:hover { background: linear-gradient(135deg, #138496, #117a8b); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3); }

.btn-delete { background: linear-gradient(135deg, #dc3545, #c82333); color: white; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2); }

.btn-delete:hover { background: linear-gradient(135deg, #c82333, #a71e2a); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3); }

.no-prescriptions { text-align: center; padding: 3rem; color: #666; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

/* ------------------------------ Mobile Responsive ------------------------------ */
@media (max-width: 992px) {
  .menu-burger { display: block; }

  .navbar { padding: 1rem; gap: 1rem; }

  .nav-brand h1 { font-size: 1.2rem; }

  .nav-user { display: none; }

  .sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 280px; transform: translateX(-100%); z-index: 1000; }

  .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15); }

  .sidebar-header { display: flex; justify-content: flex-end; }

  .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 999; }

  .sidebar.open ~ .sidebar-overlay { display: block; }

  .content { padding: 1.5rem 1rem; }

  .header { flex-direction: column; align-items: flex-start; }

  .header-actions { width: 100%; }

  .create-form { padding: 1.5rem; max-width: 100%; }

  .table-header, .table-row { grid-template-columns: 1.5fr 0.8fr 1.5fr 60px; font-size: 0.85rem; }
}

@media (max-width: 768px) {
  .navbar { padding: 0.75rem; }

  .nav-brand h1 { font-size: 1rem; }

  .content { padding: 1rem 0.75rem; }

  .header h2 { font-size: 1.3rem; }

  .create-form { padding: 1rem; }

  .table-header, .table-row { display: flex; flex-direction: column; gap: 0.5rem; }

  .table-header { display: none; }

  .table-row { padding: 1rem; }

  .btn-remove { align-self: flex-end; }

  .form-control { font-size: 16px; /* Prevents zoom on iOS */ }

  .actions { width: 100%; }

  .btn-pdf, .btn-delete { flex: 1; justify-content: center; }

  .info-item { flex-direction: column; gap: 0.25rem; }

  .info-item strong { min-width: auto; }
}

@media (max-width: 576px) {
  .header { padding: 1rem; }

  .header-actions { flex-direction: column; }

  .btn-primary, .btn-secondary { width: 100%; justify-content: center; }

  .create-form { border-radius: 0; max-height: 100vh; }

  .form-actions { flex-direction: column; }

  .form-actions button { width: 100%; }
}
  `]
})
export class SecretairePrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  currentUser: User | null = null;
  showProfileModal = false;
  showFactureForm = false;
  selectedPrescription: Prescription | null = null;
  currentDateTime = new Date();
  factureData = {
    fraisConsultation: 25000,
    fraisHospitalisation: 0,
    fraisExamen: 0
  };
  lastCreatedFactureId: number | null = null;
  showDownloadButton = false;
  isSidebarOpen = false; // for mobile
  // --- prescription properties ---
  showPrescriptionForm: boolean = false;
  newPrescription: PrescriptionRequest = this.initPrescriptionRequest();
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  expandedPrescriptions = new Set<number>(); // Track which prescriptions are expanded

  constructor(
    private prescriptionService: PrescriptionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private dashboardService: DashboardService,
    private patientService: PatientService, 
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadPrescriptions();
      }
    });
    // Load patients and medecins for prescription form
    this.patientService.getAllPatients().subscribe(patients => {
      this.patients = patients;
    });
    this.medecinService.getAllMedecins().subscribe(medecins => {
      this.medecins = medecins;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  loadPrescriptions(): void {
    this.prescriptionService.getAllPrescriptions().subscribe({
      next: prescriptions => {
        this.prescriptions = prescriptions;
        this.notificationService.success('Actualisation', `${prescriptions.length} prescriptions chargées`);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prescriptions:', error);
        this.notificationService.error('Erreur', 'Impossible de charger les prescriptions');
      }
    });
  }

  // ---  methods for prescriptions ---

  initPrescriptionRequest(): PrescriptionRequest {
    return {
      rendezvousId: null as any, // Doit être un ID valide
      medicament: '',
      posologie: '',
      dosage: '',
      prescriptionDate: new Date().toISOString().split('T')[0], // Aujourd'hui (par défaut)
      effective: true // Par défaut
    };
  }

  // --- NOUVELLE LOGIQUE DE CRÉATION DE PRESCRIPTION ---

  openPrescriptionForm(): void {
    this.newPrescription = this.initPrescriptionRequest();
    this.showPrescriptionForm = true;
  }

  cancelPrescription(): void {
    this.showPrescriptionForm = false;
    this.newPrescription = this.initPrescriptionRequest();
  }

  createPrescription(): void {
    // Validation des champs obligatoires selon le nouveau modèle
    if (!this.newPrescription.rendezvousId || !this.newPrescription.medicament || !this.newPrescription.posologie || !this.newPrescription.dosage) {
      this.notificationService.error('Erreur', 'Veuillez remplir les champs obligatoires (Rendez-vous ID, Médicament, Posologie, Dosage).');
      return;
    }

    // Le champ prescriptionDate est défini par défaut dans initPrescriptionRequest
    
    // Le reste de l'objet PrescriptionRequest est déjà dans this.newPrescription
    this.prescriptionService.createPrescription(this.newPrescription).subscribe({
      next: (response) => {
        this.notificationService.success('Succès', 'Prescription créée avec succès.');
        this.loadPrescriptions(); 
        this.cancelPrescription();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la prescription:', error);
        // Afficher un message d'erreur plus précis si disponible
        const errorMessage = error.error?.message || 'Impossible de créer la prescription.';
        this.notificationService.error('Erreur', errorMessage);
      }
    });
  }

  downloadPdf(prescription: Prescription): void {
    if (prescription.id) {
      this.prescriptionService.downloadPrescriptionPdf(prescription.id).subscribe({
        next: response => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription_${prescription.patientNom}_${prescription.dateCreation}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            this.notificationService.success('Téléchargement', 'Prescription téléchargée');
          }
        },
        error: (error) => {
          console.error('Erreur téléchargement PDF:', error);
          this.notificationService.error('Erreur', 'Impossible de télécharger le PDF');
        }
      });
    }
  }

  deletePrescription(prescription: Prescription): void {
    if (prescription.id && confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      this.prescriptionService.deletePrescription(prescription.id).subscribe({
        next: () => {
          this.prescriptions = this.prescriptions.filter(p => p.id !== prescription.id);
          this.notificationService.success('Suppression', 'Prescription supprimée');
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la prescription');
        }
      });
    }
  }

  togglePrescriptionExpand(prescriptionId: number | undefined): void {
    if (!prescriptionId) return;
    if (this.expandedPrescriptions.has(prescriptionId)) {
      this.expandedPrescriptions.delete(prescriptionId);
    } else {
      this.expandedPrescriptions.add(prescriptionId);
    }
  }

  isPrescriptionExpanded(prescriptionId: number | undefined): boolean {
    return prescriptionId ? this.expandedPrescriptions.has(prescriptionId) : false;
  }



  creerFacture(prescription: Prescription): void {
    this.selectedPrescription = prescription;
    this.currentDateTime = new Date();
    this.factureData = {
      fraisConsultation: 25000,
      fraisHospitalisation: 0,
      fraisExamen: 0
    };
    this.showFactureForm = true;
  }

  calculateTotal(): number {
    return (this.factureData.fraisConsultation || 0) + 
           (this.factureData.fraisHospitalisation || 0) + 
           (this.factureData.fraisExamen || 0);
  }

  submitFacture(): void {
    console.log('=== CREATION FACTURE ===');
    console.log('Prescription sélectionnée:', this.selectedPrescription);
    console.log('Données facture:', this.factureData);
    
    if (!this.selectedPrescription?.id) {
      console.error('Pas de prescription sélectionnée');
      this.notificationService.error('Erreur', 'Prescription manquante');
      return;
    }
    
    const requestData = {
      prescriptionId: this.selectedPrescription.id,
      fraisConsultation: this.factureData.fraisConsultation || 0,
      fraisHospitalisation: this.factureData.fraisHospitalisation || 0,
      fraisExamen: this.factureData.fraisExamen || 0
    };
    
    console.log('Données envoyées:', requestData);
    
    this.http.post<any>('http://localhost:8080/api/factures/creer', requestData).subscribe({
      next: (facture) => {
        console.log('Facture créée:', facture);
        this.notificationService.success('Succès', 'Facture créée avec succès');
        this.lastCreatedFactureId = facture.id;
        this.showDownloadButton = true;
        // Refresh the prescription list and close the form
        this.loadPrescriptions();
        this.cancelFacture();
      },
      error: (error) => {
        console.error('Erreur création facture:', error);
        this.notificationService.error('Erreur', 'Impossible de créer la facture');
      }
    });
  }

  getPatientName(): string {
    if (!this.selectedPrescription) return 'Non spécifié';
    const prenom = this.selectedPrescription.patientPrenom || '';
    const nom = this.selectedPrescription.patientNom || '';
    return `${prenom} ${nom}`.trim() || 'Non spécifié';
  }

  getMedecinName(): string {
    if (!this.selectedPrescription) return 'Non spécifié';
    const prenom = this.selectedPrescription.medecinPrenom || '';
    const nom = this.selectedPrescription.medecinNom || '';
    return `${prenom} ${nom}`.trim() || this.selectedPrescription.medecinNom || 'Non spécifié';
  }

  downloadFacture(): void {
    if (this.lastCreatedFactureId) {
      this.dashboardService.downloadFacturePdf(this.lastCreatedFactureId).subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `facture_${this.lastCreatedFactureId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            this.notificationService.success('Téléchargement', 'Facture téléchargée');
          }
        },
        error: (error) => {
          console.error('Erreur téléchargement:', error);
          this.notificationService.error('Erreur', 'Impossible de télécharger la facture');
        }
      });
    }
  }

  cancelFacture(): void {
    this.showFactureForm = false;
    this.selectedPrescription = null;
    this.lastCreatedFactureId = null;
    this.showDownloadButton = false;
    this.factureData = {
      fraisConsultation: 25000,
      fraisHospitalisation: 0,
      fraisExamen: 0
    };
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}