import { Component, OnInit } from '@angular/core';
import { FacturationService } from '../../services/facturation.service';
import { Facture } from '../../models/facture.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-facture',
  templateUrl: './facture.component.html',
})
export class FactureComponent implements OnInit {
  factures: Facture[] = [];
  search: string = '';

  get filteredFactures(): Facture[] {
    return this.factures.filter(f =>
      f.id?.toString().includes(this.search) ||
      f.patientId?.toString().includes(this.search) ||
      f.montant?.toString().includes(this.search) ||
      f.date?.toLocaleDateString().toLowerCase().includes(this.search.toLowerCase())
    );
  }

  constructor(private facturationService: FacturationService) {}

  ngOnInit(): void {
    this.facturationService.getAll().subscribe(data => this.factures = data);
  }
}