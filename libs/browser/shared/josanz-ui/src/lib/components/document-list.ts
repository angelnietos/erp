import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-document-list',
  standalone: true,
  imports: [],
  template: `
    <div class="w-full space-y-4">
      @if (showUpload) {
        <button 
          type="button"
          (click)="upload.emit()"
          class="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-xl transition-all hover:brightness-95 active:scale-[0.99]"
          [style.backgroundColor]="themeService.currentTheme().atmosphere.surface"
          [style.borderColor]="accentColor || themeService.currentTheme().primaryColor"
          [style.color]="accentColor || themeService.currentTheme().primaryColor"
          [attr.aria-label]="uploadLabel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span class="text-[13px] font-bold uppercase tracking-wider">{{ uploadLabel }}</span>
        </button>
      }

      <div 
        class="overflow-hidden border border-solid w-full"
        [class.rounded-2xl]="activeShape() === 'rounded'"
        [class.rounded-none]="activeShape() === 'square'"
        [class.rounded-[32px]]="activeShape() === 'pill'"
        [style.backgroundColor]="themeService.currentTheme().atmosphere.surface"
        [style.borderColor]="themeService.currentTheme().atmosphere.border"
        [style.boxShadow]="themeService.currentTheme().atmosphere.cardShadow || 'none'"
      >
        <ng-content></ng-content>
        
        @if (empty) {
          <div class="p-8 text-center text-[13px] opacity-50" [style.color]="themeService.currentTheme().atmosphere.textMuted">
            No hay documentos disponibles.
          </div>
        }
      </div>
    </div>
  `
})
export class DocumentListComponent {
  public themeService = inject(JosanzThemeService);

  @Input() uploadLabel = 'Subir documentación';
  @Input() showUpload = true;
  @Input() empty = false;
  /** Color opcional para el botón de subida (si no se usa el primario). */
  @Input() accentColor?: string;
  /** Override del shape; si no se pasa, usa el shape global del tema. */
  @Input() shape?: JosanzControlShape;

  @Output() upload = new EventEmitter<void>();

  activeShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }
}
