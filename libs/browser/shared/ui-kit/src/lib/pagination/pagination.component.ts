import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type PaginationVariant = 'default' | 'minimal' | 'glass';

@Component({
  selector: 'ui-pagination',
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
        @if (variant !== 'minimal') { <span>Anterior</span> }
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
        @if (variant !== 'minimal') { <span>Siguiente</span> }
        <lucide-icon name="chevron-right"></lucide-icon>
      </button>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      padding: 0.65rem 0.35rem;
      width: 100%;
      flex-wrap: wrap;
    }

    .pages-group {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .page-btn {
      min-height: 2.1rem;
      min-width: 2.1rem;
      padding: 0 0.65rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0.02em;
      line-height: 1.3;
      cursor: pointer;
      transition:
        transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
        background 0.25s ease,
        border-color 0.25s ease,
        color 0.25s ease,
        box-shadow 0.28s ease;
      font-family: var(--font-main);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .page-btn:not(:disabled):hover {
      background: color-mix(in srgb, var(--surface-hover, var(--bg-secondary)) 88%, var(--brand) 6%);
      color: #fff;
      border-color: color-mix(in srgb, var(--brand) 45%, var(--border-soft));
      transform: translateY(-2px);
      box-shadow: 0 8px 22px -10px var(--brand-glow);
    }

    .page-btn:not(:disabled):active {
      transform: translateY(0) scale(0.97);
    }

    .page-btn:focus-visible {
      outline: 2px solid var(--ring-focus);
      outline-offset: 2px;
    }

    .page-btn.active {
      background: var(--brand);
      border-color: var(--brand);
      color: #fff;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.15) inset,
        0 6px 22px -6px var(--brand-glow);
    }

    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .nav-btn { font-size: 0.65rem; letter-spacing: 0.02em; font-weight: 600; }
    .nav-btn lucide-icon { width: 1.1rem; height: 1.1rem; }

    /* Variants */
    .pagination-minimal .pages-group { display: none; }
    
    .pagination-glass .page-btn {
      background: color-mix(in srgb, var(--surface, rgba(255, 255, 255, 0.04)) 70%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    @media (prefers-reduced-motion: reduce) {
      .page-btn:not(:disabled):hover {
        transform: none;
      }
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
