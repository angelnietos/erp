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
    .pagination { display: flex; gap: 8px; justify-content: center; padding: 16px; }

    /* Default Variant */
    .pagination-default .page-btn {
      padding: 8px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #E2E8F0;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-default .page-btn:hover:not(:disabled) {
      background: rgba(79,70,229,0.2);
      border-color: #4F46E5;
    }
    .pagination-default .page-btn.active {
      background: #4F46E5;
      border-color: #4F46E5;
    }
    .pagination-default .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Dark Variant */
    .pagination-dark .page-btn {
      padding: 8px 16px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #E2E8F0;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-dark .page-btn:hover:not(:disabled) {
      background: #334155;
      border-color: #4F46E5;
    }
    .pagination-dark .page-btn.active {
      background: #4F46E5;
      border-color: #4F46E5;
    }
    .pagination-dark .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Light Variant */
    .pagination-light .page-btn {
      padding: 8px 16px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      color: #1E293B;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-light .page-btn:hover:not(:disabled) {
      background: #F8FAFC;
      border-color: #4F46E5;
      color: #4F46E5;
    }
    .pagination-light .page-btn.active {
      background: #4F46E5;
      border-color: #4F46E5;
      color: white;
    }
    .pagination-light .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Primary Variant */
    .pagination-primary .page-btn {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #64748B;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-primary .page-btn:hover:not(:disabled) {
      background: rgba(79,70,229,0.1);
      color: #4F46E5;
    }
    .pagination-primary .page-btn.active {
      background: #4F46E5;
      color: white;
    }
    .pagination-primary .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Ghost Variant */
    .pagination-ghost .page-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: var(--theme-text-muted, #64748B);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-ghost .page-btn:hover:not(:disabled) {
      background: var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .pagination-ghost .page-btn.active {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }
    .pagination-ghost .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Minimal Variant */
    .pagination-minimal .page-btn {
      padding: 6px 12px;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: var(--theme-text-muted, #64748B);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-minimal .page-btn:hover:not(:disabled) {
      color: var(--theme-primary, #4F46E5);
      background: rgba(79,70,229,0.1);
    }
    .pagination-minimal .page-btn.active {
      color: white;
      background: var(--theme-primary, #4F46E5);
    }
    .pagination-minimal .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
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
