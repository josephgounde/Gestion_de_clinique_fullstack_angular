import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProfileModalComponent } from '../shared/profile-modal.component';
import { ConflictModalComponent } from '../shared/conflict-modal.component';
import { CancelModalComponent } from '../shared/cancel-modal.component';
import { RendezVousService } from '../../services/rendezvous.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-secretaire-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProfileModalComponent, ConflictModalComponent, CancelModalComponent],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <button class="menu-burger" (click)="toggleSidebar()" title="Menu">☰</button>
        <div class="nav-brand">
          <h1>Gestion Clinique</h1>
        </div>
        <!-- <div class="nav-search">
          <div class="search-container">
            <input 
              type="text" 
              placeholder="Rechercher rendez-vous..."
              class="search-input">
          </div>
        </div> -->
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
              <li> <a routerLink="/secretaire" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()"> 📊 Tableau de bord </a> </li>
              <li> <a routerLink="/secretaire/patients" routerLinkActive="active" (click)="closeSidebar()"> 👥 Patients </a> </li>
              <li> <a routerLink="/secretaire/rendezvous" routerLinkActive="active" (click)="closeSidebar()"> 📅 Rendez-vous </a> </li>
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
            <h2>📅 Gestion des Rendez-vous</h2>
            <div class="header-actions">
              <button (click)="showAddForm = !showAddForm" class="btn-primary">
                {{ showAddForm ? '❌ Annuler' : '➕ Nouveau RDV' }}
              </button>
              <button (click)="loadRendezVous()" class="btn-refresh">🔄 Actualiser</button>
            </div>
          </div>

          <div *ngIf="showAddForm" class="rdv-form">
            <h3>{{ editingRdv ? 'Modifier' : 'Nouveau' }} Rendez-vous</h3>
            <form (ngSubmit)="saveRendezVous()" #rdvForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Patient *:</label>
                  <select [(ngModel)]="currentRdv.patientId" name="patientId" required class="form-control">
                    <option value="">Sélectionner un patient</option>
                    <option *ngFor="let patient of patients" [value]="patient.id">
                      {{ patient.prenom }} {{ patient.nom }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Médecin *:</label>
                  <select [(ngModel)]="currentRdv.medecinId" name="medecinId" required class="form-control">
                    <option value="">Sélectionner un médecin</option>
                    <option *ngFor="let medecin of medecins" [value]="medecin.id">
                      Dr. {{ medecin.prenom }} {{ medecin.nom }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date *:</label>
                  <input type="date" [(ngModel)]="currentRdv.date" name="date" required 
                         [min]="getTodayDate()" [max]="getMaxRdvDate()" 
                         class="form-control" #dateRdvField="ngModel">
                  <div *ngIf="dateRdvField.invalid && dateRdvField.touched" class="error-message">
                    <span *ngIf="dateRdvField.errors?.['required']">Date obligatoire</span>
                    <span *ngIf="dateRdvField.errors?.['min']">Date passée non autorisée</span>
                    <span *ngIf="dateRdvField.errors?.['max']">Maximum 6 mois à l'avance</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Heure *:</label>
                  <input type="time" [(ngModel)]="currentRdv.heure" name="heure" required 
                         min="08:00" max="18:00" 
                         class="form-control" #heureField="ngModel">
                  <div *ngIf="heureField.invalid && heureField.touched" class="error-message">
                    <span *ngIf="heureField.errors?.['required']">Heure obligatoire</span>
                    <span *ngIf="heureField.errors?.['min'] || heureField.errors?.['max']">Horaires: 8h-18h</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Motif:</label>
                <textarea [(ngModel)]="currentRdv.motif" name="motif" 
                          maxlength="500" rows="3" 
                          class="form-control" #motifField="ngModel"></textarea>
                <div *ngIf="motifField.invalid && motifField.touched" class="error-message">
                  <span *ngIf="motifField.errors?.['maxlength']">Maximum 500 caractères</span>
                </div>
              </div>
              <div class="form-group">
                <label>Salle:</label>
                <input [(ngModel)]="currentRdv.salle" name="salle" 
                       maxlength="20" pattern="[a-zA-Z0-9\s-]+" 
                       class="form-control" placeholder="Ex: Salle 101" #salleField="ngModel">
                <div *ngIf="salleField.invalid && salleField.touched" class="error-message">
                  <span *ngIf="salleField.errors?.['pattern']">Caractères alphanumériques uniquement</span>
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" [disabled]="!rdvForm.valid" class="btn-save">💾 Sauvegarder</button>
                <button type="button" (click)="cancelEdit()" class="btn-cancel">❌ Annuler</button>
              </div>
            </form>
          </div>

          <div class="filter-section">
            <div class="filters">
              <select [(ngModel)]="statusFilter" (change)="filterRendezVous()" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="PLANIFIE">Planifié</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="ANNULE">Annulé</option>
                <option value="TERMINE">Terminé</option>
              </select>
              <input type="date" [(ngModel)]="dateFilter" (change)="filterRendezVous()" class="filter-date">
            </div>
          </div>

          <div class="rdv-timeline">
            <div *ngFor="let rdv of filteredRendezVous" class="rdv-card" [class]="'status-' + rdv.statut?.toLowerCase()">
              <div class="rdv-header">
                <div class="rdv-time">
                  <strong>{{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</strong>
                </div>
                <div class="rdv-status">
                  <span class="status-badge" [class]="'badge-' + rdv.statut?.toLowerCase()">{{ getStatusDisplay(rdv.statut) }}</span>
                </div>
              </div>
              <div class="rdv-details">
                <div class="rdv-patient">
                  <h4>👤 {{ getPatientName(rdv) }}</h4>
                  <p>📞 {{ getPatientPhone(rdv) }}</p>
                </div>
                <div class="rdv-medecin">
                  <h5>👨‍⚕️ {{ getMedecinName(rdv) }}</h5>
                </div>
                <div class="rdv-motif" *ngIf="rdv.motif">
                  <p><strong>Motif:</strong> {{ rdv.motif }}</p>
                </div>
                <div class="rdv-salle" *ngIf="rdv.salle">
                  <p><strong>🏥 Salle:</strong> {{ rdv.salle }}</p>
                </div>
              </div>
              <div class="rdv-actions">
                <button (click)="editRendezVous(rdv)" class="btn-edit">✏️ Modifier</button>
                <button (click)="confirmRendezVous(rdv)" *ngIf="rdv.statut === 'PLANIFIE'" class="btn-confirm">✅ Confirmer</button>
                <button (click)="cancelRendezVous(rdv)" *ngIf="rdv.statut !== 'ANNULE'" class="btn-cancel-rdv">❌ Annuler</button>
              </div>
            </div>
          </div>

          <div class="pagination" *ngIf="totalPages > 1">
            <button (click)="previousPage()" [disabled]="currentPage === 1" class="btn-pagination">‹ Précédent</button>
            <span class="pagination-info">Page {{ currentPage }} sur {{ totalPages }}</span>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="btn-pagination">Suivant ›</button>
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
      
      <app-conflict-modal
        [isVisible]="showConflictModal"
        [message]="conflictMessage"
        (closed)="showConflictModal = false">
      </app-conflict-modal>
      
      <app-cancel-modal
        [isVisible]="showCancelModal"
        (closed)="showCancelModal = false"
        (confirmed)="confirmCancelRendezVous($event)">
      </app-cancel-modal>
    </div>
  `,
  styles: [`
    /* Base Container */
    .dashboard-container {
      height: 100vh;
      background: linear-gradient(135deg, #e8f5e8, #f0f8f0, #e1f5e1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Navbar */
    .navbar {
      background-color: #72c9b2ff;
      color: #fff;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      flex-shrink: 0;
      position: relative;
      z-index: 10;
    }

    .menu-burger {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.8rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .menu-burger:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .nav-search {
      flex: 1;
      max-width: 500px;
    }

    .search-container {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      outline: none;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      font-weight: 600;
    }

    .user-role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .role-secretaire {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    /* Main Content */
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background: white;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease;
      position: relative;
      z-index: 100;
    }

    .sidebar-header {
      display: none;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .close-sidebar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #333;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
      margin-left: auto;
    }

    .close-sidebar:hover {
      background-color: #f0f0f0;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-menu li a {
      display: block;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #333;
      border-bottom: 1px solid #eee;
      transition: all 0.2s;
    }

    .nav-menu li a:hover,
    .nav-menu li a.active {
      background-color: #72c9b2ff;
      color: white;
    }

    .sidebar-footer {
      padding: 1rem;
      padding-bottom: 1.5rem;
      border-top: 1px solid #eee;
      background: #f8f9fa;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #28a745, #20c997);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: #fff;
      cursor: pointer;
      transition: transform 0.3s;
      flex-shrink: 0;
    }

    .user-avatar:hover {
      transform: scale(1.1);
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: bold;
      font-size: 0.9rem;
      color: #333;
    }

    .user-role {
      font-size: 0.8rem;
      color: #666;
    }

    .btn-logout-sidebar {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-logout-sidebar:hover {
      background: linear-gradient(135deg, #c82333, #a71e2a);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }

    .logout-icon {
      font-size: 1.1rem;
    }

    .sidebar-overlay {
      display: none;
    }

    /* Content Area */
    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .global-footer {
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      padding: 1rem 0;
      flex-shrink: 0;
    }

    .footer-content {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: #fff;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 3px 8px rgba(40, 167, 69, 0.2);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #20c997, #1e7e34);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
    }

    .btn-refresh {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      background: #17a2b8;
      color: white;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      background: #138496;
      transform: translateY(-2px);
    }

    /* RDV Form */
    .rdv-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .rdv-form h3 {
      margin-top: 0;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      border-color: #28a745;
    }

    .form-control.ng-invalid.ng-touched {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    .form-control.ng-valid.ng-touched {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }

    .error-message {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .btn-save {
      background: #28a745;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-save:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .btn-save:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .btn-cancel {
      background: #dc3545;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #c82333;
      transform: translateY(-2px);
    }

    /* Filter Section */
    .filter-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select,
    .filter-date {
      flex: 1;
      min-width: 200px;
      padding: 0.75rem;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .filter-select:focus,
    .filter-date:focus {
      border-color: #28a745;
    }

    /* RDV Timeline */
    .rdv-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .rdv-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border-left: 4px solid #28a745;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .rdv-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .rdv-card.status-confirme {
      border-left-color: #28a745;
    }

    .rdv-card.status-annule {
      border-left-color: #dc3545;
    }

    .rdv-card.status-termine {
      border-left-color: #6c757d;
    }

    .rdv-card.status-planifie {
      border-left-color: #007bff;
    }

    .rdv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .rdv-time {
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      white-space: nowrap;
    }

    .badge-planifie {
      background: #e3f2fd;
      color: #1976d2;
    }

    .badge-confirme {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .badge-annule {
      background: #ffebee;
      color: #c62828;
    }

    .badge-termine {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .rdv-details {
      margin-bottom: 1rem;
    }

    .rdv-patient h4,
    .rdv-medecin h5 {
      margin: 0.5rem 0;
      color: #333;
    }

    .rdv-patient p {
      margin: 0.25rem 0;
      color: #666;
    }

    .rdv-motif p,
    .rdv-salle p {
      margin: 0.5rem 0;
      color: #666;
    }

    .rdv-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-edit,
    .btn-confirm,
    .btn-cancel-rdv {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 120px;
    }

    .btn-edit {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
    }

    .btn-edit:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #28a745, #218838);
      color: white;
    }

    .btn-confirm:hover {
      background: linear-gradient(135deg, #218838, #1e7e34);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-cancel-rdv {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
    }

    .btn-cancel-rdv:hover {
      background: linear-gradient(135deg, #c82333, #a71e2a);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .btn-pagination {
      padding: 0.5rem 1rem;
      border: 1px solid #28a745;
      background: white;
      color: #28a745;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #28a745;
      color: white;
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-weight: 600;
      color: #333;
    }

    /* ------------------------------ Mobile Responsive ------------------------------ */
    @media (max-width: 992px) {
      .menu-burger {
        display: block;
      }

      .navbar {
        padding: 1rem;
        gap: 1rem;
      }

      .nav-brand h1 {
        font-size: 1.2rem;
      }

      .nav-search {
        display: none;
      }

      .nav-user {
        display: none;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 280px;
        transform: translateX(-100%);
        z-index: 1000;
      }

      .sidebar.open {
        transform: translateX(0);
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
      }

      .sidebar-header {
        display: flex;
        justify-content: flex-end;
      }

      .sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }

      .sidebar.open ~ .sidebar-overlay {
        display: block;
      }

      .content {
        padding: 1.5rem 1rem;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .filter-select,
      .filter-date {
        min-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem;
      }

      .nav-brand h1 {
        font-size: 1rem;
      }

      .content {
        padding: 1rem 0.75rem;
      }

      .header h2 {
        font-size: 1.3rem;
      }

      .header-actions button {
        flex: 1;
      }

      .rdv-form {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .filter-section {
        padding: 1rem;
      }

      .filters {
        flex-direction: column;
      }

      .rdv-card {
        padding: 1rem;
      }

      .rdv-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .rdv-actions {
        width: 100%;
      }

      .btn-edit,
      .btn-confirm,
      .btn-cancel-rdv {
        width: 100%;
      }

      .pagination {
        padding: 0.75rem;
      }
    }

    @media (max-width: 576px) {
      .header {
        padding: 1rem;
      }

      .header h2 {
        font-size: 1.1rem;
      }

      .header-actions {
        flex-direction: column;
      }

      .btn-primary,
      .btn-refresh {
        width: 100%;
        justify-content: center;
      }

      .rdv-form {
        padding: 1rem;
        border-radius: 0;
      }

      .form-control {
        font-size: 16px; /* Prevents zoom on iOS */
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }

      .rdv-card {
        padding: 0.75rem;
      }

      .rdv-time strong {
        font-size: 0.9rem;
      }

      .status-badge {
        font-size: 0.7rem;
      }

      .rdv-patient h4 {
        font-size: 1rem;
      }

      .rdv-medecin h5 {
        font-size: 0.9rem;
      }

      .rdv-motif p,
      .rdv-salle p {
        font-size: 0.9rem;
      }

      .pagination {
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-pagination {
        width: 100%;
      }
    }
  `]
})
export class SecretaireRendezVousComponent implements OnInit {
  rendezVous: any[] = [];
  filteredRendezVous: any[] = [];
  patients: any[] = [];
  medecins: any[] = [];
  currentRdv: any = this.initRdv();
  showAddForm = false;
  editingRdv = false;
  currentUser: User | null = null;
  statusFilter = '';
  dateFilter = '';
  showProfileModal = false;
  showConflictModal = false;
  conflictMessage = '';
  showCancelModal = false;
  rdvToCancel: any = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  isSidebarOpen = false;

  constructor(
    private rendezVousService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadData();
    
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.currentRdv.patientId = +params['patientId'];
        this.showAddForm = true;
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

  loadData(): void {
    this.loadRendezVous();
    this.loadPatients();
    this.loadMedecins();
  }

  loadRendezVous(): void {
    this.rendezVousService.getAllRendezVous().subscribe({
      next: rdv => {
        this.rendezVous = rdv.sort((a, b) => new Date(b.dateHeureDebut).getTime() - new Date(a.dateHeureDebut).getTime());
        this.currentPage = 1;
        this.filterRendezVous();
      },
      error: (error) => {
        console.error('Erreur chargement:', error);
        this.notificationService.error('Erreur', 'Impossible de charger les rendez-vous');
      }
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: patients => this.patients = patients,
      error: () => {}
    });
  }

  loadMedecins(): void {
    this.medecinService.getAllMedecins().subscribe({
      next: medecins => this.medecins = medecins,
      error: () => {}
    });
  }

  initRdv(): any {
    return {
      patientId: '',
      medecinId: '',
      date: '',
      heure: '',
      motif: '',
      salle: ''
    };
  }

  filterRendezVous(): void {
    const filtered = this.rendezVous.filter(rdv => {
      const statusMatch = !this.statusFilter || rdv.statut === this.statusFilter;
      const dateMatch = !this.dateFilter || rdv.dateHeureDebut?.startsWith(this.dateFilter);
      return statusMatch && dateMatch;
    });
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.updatePaginatedResults(filtered);
  }

  updatePaginatedResults(filtered: any[]): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredRendezVous = filtered.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterRendezVous();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterRendezVous();
    }
  }

  saveRendezVous(): void {
    const rdvData = {
      ...this.currentRdv,
      dateHeureDebut: `${this.currentRdv.date}T${this.currentRdv.heure}:00`,
      dateHeureFin: `${this.currentRdv.date}T${this.currentRdv.heure}:00`
    };
    
    delete rdvData.date;
    delete rdvData.heure;

    if (this.editingRdv) {
      const updateData = {
        patientId: this.currentRdv.patientId,
        medecinId: this.currentRdv.medecinId,
        dateHeureDebut: rdvData.dateHeureDebut,
        motif: this.currentRdv.motif,
        salle: this.currentRdv.salle
      };
      this.rendezVousService.updateRendezVous(this.currentRdv.id, updateData).subscribe({
        next: () => {
          this.loadRendezVous();
          this.cancelEdit();
        },
        error: (error) => {
          if (error.status === 409 || (error.error && error.error.includes('conflit'))) {
            this.conflictMessage = 'Créneau déjà occupé pour ce médecin à cette heure';
            this.showConflictModal = true;
          } else {
            let errorMessage = 'Impossible de modifier le rendez-vous';
            if (error.error && typeof error.error === 'string') {
              errorMessage = error.error;
            }
            this.notificationService.error('Erreur', errorMessage);
          }
        }
      });
    } else {
      this.rendezVousService.createRendezVous(rdvData).subscribe({
        next: () => {
          this.loadRendezVous();
          this.cancelEdit();
        },
        error: (error) => {
          if (error.status === 409 || (error.error && error.error.includes('conflit'))) {
            this.conflictMessage = 'Créneau déjà occupé pour ce médecin à cette heure';
            this.showConflictModal = true;
          } else {
            let errorMessage = 'Impossible de créer le rendez-vous';
            if (error.error && typeof error.error === 'string') {
              errorMessage = error.error;
            }
            this.notificationService.error('Erreur', errorMessage);
          }
        }
      });
    }
  }

  editRendezVous(rdv: any): void {
    let date = '';
    let heure = '';
    
    if (rdv.dateHeureDebut) {
      try {
        const dateTime = new Date(rdv.dateHeureDebut);
        if (!isNaN(dateTime.getTime())) {
          date = dateTime.toISOString().split('T')[0];
          heure = dateTime.toTimeString().slice(0, 5);
        } else {
          const now = new Date();
          date = now.toISOString().split('T')[0];
          heure = now.toTimeString().slice(0, 5);
        }
      } catch (error) {
        const now = new Date();
        date = now.toISOString().split('T')[0];
        heure = now.toTimeString().slice(0, 5);
      }
    } else {
      const now = new Date();
      date = now.toISOString().split('T')[0];
      heure = now.toTimeString().slice(0, 5);
    }
    
    this.currentRdv = {
      id: rdv.id,
      patientId: rdv.patientId,
      medecinId: rdv.medecinDTO?.id,
      date: date,
      heure: heure,
      motif: rdv.motif,
      salle: rdv.salle
    };
    
    this.editingRdv = true;
    this.showAddForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmRendezVous(rdv: any): void {
    this.rendezVousService.updateRendezVousStatus(rdv.id, 'CONFIRME').subscribe({
      next: () => {
        this.loadRendezVous();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Impossible de confirmer le rendez-vous');
      }
    });
  }

  cancelRendezVous(rdv: any): void {
    this.rdvToCancel = rdv;
    this.showCancelModal = true;
  }

  confirmCancelRendezVous(motif: string): void {
    if (this.rdvToCancel) {
      this.rendezVousService.updateRendezVousStatus(this.rdvToCancel.id, 'ANNULE').subscribe({
        next: () => {
          this.loadRendezVous();
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible d\'annuler le rendez-vous');
        }
      });
      this.rdvToCancel = null;
    }
  }

  cancelEdit(): void {
    this.currentRdv = this.initRdv();
    this.editingRdv = false;
    this.showAddForm = false;
  }

  getPatientName(rdv: any): string {
    if (rdv.patientNom) {
      return rdv.patientNom;
    }
    const patient = this.patients.find(p => p.id === rdv.patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  }

  getPatientPhone(rdv: any): string {
    const patient = this.patients.find(p => p.id === rdv.patientId);
    return patient?.telephone || 'N/A';
  }

  getMedecinName(rdv: any): string {
    if (rdv.medecinDTO) {
      return `Dr. ${rdv.medecinDTO.prenom} ${rdv.medecinDTO.nom}`;
    }
    const medecin = this.medecins.find(m => m.id === rdv.medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin inconnu';
  }

  getStatusDisplay(statut: string): string {
    switch(statut) {
      case 'PLANIFIE': return 'Planifié';
      case 'CONFIRME': return 'Confirmé';
      case 'ANNULE': return 'Annulé';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      default: return statut;
    }
  }

  onAvatarUpdated(avatarUrl: string): void {
    if (this.currentUser) {
      this.currentUser.avatarUrl = avatarUrl;
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMaxRdvDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().split('T')[0];
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