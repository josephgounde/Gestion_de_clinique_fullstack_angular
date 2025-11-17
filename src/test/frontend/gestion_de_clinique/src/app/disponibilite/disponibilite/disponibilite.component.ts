import { Component, OnInit } from '@angular/core';
import { DisponibiliteService } from '../../services/disponibilite.service';
import { Disponibilite } from '../../models/disponibilite.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-disponibilite',
  templateUrl: './disponibilite.component.html',
})
export class DisponibiliteComponent implements OnInit {
  disponibilites: Disponibilite[] = [];
  search: string = '';

  get filteredDisponibilites(): Disponibilite[] {
    return this.disponibilites.filter(d =>
      d.id?.toString().includes(this.search) ||
      d.medecinId?.toString().includes(this.search) ||
      d.date?.toLowerCase().includes(this.search.toLowerCase()) ||
      d.heure?.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  constructor(private disponibiliteService: DisponibiliteService) {}

  ngOnInit(): void {
    this.disponibiliteService.getAll().subscribe(data => this.disponibilites = data);
  }
}