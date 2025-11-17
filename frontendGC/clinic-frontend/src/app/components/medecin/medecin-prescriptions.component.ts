import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { PaginationComponent } from '../shared/pagination.component';
import { PrescriptionService } from '../../services/prescription.service';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendezvous.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { Prescription, PrescriptionRequest } from '../../models/prescription.model';

@Component({
  selector: 'app-medecin-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfileModalComponent, PaginationComponent],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <div class="nav-user" *ngIf="currentUser">
          <span class="welcome-text">Dr. {{ currentUser.prenom }} {{ currentUser.nom }}</span>
          <span class="user-role-badge role-medecin">MÉDECIN</span>
        </div>
      </nav>
      
      <div class="main-content">
        <aside class="sidebar" [class.open]="isSidebarOpen">
           <div class="sidebar-header">
            <button class="close-sidebar" (click)="toggleSidebar()" title="Fermer">✖</button>
          </div>
          <div class="sidebar-content">
            <ul class="nav-menu">
              <li>
                <a routerLink="/medecin" routerLinkActive="active"  (click)="closeSidebar()">
                  📊 Tableau de bord
                </a>
              </li>
              <li>
                <a routerLink="/medecin/patients" routerLinkActive="active"  (click)="closeSidebar()">
                  👥 Mes Patients
                </a>
              </li>
              <li>
                <a routerLink="/medecin/rendezvous" routerLinkActive="active" (click)="closeSidebar()">
                  📅 Mes Rendez-vous
                </a>
              </li>
              <li>
                <a routerLink="/medecin/prescriptions" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">
                  💊 Prescriptions
                </a>
              </li>
            </ul>
          </div>
         <div class="sidebar-footer">
            <div class="user-profile" *ngIf="currentUser">
              <div class="user-avatar" (click)="showProfileModal = true">
                <img *ngIf="currentUser.avatarUrl; else defaultAvatar" [src]="currentUser.avatarUrl" alt="Avatar">
                <ng-template #defaultAvatar>👨‍⚕️</ng-template>
              </div>
              <div class="user-details">
                <div class="user-name">Dr. {{ currentUser.prenom }} {{ currentUser.nom }}</div>
                <div class="user-role">Médecin</div>
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
            <h2>💊 Mes Prescriptions</h2>
            <div class="header-actions">
              <button (click)="showCreateForm = true" class="btn-primary">➕ Nouvelle Prescription</button>
              <button (click)="loadPrescriptions()" class="btn-secondary">🔄 Actualiser</button>
            </div>
          </div>

          <!-- Formulaire de création -->
          <div *ngIf="showCreateForm" class="create-form-overlay">
            <div class="create-form">
              <div class="form-header">
                <h3>📝 Nouvelle Prescription</h3>
                <button (click)="cancelCreate()" class="btn-close">✖</button>
              </div>
              <form (ngSubmit)="createPrescription()" #prescriptionForm="ngForm">
                <div class="form-group">
                  <label>📅 Rendez-vous *</label>
                  <select [(ngModel)]="newPrescription.rendezvousId" name="rendezvousId" required class="form-control">
                    <option value="">Sélectionner un rendez-vous</option>
                    <option *ngFor="let rdv of rendezvous" [value]="rdv.id">
                      {{ rdv.patientNom }} - {{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}
                    </option>
                  </select>
                </div>
                <div class="medicaments-section">
                  <div class="section-header">
                    <label>💊 Médicaments *</label>
                    <button type="button" (click)="addMedicament()" class="btn-add">➕ Ajouter</button>
                  </div>
                  <div class="medicaments-table">
                    <div class="table-header">
                      <div class="col-med">Médicament</div>
                      <div class="col-dos">Dosage</div>
                      <div class="col-pos">Posologie</div>
                      <div class="col-act">Action</div>
                    </div>
                    <div *ngFor="let med of medicaments; let i = index" class="table-row">
                      <div class="input-group">
                        <input [(ngModel)]="med.medicament" [name]="'medicament_' + i" required 
                               minlength="2" maxlength="100" pattern="[a-zA-ZÀ-ÿ\s-0-9]+" 
                               placeholder="Ex: Paracétamol" class="form-control" #medField="ngModel">
                        <div *ngIf="medField.invalid && medField.touched" class="error-message">
                          <span *ngIf="medField.errors?.['required']">Médicament obligatoire</span>
                          <span *ngIf="medField.errors?.['pattern']">Caractères invalides</span>
                        </div>
                      </div>
                      <div class="input-group">
                        <input [(ngModel)]="med.dosage" [name]="'dosage_' + i" required 
                               pattern="[0-9]+[a-zA-Z]+" maxlength="20"
                               placeholder="500mg" class="form-control" #dosageField="ngModel">
                        <div *ngIf="dosageField.invalid && dosageField.touched" class="error-message">
                          <span *ngIf="dosageField.errors?.['required']">Dosage obligatoire</span>
                          <span *ngIf="dosageField.errors?.['pattern']">Format: nombre + unité (ex: 500mg)</span>
                        </div>
                      </div>
                      <div class="input-group">
                        <input [(ngModel)]="med.posologie" [name]="'posologie_' + i" required 
                               pattern="[0-9]+[x/][a-zA-Z]+" maxlength="30"
                               placeholder="3x/jour" class="form-control" #posologieField="ngModel">
                        <div *ngIf="posologieField.invalid && posologieField.touched" class="error-message">
                          <span *ngIf="posologieField.errors?.['required']">Posologie obligatoire</span>
                          <span *ngIf="posologieField.errors?.['pattern']">Format: 3x/jour ou 2/jour</span>
                        </div>
                      </div>
                      <button *ngIf="medicaments.length > 1" type="button" (click)="removeMedicament(i)" class="btn-remove">❌</button>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label>🏥 Hospitalisation nécessaire</label>
                  <select [(ngModel)]="newPrescription.hospitalisationNecessaire" name="hospitalisationNecessaire" class="form-control">
                    <option value="false">Non</option>
                    <option value="true">Oui</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>🔬 Examens nécessaires</label>
                  <textarea [(ngModel)]="newPrescription.examensNecessaires" name="examensNecessaires" 
                           maxlength="500" rows="3" 
                           placeholder="Ex: Prise de sang, Radio thorax..." class="form-control" #examensField="ngModel"></textarea>
                  <div *ngIf="examensField.invalid && examensField.touched" class="error-message">
                    <span *ngIf="examensField.errors?.['maxlength']">Maximum 500 caractères</span>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" [disabled]="!prescriptionForm.valid" class="btn-primary">💾 Créer</button>
                  <button type="button" (click)="cancelCreate()" class="btn-secondary">❌ Annuler</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Liste des prescriptions compacte -->
          <div class="prescriptions-list">
            <div *ngFor="let group of getGroupedPrescriptions()" class="prescription-item">
              <div class="prescription-header" (click)="toggleExpand(group)">
                <div class="header-info">
                  <h4>👤 {{ group.patientNom }}</h4>
                  <p>👨⚕️ Dr. {{ group.medecinNom }}</p>
                  <span class="date-badge">📅 {{ group.dateConsultation | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="expand-arrow" [class.expanded]="group.expanded">▶</div>
              </div>
              
              <div class="prescription-details" *ngIf="group.expanded">
                <div class="details-content">
                  <div class="consultation-info">
                    <div class="info-item">
                      <strong>📝 Motif:</strong>
                      <span>{{ group.motifConsultation || 'Non spécifié' }}</span>
                    </div>
                    <div class="info-item">
                      <strong>🕰️ Heure:</strong>
                      <span>{{ group.dateConsultation | date:'HH:mm' }}</span>
                    </div>
                  </div>
                  
                  <div class="medicaments-table">
                    <div class="table-header">
                      <div>Médicament</div>
                      <div>Dosage</div>
                      <div>Posologie</div>
                    </div>
                    <div *ngFor="let prescription of group.prescriptions" class="table-row">
                      <div>{{ prescription.medicament }}</div>
                      <div>{{ prescription.dosage }}</div>
                      <div>{{ prescription.posologie }}</div>
                    </div>
                  </div>
                  
                  <div *ngIf="group.hospitalisationNecessaire" class="alert-info">
                    <strong>🏥 Hospitalisation nécessaire</strong>
                  </div>
                  <div *ngIf="group.examensNecessaires" class="alert-info">
                    <strong>🔬 Examens:</strong> {{ group.examensNecessaires }}
                  </div>
                  
                  <div class="actions">
                    <button (click)="downloadGroupPdf(group)" class="btn-pdf">📄 PDF</button>
                    <button (click)="deleteGroup(group)" class="btn-delete">🗑️ Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="prescriptions.length === 0" class="no-prescriptions">
            <p>💊 Aucune prescription trouvée</p>
          </div>
          
          <app-pagination 
            [currentPage]="currentPage" 
            [totalPages]="totalPages" 
            [totalElements]="totalElements"
            (pageChange)="onPageChange($event)">
          </app-pagination>
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
  background: linear-gradient(rgba(255,255,255,0.3), rgba(0,123,255,0.2)), 
              url('https://mydoctorsclinicsurfers.com.au/wp-content/uploads/2023/04/contact-Banner.jpeg');
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
export class MedecinPrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  patients: any[] = [];
  rendezvous: any[] = [];
  currentUser: User | null = null;
  showProfileModal = false;
  showCreateForm = false;
  isSidebarOpen = false; // for mobile
  newPrescription: any = {
    rendezvousId: 0,
    prescriptionDate: new Date().toISOString().split('T')[0],
    effective: true,
    hospitalisationNecessaire: false,
    examensNecessaires: ''
  };
  medicaments: Array<{medicament: string, posologie: string, dosage: string}> = [{
    medicament: '',
    posologie: '',
    dosage: ''
  }];

  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private rendezVousService: RendezVousService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadPrescriptions();
        this.loadPatients();
        this.loadRendezVous();
        this.checkForPreselectedPatient();
      }
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

  checkForPreselectedPatient(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const rendezvousId = urlParams.get('rendezvousId');
    if (rendezvousId) {
      this.newPrescription.rendezvousId = parseInt(rendezvousId);
      this.showCreateForm = true;
    }
  }

  loadPrescriptions(): void {
    if (this.currentUser?.id) {
      this.prescriptionService.getPrescriptionsByMedecinPaginated(this.currentUser.id, this.currentPage, 6).subscribe({
        next: response => {
          this.prescriptions = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          // Prescriptions chargées silencieusement
        },
        error: (error) => {
          console.error('Erreur lors du chargement des prescriptions:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les prescriptions');
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPrescriptions();
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: patients => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    });
  }

  loadRendezVous(): void {
    if (this.currentUser?.id) {
      this.rendezVousService.getAllRendezVous().subscribe({
        next: rdv => {
          // Filtrer les rendez-vous du médecin connecté
          this.rendezvous = rdv.filter(r => r.medecinDTO?.id === this.currentUser?.id);
          console.log('Rendez-vous chargés pour le médecin:', this.rendezvous.length);
        },
        error: (error) => {
          console.error('Erreur chargement rendez-vous:', error);
        }
      });
    }
  }

  addMedicament(): void {
    this.medicaments.push({
      medicament: '',
      posologie: '',
      dosage: ''
    });
  }

  removeMedicament(index: number): void {
    this.medicaments.splice(index, 1);
  }

  createPrescription(): void {
    const prescriptionData = {
      ...this.newPrescription,
      medicaments: this.medicaments
    };
    
    this.prescriptionService.createMultiplePrescription(prescriptionData).subscribe({
      next: prescriptions => {
        // Prescriptions créées silencieusement
        this.cancelCreate();
        // Recharger les prescriptions pour voir les nouvelles
        this.loadPrescriptions();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.notificationService.error('Erreur', 'Impossible de créer les prescriptions');
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
            // PDF téléchargé silencieusement
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
          // Prescription supprimée silencieusement
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la prescription');
        }
      });
    }
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newPrescription = {
      rendezvousId: 0,
      prescriptionDate: new Date().toISOString().split('T')[0],
      effective: true,
      hospitalisationNecessaire: false,
      examensNecessaires: ''
    };
    this.medicaments = [{
      medicament: '',
      posologie: '',
      dosage: ''
    }];
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  getGroupedPrescriptions(): any[] {
    if (!this.prescriptions || this.prescriptions.length === 0) {
      return [];
    }
    
    const groups = new Map();
    this.prescriptions.forEach(prescription => {
      try {
        const patientNom = prescription.patientNom || 'Inconnu';
        const dateCreation = prescription.dateCreation || new Date().toISOString();
        const key = `${patientNom}_${dateCreation}`;
        
        if (!groups.has(key)) {
          const group = {
            patientNom: `${prescription.patientPrenom || ''} ${patientNom}`.trim(),
            medecinNom: `${prescription.medecinPrenom || ''} ${prescription.medecinNom || ''}`.trim(),
            dateConsultation: dateCreation,
            motifConsultation: prescription.motifConsultation || '',
            prescriptions: [],
            hospitalisationNecessaire: prescription.hospitalisationNecessaire || false,
            examensNecessaires: prescription.examensNecessaires || '',
            expanded: false
          };
          groups.set(key, group);
        }
        groups.get(key)!.prescriptions.push(prescription);
      } catch (error) {
        console.error('Erreur lors du groupement:', error, prescription);
      }
    });
    
    return Array.from(groups.values());
  }

  toggleExpand = (group: any): void => {
    group.expanded = !group.expanded;
  }

  downloadGroupPdf(group: any): void {
    if (group.prescriptions.length > 0) {
      this.downloadPdf(group.prescriptions[0]);
    }
  }

  deleteGroup(group: any): void {
    if (confirm('Supprimer toutes les prescriptions de ce groupe ?')) {
      group.prescriptions.forEach((prescription: any) => {
        if (prescription.id) {
          this.prescriptionService.deletePrescription(prescription.id).subscribe();
        }
      });
      this.loadPrescriptions();
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