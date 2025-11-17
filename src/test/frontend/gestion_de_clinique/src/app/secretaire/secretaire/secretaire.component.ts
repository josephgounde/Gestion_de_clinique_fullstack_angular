import { Component, OnInit } from '@angular/core';
import { SecretaireService } from '../../services/secretaire.service';
import { Secretaire } from '../../models/secretaire.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../components/app-footer/footer.component";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  selector: 'app-secretaire',
  templateUrl: './secretaire.component.html',
})

export class SecretaireComponent implements OnInit {

  secretaires: Secretaire[] = [];
  search: string = '';

  get filteredSecretaires(): Secretaire[] {
    return this.secretaires.filter(s =>
      s.nom?.toLowerCase().includes(this.search.toLowerCase()) ||
      s.prenom?.toLowerCase().includes(this.search.toLowerCase()) ||
      s.email?.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  constructor(private secretaireService: SecretaireService) {}

  ngOnInit(): void {
    this.secretaireService.getAll().subscribe(data => this.secretaires = data);
  }

  delete(id: number) {
    this.secretaireService.delete(id).subscribe(() => {
      this.secretaires = this.secretaires.filter(s => s.id !== id);
    });
  }
}