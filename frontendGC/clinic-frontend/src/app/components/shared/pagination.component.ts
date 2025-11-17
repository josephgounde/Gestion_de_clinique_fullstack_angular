import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="totalPages > 1" class="pagination">
      <button (click)="previousPage()" [disabled]="currentPage === 0" class="btn-pagination">◀ Précédent</button>
      <span class="page-info">Page {{ currentPage + 1 }} sur {{ totalPages }} ({{ totalElements }} total)</span>
      <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1" class="btn-pagination">Suivant ▶</button>
    </div>
  `,
  styles: [`
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; padding: 1rem; background: white; border-radius: 8px; }
    .btn-pagination { padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; }
    .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-weight: 500; color: #333; }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Output() pageChange = new EventEmitter<number>();

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }
}