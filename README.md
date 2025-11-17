# 🏥 Système de Gestion de Clinique

Application complète de gestion de clinique avec Spring Boot (backend) et Angular (frontend).

## 📋 Table des Matières
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Comptes par Défaut](#comptes-par-défaut)
- [Manuel d'Utilisation](#manuel-dutilisation)
- [Architecture](#architecture)
- [Dépannage](#dépannage)

## 🔧 Prérequis

- **Java 17+**
- **Node.js 18+** et npm
- **PostgreSQL 12+**
- **Maven 3.6+**
- **Angular CLI 17+**

## 📦 Installation

### 1. Cloner le Projet
```bash
git clone <url-du-repo>
cd gestion_clinic
```

### 2. Configuration Base de Données

#### Créer la base PostgreSQL :
```sql
CREATE DATABASE gestion_clinic_db;
```

#### Configurer les variables d'environnement dans `src/main/resources/application-dev.yml` :
```yaml
POSTGRES_SQL_HOST: localhost
POSTGRES_SQL_PORT: 5432
POSTGRES_SQL_DB: gestion_clinic_db
POSTGRES_SQL_USERNAME: votre_username
POSTGRES_SQL_PASSWORD: votre_password
```

### 3. Configuration Email (Optionnel)
Pour les notifications par email, configurez dans `application-dev.yml` :
```yaml
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: votre_email@gmail.com
SMTP_PASSWORD: votre_mot_de_passe_application
```

## 🚀 Lancement

### Backend (Spring Boot)
```bash
# Dans le dossier racine
mvn clean install
mvn spring-boot:run
```
➡️ Backend accessible sur `http://localhost:8080`

### Frontend (Angular)
```bash
# Dans un nouveau terminal
cd frontendGC/clinic-frontend
npm install
ng serve
```
➡️ Frontend accessible sur `http://localhost:4200`

## 👤 Comptes par Défaut

L'application crée automatiquement ces comptes au premier démarrage :

### 🔑 Administrateur
- **Email :** `admin@clinic.com`
- **Mot de passe :** `admin123`
- **Accès :** Gestion complète du système

### 👨‍⚕️ Médecin
- **Email :** `medecin@clinic.com`
- **Mot de passe :** `medecin123`
- **Accès :** Patients, RDV, Prescriptions

### 👩‍💼 Secrétaire
- **Email :** `secretaire@clinic.com`
- **Mot de passe :** `secretaire123`
- **Accès :** Patients, RDV, Prescriptions, Factures

## 📖 Manuel d'Utilisation

### 🔐 Connexion
1. Accédez à `http://localhost:4200`
2. Utilisez un des comptes par défaut
3. Vous êtes redirigé selon votre rôle

### 👨‍⚕️ Interface Médecin

#### Gestion des Patients
- **Consulter :** Liste avec historique médical complet
- **Rechercher :** Barre de recherche par nom/email
- **Historique :** Clic sur "📋 Historique" pour voir antécédents, allergies, RDV et prescriptions

#### Gestion des Rendez-vous
- **Vue Calendrier :** Planning visuel des RDV
- **Vue Liste :** Liste détaillée avec filtres
- **Toggle "À venir" :** Affiche uniquement les RDV futurs
- **Actions :** Confirmer, Annuler, Terminer les RDV

#### Prescriptions
- **Créer :** Formulaire avec médicaments multiples
- **Consulter :** Vue compacte avec expansion au clic
- **Détails :** Motif, médicaments, hospitalisation, examens
- **PDF :** Téléchargement des prescriptions

### 👩‍💼 Interface Secrétaire

#### Gestion des Patients
- **CRUD complet :** Créer, modifier, supprimer
- **Recherche avancée :** Filtres multiples
- **Export :** Données patients

#### Gestion des Rendez-vous
- **Planification :** Créer nouveaux RDV
- **Modification :** Changer date/heure/médecin
- **Annulation :** Avec notification automatique
- **Suivi :** Statuts en temps réel

#### Gestion des Factures
- **Création :** À partir des prescriptions
- **Suivi :** Filtres Toutes/Payées/Impayées
- **Actions :** Marquer payée, Relances, PDF
- **Statistiques :** Revenus par période

### 🔧 Interface Administrateur

#### Tableau de Bord
- **Statistiques :** Patients, Médecins, RDV, Revenus
- **Graphiques :** Évolution des données
- **Actions rapides :** Accès direct aux fonctions

#### Gestion des Utilisateurs
- **Médecins :** Créer, modifier, désactiver
- **Secrétaires :** Gestion complète
- **Permissions :** Attribution des rôles

#### Gestion des Factures
- **Vue globale :** Toutes les factures par année
- **Classement :** Organisation par mois
- **Revenus :** Calcul automatique (factures payées uniquement)
- **Export :** PDF individuels

## 🏗️ Architecture

```
gestion_clinic/
├── src/main/java/                 # Backend Spring Boot
│   ├── controllers/               # API REST
│   ├── services/                  # Logique métier
│   ├── model/                     # Entités JPA
│   ├── dto/                       # Objets de transfert
│   └── repositories/              # Accès données
├── frontendGC/clinic-frontend/    # Frontend Angular
│   ├── src/app/components/        # Composants UI
│   ├── src/app/services/          # Services HTTP
│   └── src/app/models/            # Modèles TypeScript
└── src/main/resources/            # Configuration
```

## 🔧 Fonctionnalités Techniques

### 🔒 Sécurité
- **JWT :** Authentification par tokens
- **CORS :** Configuration multi-ports
- **Rôles :** ADMIN, MEDECIN, SECRETAIRE

### 💬 Communication
- **WebSocket :** Chat temps réel
- **Notifications :** Push en temps réel
- **Email :** Rappels automatiques

### 📊 Données
- **PostgreSQL :** Base de données relationnelle
- **JPA/Hibernate :** ORM avec audit automatique
- **Pagination :** 6 éléments par page

### 📄 Documents
- **PDF :** Génération prescriptions/factures
- **Export :** Données patients/statistiques

## 🚨 Dépannage

### Erreur de Connexion DB
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql
# Vérifier les credentials dans application-dev.yml
```

### Erreur CORS
- Le backend accepte `localhost:4200` et `localhost:4203`
- Vérifier les ports dans les contrôleurs

### WebSocket Non Connecté
- Démarrer le backend avant le frontend
- WebSockets utilisent le port 8080

### Factures Non Chargées
- Vérifier l'endpoint `/api/factures/all`
- Contrôler les logs backend pour les erreurs

### Email Non Envoyé
- Configurer un mot de passe d'application Gmail
- Vérifier SMTP_USER et SMTP_PASSWORD

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs backend et frontend
2. Consulter la section dépannage
3. Vérifier la configuration des variables d'environnement

## 🧪 Cas de Test

### 🔐 Tests d'Authentification

#### Test 1 : Connexion Administrateur
- **Données** : `admin@clinic.com` / `admin123`
- **Résultat attendu** : Redirection vers tableau de bord admin
- **Vérifications** : Menu complet visible, statistiques affichées

#### Test 2 : Connexion Médecin
- **Données** : `medecin@clinic.com` / `medecin123`
- **Résultat attendu** : Interface médecin avec patients et RDV
- **Vérifications** : Accès limité aux fonctions médicales

#### Test 3 : Connexion Secrétaire
- **Données** : `secretaire@clinic.com` / `secretaire123`
- **Résultat attendu** : Interface secrétaire avec gestion patients/RDV
- **Vérifications** : Pas d'accès aux fonctions admin

### 👥 Tests Gestion Patients

#### Test 4 : Création Patient (Secrétaire)
- **Action** : Ajouter nouveau patient avec données complètes
- **Données** : Nom, prénom, email, téléphone, adresse
- **Résultat attendu** : Patient créé et visible dans la liste
- **Vérifications** : Validation des champs obligatoires

#### Test 5 : Recherche Patient
- **Action** : Utiliser la barre de recherche
- **Données** : Nom partiel ou email
- **Résultat attendu** : Filtrage en temps réel
- **Vérifications** : Résultats pertinents affichés

#### Test 6 : Historique Patient (Médecin)
- **Action** : Cliquer sur "Historique" d'un patient
- **Résultat attendu** : Modal avec antécédents, allergies, RDV
- **Vérifications** : Données complètes et organisées

### 📅 Tests Gestion Rendez-vous

#### Test 7 : Création RDV (Secrétaire)
- **Action** : Planifier nouveau RDV
- **Données** : Patient, médecin, date future, heure 8h-18h
- **Résultat attendu** : RDV créé avec statut "Planifié"
- **Vérifications** : Validation des créneaux horaires

#### Test 8 : Conflit d'Horaire
- **Action** : Créer RDV sur créneau occupé
- **Résultat attendu** : Popup de conflit avec message explicite
- **Vérifications** : "Créneau déjà occupé pour ce médecin"

#### Test 9 : Annulation RDV
- **Action** : Annuler un RDV existant
- **Résultat attendu** : Popup de confirmation avec champ motif
- **Vérifications** : Statut changé en "Annulé"

#### Test 10 : Confirmation RDV (Médecin)
- **Action** : Confirmer RDV planifié
- **Résultat attendu** : Statut "Confirmé"
- **Vérifications** : Changement visible dans la liste

### 💊 Tests Prescriptions

#### Test 11 : Création Prescription (Médecin)
- **Action** : Créer prescription avec médicaments multiples
- **Données** : RDV, médicaments, dosages, posologies
- **Résultat attendu** : Prescription sauvegardée
- **Vérifications** : Validation des champs obligatoires

#### Test 12 : Export PDF Prescription
- **Action** : Télécharger prescription en PDF
- **Résultat attendu** : Fichier PDF généré et téléchargé
- **Vérifications** : Contenu complet et formaté

### 💰 Tests Gestion Factures

#### Test 13 : Création Facture (Secrétaire)
- **Action** : Générer facture depuis prescription
- **Résultat attendu** : Facture créée avec statut "Impayée"
- **Vérifications** : Montant calculé automatiquement

#### Test 14 : Marquage Facture Payée
- **Action** : Marquer facture comme payée
- **Résultat attendu** : Statut "Payée" et inclusion dans revenus
- **Vérifications** : Statistiques mises à jour

### 👨💼 Tests Gestion Utilisateurs (Admin)

#### Test 15 : Création Utilisateur
- **Action** : Ajouter nouveau médecin/secrétaire
- **Données** : Informations complètes + rôle
- **Résultat attendu** : Utilisateur créé avec bon rôle
- **Vérifications** : Connexion possible avec nouveaux identifiants

#### Test 16 : Modification Utilisateur
- **Action** : Éditer informations utilisateur existant
- **Résultat attendu** : Modifications sauvegardées
- **Vérifications** : Changements visibles dans la liste

### 💬 Tests Messagerie

#### Test 17 : Envoi Message (Admin)
- **Action** : Envoyer message à médecin/secrétaire
- **Résultat attendu** : Message reçu en temps réel
- **Vérifications** : Notification WebSocket fonctionnelle

#### Test 18 : Chat Bidirectionnel
- **Action** : Conversation entre médecin et secrétaire
- **Résultat attendu** : Messages échangés dans les deux sens
- **Vérifications** : Historique conservé

### 🔍 Tests Filtres et Recherche

#### Test 19 : Filtres RDV
- **Action** : Filtrer par statut et date
- **Résultat attendu** : Liste filtrée selon critères
- **Vérifications** : Combinaison de filtres fonctionnelle

#### Test 20 : Pagination
- **Action** : Naviguer entre pages de résultats
- **Résultat attendu** : Chargement correct des pages
- **Vérifications** : Compteurs et navigation cohérents

### 📱 Tests Interface Utilisateur

#### Test 21 : Responsive Design
- **Action** : Redimensionner fenêtre navigateur
- **Résultat attendu** : Interface adaptée à toutes tailles
- **Vérifications** : Éléments accessibles sur mobile

#### Test 22 : Notifications Visuelles
- **Action** : Déclencher actions avec notifications
- **Résultat attendu** : Popups appropriés affichés
- **Vérifications** : Messages clairs et informatifs

### 🔒 Tests Sécurité

#### Test 23 : Accès Non Autorisé
- **Action** : Tenter d'accéder à URL admin sans droits
- **Résultat attendu** : Redirection vers page d'erreur
- **Vérifications** : Sécurité des routes respectée

#### Test 24 : Session Expirée
- **Action** : Utiliser application après expiration token
- **Résultat attendu** : Redirection vers page de connexion
- **Vérifications** : Gestion propre de l'authentification

### 📊 Tests Performance

#### Test 25 : Chargement Initial
- **Action** : Mesurer temps de chargement première connexion
- **Résultat attendu** : < 3 secondes
- **Vérifications** : Interface réactive

#### Test 26 : Gestion Données Volumineuses
- **Action** : Tester avec 100+ patients/RDV
- **Résultat attendu** : Performance maintenue
- **Vérifications** : Pagination efficace

---

**© kfokam48 2025 - Système de Gestion de Clinique**