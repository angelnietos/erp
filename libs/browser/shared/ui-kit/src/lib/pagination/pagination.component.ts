import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type PaginationVariant = 'default' | 'minimal' | 'glass';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <nav
      class="pagination"
      [class]="'pagination-' + variant"
      role="navigation"
      aria-label="Paginación"
    >
      <button 
        type="button"
        class="page-btn nav-btn" 
        [disabled]="currentPage === 1"
        (click)="onPageChange(currentPage - 1)"
        [attr.aria-label]="variant === 'minimal' ? 'Página anterior' : 'Ir a la página anterior'"
      >
        <lucide-icon name="chevron-left" aria-hidden="true"></lucide-icon>
        @if (variant !== 'minimal') { <span>Anterior</span> }
      </button>
      
      <div class="pages-group">
        @for (page of visiblePages; track page) {
          <button 
            type="button"
            class="page-btn" 
            [class.active]="page === currentPage"
            (click)="onPageChange(page)"
            [attr.aria-label]="'Ir a la página ' + page"
            [attr.aria-current]="page === currentPage ? 'page' : null"
          >
            {{ page }}
          </button>
        }
      </div>
      
      <button 
        type="button"
        class="page-btn nav-btn"
        [disabled]="currentPage === totalPages"
        (click)="onPageChange(currentPage + 1)"
        [attr.aria-label]="'Ir a la página siguiente'"
      >
        @if (variant !== 'minimal') { <span>Siguiente</span> }
        <lucide-icon name="chevron-right" aria-hidden="true"></lucide-icon>
      </button>
    </nav>
  `,
  styles: [`
    .pagination {
      display: flex;
      gap: 12px;
      justify-content: center;
      align-items: center;
      padding: 1rem 0.5rem;
      width: 100%;
    }

    .pages-group {
      display: flex;
      gap: 8px;
    }

    .page-btn {
      min-height: 2.5rem;
      min-width: 2.5rem;
      padding: 0 0.8rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.4s var(--transition-spring);
      font-family: var(--font-display);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: var(--shadow-sm);
    }

    .page-btn:not(:disabled):hover {
      background: var(--brand-ambient);
      color: #fff;
      border-color: var(--brand);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px var(--brand-glow);
    }

    .page-btn:not(:disabled):active {
      transform: translateY(2px) scale(0.96);
    }

    .page-btn.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      box-shadow: 
        0 10px 25px -5px var(--brand-glow),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    .page-btn:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    .nav-btn { 
      font-size: 0.7rem; 
      text-transform: uppercase; 
      letter-spacing: 0.15em; 
    }
    
    .nav-btn lucide-icon { width: 1.2rem; height: 1.2rem; }

    /* Glass Variant */
    .pagination-glass .page-btn {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px) saturate(1.5);
      border-color: rgba(255, 255, 255, 0.08);
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
