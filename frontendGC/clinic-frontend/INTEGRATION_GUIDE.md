# Guide d'Intégration des Nouvelles Fonctionnalités

## 1. Toggle RDV à venir (Médecin)

### Dans `medecin-rendezvous.component.ts` :

1. **Ajouter la propriété :**
```typescript
showUpcoming = false;
```

2. **Modifier le template header-actions :**
```html
<div class="header-actions">
  <button (click)="toggleUpcoming()" [class]="showUpcoming ? 'btn-primary' : 'btn-secondary'">
    {{ showUpcoming ? '📋 Tous' : '⏰ À venir' }}
  </button>
  <button (click)="loadRendezVous()" class="btn-secondary" type="button">🔄 Actualiser</button>
</div>
```

3. **Remplacer la méthode loadRendezVous() par le code du fichier `medecin-rendezvous-updated.component.ts`**

## 2. Module Factures (Secrétaire)

### Ajouter la route dans `app.routes.ts` :
```typescript
{ path: 'secretaire/factures', component: SecretaireFacturesComponent }
```

### Ajouter le lien dans la sidebar de tous les composants secrétaire :
```html
<li><a routerLink="/secretaire/factures">💰 Factures</a></li>
```

## 3. Historique Médical (Médecin)

### Dans `medecin-patients.component.ts` :

1. **Ajouter l'import :**
```typescript
import { PatientHistoryModalComponent } from './patient-history-modal.component';
```

2. **Ajouter dans les imports du composant :**
```typescript
imports: [..., PatientHistoryModalComponent]
```

3. **Ajouter les propriétés :**
```typescript
showHistoryModal = false;
selectedPatient: any = null;
```

4. **Modifier la méthode viewHistory :**
```typescript
viewHistory(patient: any): void {
  this.selectedPatient = patient;
  this.showHistoryModal = true;
}
```

5. **Ajouter dans le template avant la fermeture de dashboard-container :**
```html
<app-patient-history-modal 
  [isVisible]="showHistoryModal" 
  [patient]="selectedPatient"
  (closed)="showHistoryModal = false">
</app-patient-history-modal>
```

## 4. Backend - Endpoints manquants

### Ajouter dans FactureController :
```java
@PutMapping("/{id}/status")
public ResponseEntity<FactureDto> updateFactureStatus(@PathVariable Integer id, @RequestParam String statut) {
    // Logique pour marquer une facture comme payée
}

@PostMapping("/{id}/reminder")
public ResponseEntity<Void> sendReminder(@PathVariable Integer id) {
    // Logique pour envoyer un email de relance
}
```

## Résultat Final

✅ **Médecin :**
- Liste des patients avec historique médical détaillé
- Vue des RDV avec toggle "À venir"
- Modal d'historique complet par patient

✅ **Secrétaire :**
- Gestion complète des RDV
- Suivi des factures avec filtres (Toutes/Impayées/Payées)
- Actions de relance et marquage payé
- Téléchargement PDF des factures

L'expérience utilisateur est maintenant complète avec toutes les fonctionnalités demandées.