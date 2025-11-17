// Ajout dans medecin-rendezvous.component.ts - Section à modifier

// Dans les propriétés :
showUpcoming = false;

// Modifier la méthode loadRendezVous :
loadRendezVous(): void {
  const service = this.showUpcoming ? 
    this.rendezVousService.getUpcomingRendezVous() : 
    this.rendezVousService.getAllRendezVous();
  
  service.subscribe({
    next: rdv => {
      this.rendezVous = rdv.filter(r => r.medecinDTO?.id === this.currentUser?.id);
      if (this.showUpcoming) {
        const now = new Date();
        this.rendezVous = this.rendezVous.filter(r => new Date(r.dateHeureDebut) > now);
      }
      this.currentPage = 1;
      this.filterRendezVous();
      const label = this.showUpcoming ? 'RDV à venir' : 'rendez-vous';
      this.notificationService.success('Actualisation', `${this.rendezVous.length} ${label} chargés`);
    },
    error: () => {
      this.notificationService.error('Erreur', 'Impossible de charger les rendez-vous');
    }
  });
}

// Ajouter la méthode :
toggleUpcoming(): void {
  this.showUpcoming = !this.showUpcoming;
  this.loadRendezVous();
}

// Modifier le template header-actions :
/*
<div class="header-actions">
  <button (click)="toggleUpcoming()" [class]="showUpcoming ? 'btn-primary' : 'btn-secondary'">
    {{ showUpcoming ? '📋 Tous' : '⏰ À venir' }}
  </button>
  <button (click)="loadRendezVous()" class="btn-secondary" type="button">🔄 Actualiser</button>
</div>
*/