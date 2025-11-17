import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

// Interface moved to user.service.ts

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent],
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  search: string = '';
  loading: boolean = false;
  error: string = '';

  get filteredUsers(): User[] {
    return this.users.filter(u =>
      u.nom.toLowerCase().includes(this.search.toLowerCase()) ||
      u.role.toLowerCase().includes(this.search.toLowerCase()) ||
      u.email.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  showAddForm = false;
  showEditForm = false;
  editingUser: User | null = null;
  newUser: User = {
    id: 0,
    nom: '',
    role: 'Médecin',
    email: '',
    statut: 'Active',
    password: '',
    photo: ''
  };

  roles = ['Médecin', 'Secrétaire', 'Patient'];
  statuts = ['Active', 'Inactive', 'En attente'];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        this.showNotification('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.showEditForm = false;
    if (this.showAddForm) {
      this.resetNewUser();
    }
  }

  addUser() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.resetNewUser();
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.showEditForm = true;
    this.showAddForm = false;
  }

  saveUser() {
    if (this.validateUser(this.newUser)) {
      this.loading = true;
      
      this.userService.createUser(this.newUser).subscribe({
        next: (response) => {
          this.showAddForm = false;
          this.resetNewUser();
          this.showNotification('Utilisateur ajouté avec succès!');
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.showNotification('Erreur lors de la création de l\'utilisateur');
          this.loading = false;
        }
      });
    }
  }

  updateUser() {
    if (this.editingUser && this.validateUser(this.editingUser)) {
      this.loading = true;
      
      this.userService.updateUser(this.editingUser).subscribe({
        next: (response) => {
          this.showEditForm = false;
          this.editingUser = null;
          this.showNotification('Utilisateur modifié avec succès!');
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showNotification('Erreur lors de la mise à jour de l\'utilisateur');
          this.loading = false;
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ?`)) {
      this.loading = true;
      
      this.userService.deleteUser(user).subscribe({
        next: () => {
          this.showNotification('Utilisateur supprimé avec succès!');
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showNotification('Erreur lors de la suppression de l\'utilisateur');
          this.loading = false;
        }
      });
    }
  }

  activate(user: User) {
    user.statut = 'Active';
    this.showNotification(`Utilisateur ${user.nom} activé!`);
  }

  deactivate(user: User) {
    user.statut = 'Inactive';
    this.showNotification(`Utilisateur ${user.nom} désactivé!`);
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingUser = null;
    this.resetNewUser();
  }

  onPhotoSelected(event: any, user: User) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        user.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getDefaultPhoto(role: string): string {
    switch (role) {
      case 'Médecin':
        return 'assets/images/users/default-doctor.svg';
      case 'Secrétaire':
        return 'assets/images/users/default-secretary.svg';
      case 'Patient':
        return 'assets/images/users/default-patient.svg';
      case 'Admin':
        return 'assets/images/users/default-admin.svg';
      default:
        return 'assets/images/users/default-user.svg';
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Médecin':
        return 'bg-blue-100 text-blue-800';
      case 'Secrétaire':
        return 'bg-purple-100 text-purple-800';
      case 'Patient':
        return 'bg-green-100 text-green-800';
      case 'Admin':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private resetNewUser() {
    this.newUser = {
      id: 0,
      nom: '',
      role: 'Médecin',
      email: '',
      statut: 'Active',
      password: '',
      photo: '',
      telephone: '',
      specialite: '', // Pour médecin
      adresse: '', // Pour patient
      dateNaissance: '', // Pour patient
      numeroSecuriteSociale: '' // Pour patient
    };
  }

  private validateUser(user: User): boolean {
    if (!user.nom.trim()) {
      alert('Le nom est requis');
      return false;
    }
    if (!user.email.trim() || !this.isValidEmail(user.email)) {
      alert('Email invalide');
      return false;
    }
    if (user.password && user.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthode supprimée car l'ID est généré par le backend

  private showNotification(message: string) {
    // Ici vous pourriez implémenter un système de notification plus sophistiqué
    console.log(message);
  }
}
