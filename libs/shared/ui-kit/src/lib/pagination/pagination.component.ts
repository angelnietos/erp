import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PaginationVariant = 'default' | 'dark' | 'light' | 'primary' | 'ghost' | 'minimal';

@Component({
  selector: 'ui-josanz-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" [class]="'pagination-' + variant">
      <button 
        class="page-btn prev-btn" 
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
        class="page-btn next-btn"
        [disabled]="currentPage === totalPages"
        (click)="onPageChange(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>
  `,
  styles: [`
    .pagination { 
      display: flex; 
      gap: 6px; 
      justify-content: center; 
      padding: 1.5rem; 
      flex-wrap: wrap;
    }

    .page-btn {
      padding: 8px 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--font-display);
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .page-btn.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .prev-btn, .next-btn {
      font-size: 0.7rem;
      padding-left: 20px;
      padding-right: 20px;
      border-color: var(--border-vibrant);
    }

    /* Variants */
    .pagination-dark .page-btn { background: #000; border-color: #222; }
    .pagination-primary .page-btn.active { background: var(--brand); color: #fff; }
    .pagination-ghost .page-btn { background: transparent; border-color: transparent; }
    .pagination-minimal .page-btn { 
      padding: 6px 12px; 
      min-width: auto; 
    }
  `],
})
export class UiPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisiblePages = 5;
  @Input() variant: PaginationVariant = 'default';
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
