import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-document-item',
  standalone: true,
  imports: [],
  template: `
    <div 
      class="flex items-center justify-between p-3 md:p-4 border-b last:border-b-0 transition-colors hover:bg-[rgba(0,0,0,0.02)]"
      [style.borderColor]="'var(--josanz-stroke-widget)'"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div 
          class="w-2 h-2 rounded-full shrink-0"
          [style.backgroundColor]="statusColor"
        ></div>
        <span 
          class="text-[13px] font-medium truncate"
          [style.color]="themeService.currentTheme().atmosphere.text"
        >
          {{ name }}
        </span>
      </div>
      
      <div class="flex items-center gap-1 md:gap-2 shrink-0">
        @if (showView) {
          <button
            type="button"
            (click)="onView($event)"
            class="p-2 rounded-lg transition-all hover:bg-[rgba(0,0,0,0.05)] active:scale-90"
            [style.color]="themeService.currentTheme().atmosphere.text"
            aria-label="Ver documento"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        }
        @if (showDownload) {
          <button 
            type="button"
            (click)="onDownload($event)"
            class="p-2 rounded-lg transition-all hover:bg-[rgba(0,0,0,0.05)] active:scale-90"
            [style.color]="themeService.currentTheme().atmosphere.text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        }
        
        @if (showDelete) {
          <button 
            type="button"
            (click)="onDelete($event)"
            class="p-2 rounded-lg transition-all hover:bg-red-50 text-red-500 active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        }
      </div>
    </div>
  `
})
export class DocumentItemComponent {
  public themeService = inject(JosanzThemeService);

  @Input() name = '';
  @Input() statusColor = 'var(--josanz-success)';
  @Input() showView = false;
  @Input() showDownload = true;
  @Input() showDelete = false;

  @Output() view = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onView(event: Event) {
    event.stopPropagation();
    this.view.emit();
  }

  onDownload(event: Event) {
    event.stopPropagation();
    this.download.emit();
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit();
  }
}
