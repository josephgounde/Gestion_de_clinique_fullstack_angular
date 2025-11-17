# Services API - Documentation

Cette documentation décrit les services Angular créés pour consommer les API controllers de votre backend Spring Boot.

## 🔧 Configuration

### API Configuration
Le fichier `src/app/config/api.config.ts` centralise toutes les URLs des endpoints API :

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  AUTH: { /* endpoints d'authentification */ },
  MEDECIN: { /* endpoints médecins */ },
  PATIENT: { /* endpoints patients */ },
  // ... autres configurations
};
```

### Intercepteur d'authentification
L'intercepteur `AuthInterceptor` ajoute automatiquement le token JWT à toutes les requêtes HTTP et gère les erreurs 401.

### Guard d'authentification
Le `AuthGuard` protège les routes qui nécessitent une authentification.

## 📋 Services disponibles

### 1. AuthService
**Fichier :** `src/app/services/auth.service.ts`

**Fonctionnalités :**
- Connexion utilisateur avec JWT
- Déconnexion
- Récupération des informations utilisateur
- Gestion du token d'authentification

**Utilisation :**
```typescript
// Connexion
this.authService.login({ email: 'user@test.com', password: 'password' })
  .subscribe(response => {
    // Token stocké automatiquement
    // Utilisateur connecté
  });

// Vérifier si connecté
if (this.authService.isAuthenticated()) {
  // Utilisateur connecté
}

// Déconnexion
this.authService.logout().subscribe(() => {
  // Redirection vers login
});
```

### 2. MedecinService
**Fichier :** `src/app/services/medecin.service.ts`

**Endpoints consommés :**
- `GET /api/medecin/all` - Récupérer tous les médecins
- `POST /api/medecin/save` - Créer un médecin
- `PUT /api/medecin/{id}` - Mettre à jour un médecin
- `DELETE /api/medecin/{id}` - Supprimer un médecin
- `GET /api/medecin/{id}` - Récupérer un médecin par ID

**Utilisation :**
```typescript
// Récupérer tous les médecins
this.medecinService.getAll().subscribe(medecins => {
  console.log(medecins);
});

// Créer un médecin
this.medecinService.create(medecin).subscribe(newMedecin => {
  console.log('Médecin créé:', newMedecin);
});
```

### 3. PatientService
**Fichier :** `src/app/services/patient.service.ts`

**Endpoints consommés :**
- `GET /api/patient/all` - Récupérer tous les patients
- `POST /api/patient/save` - Créer un patient
- `PUT /api/patient/update/{id}` - Mettre à jour un patient
- `DELETE /api/patient/{id}` - Supprimer un patient
- `GET /api/patient/{id}` - Récupérer un patient par ID

### 4. SecretaireService
**Fichier :** `src/app/services/secretaire.service.ts`

**Endpoints consommés :**
- `GET /api/secretaire/all` - Récupérer tous les secrétaires
- `POST /api/secretaire/save` - Créer un secrétaire
- `PUT /api/secretaire/{id}` - Mettre à jour un secrétaire
- `DELETE /api/secretaire/{id}` - Supprimer un secrétaire
- `GET /api/secretaire/{id}` - Récupérer un secrétaire par ID

### 5. PrescriptionService
**Fichier :** `src/app/services/prescription.service.ts`

**Endpoints consommés :**
- `GET /api/prescription/all` - Récupérer toutes les prescriptions
- `POST /api/prescription/save` - Créer une prescription
- `PUT /api/prescription/{id}` - Mettre à jour une prescription
- `DELETE /api/prescription/{id}` - Supprimer une prescription
- `GET /api/prescription/{id}` - Récupérer une prescription par ID
- `GET /api/prescription/rendezvous/{rendezvousId}` - Prescriptions par rendez-vous
- `GET /api/prescription/{id}/pdf` - Télécharger PDF

### 6. RendezvousService
**Fichier :** `src/app/services/rendezvous.service.ts`

**Endpoints consommés :**
- `GET /api/rendezvous/all` - Récupérer tous les rendez-vous
- `POST /api/rendezvous/create` - Créer un rendez-vous
- `PUT /api/rendezvous/update/{id}` - Mettre à jour un rendez-vous
- `DELETE /api/rendezvous/delete/{id}` - Supprimer un rendez-vous
- `DELETE /api/rendezvous/cancel/{id}` - Annuler un rendez-vous
- `GET /api/rendezvous/all/upcoming` - Rendez-vous à venir
- `GET /api/rendezvous/between-dates` - Rendez-vous entre dates
- `POST /api/rendezvous/all/search` - Rechercher des rendez-vous

### 7. ChatService
**Fichier :** `src/app/services/chat.service.ts`

**Fonctionnalités :**
- Communication en temps réel via WebSocket
- Messages REST pour l'historique
- Gestion des messages non lus

**Endpoints consommés :**
- `GET /api/chat/conversation/{otherUserId}` - Récupérer une conversation
- `GET /api/chat/unread` - Messages non lus
- `POST /api/chat/mark-read/{senderId}` - Marquer comme lu

**WebSocket :**
- `ws://localhost:8080/ws` - Connexion WebSocket

## 🔐 Authentification

### Token JWT
Le token JWT est automatiquement :
1. **Stocké** lors de la connexion
2. **Ajouté** à toutes les requêtes HTTP via l'intercepteur
3. **Supprimé** lors de la déconnexion ou erreur 401

### Protection des routes
Toutes les routes principales sont protégées par `AuthGuard` :
```typescript
{ 
  path: 'dashboard', 
  component: DashboardComponent,
  canActivate: [AuthGuard]  // Protection automatique
}
```

## 🚀 Démarrage

### 1. Démarrer le backend Spring Boot
```bash
# Dans votre projet Spring Boot
mvn spring-boot:run
```

### 2. Démarrer l'application Angular
```bash
npm start
```

### 3. Tester la connexion
- Ouvrir `http://localhost:4200`
- Se connecter avec les identifiants de votre backend
- Vérifier que les données se chargent correctement

## 🔧 Configuration CORS

Assurez-vous que votre backend Spring Boot autorise les requêtes CORS depuis `http://localhost:4200`.

## 📝 Notes importantes

1. **Gestion d'erreurs** : Tous les services gèrent automatiquement les erreurs HTTP
2. **Token automatique** : L'intercepteur ajoute automatiquement le token JWT
3. **Redirection** : En cas d'erreur 401, redirection automatique vers `/login`
4. **WebSocket** : Le chat utilise WebSocket pour la communication en temps réel

## 🐛 Dépannage

### Erreur CORS
- Vérifier que le backend autorise les requêtes depuis `http://localhost:4200`
- Vérifier que le backend est démarré sur le port 8080

### Erreur 401
- Vérifier que le token JWT est valide
- Vérifier que l'utilisateur existe dans la base de données

### Erreur de connexion WebSocket
- Vérifier que le backend supporte WebSocket sur `/ws`
- Vérifier que le token est envoyé lors de la connexion WebSocket 