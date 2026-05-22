import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '@josanz-erp/shared-data-access';

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
      [style.--pg-gap]="pgGap"
      [style.--pg-btn-size]="pgBtnSize"
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
      gap: var(--pg-gap);
      justify-content: center;
      align-items: center;
      padding: 1rem 0.5rem;
      width: 100%;
    }

    .pages-group {
      display: flex;
      gap: calc(var(--pg-gap) / 2);
    }

    .page-btn {
      height: var(--pg-btn-size);
      min-width: var(--pg-btn-size);
      padding: 0 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s var(--transition-spring);
      font-family: var(--font-main);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .page-btn:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .page-btn.active {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
      box-shadow: var(--shadow-brand);
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-btn { 
      font-size: 0.75rem; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
    }
  `],
})
export class UiPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisiblePages = 5;
  @Input() variant: PaginationVariant = 'default';
  @Output() pageChange = new EventEmitter<number>();

  private themeService = inject(ThemeService);

  get pgGap(): string {
    const density = this.themeService.currentDensity();
    if (density === 'compact') return '6px';
    if (density === 'spacious') return '16px';
    return '12px';
  }

  get pgBtnSize(): string {
    const density = this.themeService.currentDensity();
    if (density === 'compact') return '2.125rem';
    if (density === 'spacious') return '2.75rem';
    return '2.5rem';
  }

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
