import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination">
      <button 
        class="page-btn" 
        [disabled]="currentPage === 1"
        (click)="onPageChange(currentPage - 1)"
      >
        Anterior
      </button>
      
      @for (page of visiblePages; track page) {
        <button 
          class="page-btn" 
          [class.active]="page === currentPage"
          (click)="onPageChange(page)"
        >
          {{ page }}
        </button>
      }
      
      <button 
        class="page-btn"
        [disabled]="currentPage === totalPages"
        (click)="onPageChange(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>
  `,
  styles: [`
    .pagination { display: flex; gap: 8px; justify-content: center; padding: 16px; }
    .page-btn {
      padding: 8px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #E2E8F0; font-size: 14px; cursor: pointer; transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { background: rgba(79,70,229,0.2); border-color: #4F46E5; }
    .page-btn.active { background: #4F46E5; border-color: #4F46E5; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class UiPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisiblePages = 5;
  @Output() pageChange = new EventEmitter<number>();

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    const end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}