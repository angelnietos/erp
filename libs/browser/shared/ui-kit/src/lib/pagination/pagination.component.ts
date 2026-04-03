import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type PaginationVariant = 'default' | 'minimal' | 'glass';

@Component({
  selector: 'ui-josanz-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pagination" [class]="'pagination-' + variant">
      <button 
        class="page-btn nav-btn" 
        [disabled]="currentPage === 1"
        (click)="onPageChange(currentPage - 1)"
      >
        <lucide-icon name="chevron-left"></lucide-icon>
        @if (variant !== 'minimal') { <span>ANTERIOR</span> }
      </button>
      
      <div class="pages-group">
        @for (page of visiblePages; track page) {
          <button 
            class="page-btn" 
            [class.active]="page === currentPage"
            (click)="onPageChange(page)"
          >
            {{ page }}
          </button>
        }
      </div>
      
      <button 
        class="page-btn nav-btn"
        [disabled]="currentPage === totalPages"
        (click)="onPageChange(currentPage + 1)"
      >
        @if (variant !== 'minimal') { <span>SIGUIENTE</span> }
        <lucide-icon name="chevron-right"></lucide-icon>
      </button>
    </div>
  `,
  styles: [`
    .pagination { 
      display: flex; 
      gap: 8px; 
      justify-content: center; 
      align-items: center;
      padding: 0.5rem 0.25rem; 
      width: 100%;
    }

    .pages-group { display: flex; gap: 6px; }

    .page-btn {
      height: 1.75rem;
      min-width: 1.75rem;
      padding: 0 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: var(--transition-base);
      font-family: var(--font-main);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .page-btn:not(:disabled):hover {
      background: var(--surface-hover);
      color: #fff;
      border-color: var(--brand);
      transform: translateY(-2px);
    }

    .page-btn.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      box-shadow: 0 4px 15px -5px var(--brand-glow);
    }

    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .nav-btn { font-size: 0.52rem; letter-spacing: 0.05em; }
    .nav-btn lucide-icon { width: 1.1rem; height: 1.1rem; }

    /* Variants */
    .pagination-minimal .pages-group { display: none; }
    
    .pagination-glass .page-btn {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
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
