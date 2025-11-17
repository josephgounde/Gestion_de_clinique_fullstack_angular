# Frontend Gestion Clinique

Application Angular pour la gestion d'une clinique médicale.

## Fonctionnalités

- **Authentification** : Connexion sécurisée avec JWT
- **Gestion des Patients** : CRUD complet pour les patients
- **Gestion des Médecins** : CRUD complet pour les médecins
- **Gestion des Rendez-vous** : Planification et suivi des rendez-vous
- **Dashboard** : Vue d'ensemble de l'activité de la clinique

## Technologies utilisées

- Angular 17
- TypeScript
- Angular Material (optionnel)
- RxJS pour la gestion des données asynchrones
- Angular Router pour la navigation
- HTTP Client pour les appels API

## Structure du projet

```
src/
├── app/
│   ├── components/          # Composants de l'application
│   │   ├── login/          # Composant de connexion
│   │   ├── dashboard/      # Tableau de bord
│   │   ├── patients/       # Gestion des patients
│   │   ├── medecins/       # Gestion des médecins
│   │   └── rendezvous/     # Gestion des rendez-vous
│   ├── services/           # Services Angular
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── medecin.service.ts
│   │   └── rendezvous.service.ts
│   ├── models/             # Interfaces TypeScript
│   ├── guards/             # Guards de navigation
│   └── interceptors/       # Intercepteurs HTTP
└── assets/                 # Ressources statiques
```

## Installation et démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
ng serve
```

3. Ouvrir http://localhost:4200 dans votre navigateur

## Configuration

- **API Backend** : L'application est configurée pour communiquer avec l'API Spring Boot sur http://localhost:8080
- **Proxy** : Un fichier `proxy.conf.json` est configuré pour rediriger les appels API

## Utilisation

1. **Connexion** : Utilisez vos identifiants pour vous connecter
2. **Navigation** : Utilisez le menu latéral pour naviguer entre les différentes sections
3. **CRUD Operations** : Chaque section permet de créer, lire, modifier et supprimer les entités

## API Endpoints utilisés

- `POST /api/auth/login` - Authentification
- `GET /api/patients/all` - Liste des patients
- `POST /api/patients/save` - Créer un patient
- `PUT /api/patients/update/{id}` - Modifier un patient
- `DELETE /api/patients/{id}` - Supprimer un patient
- `GET /api/medecin/all` - Liste des médecins
- `GET /api/rendezvous/all` - Liste des rendez-vous

## Développement

Pour ajouter de nouvelles fonctionnalités :

1. Créer les modèles TypeScript dans `models/`
2. Créer les services dans `services/`
3. Créer les composants dans `components/`
4. Ajouter les routes dans `app.routes.ts`

## Build

Pour construire l'application pour la production :

```bash
ng build --prod
```

Les fichiers de build seront générés dans le dossier `dist/`.