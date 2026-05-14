import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-6 backdrop-blur-[2px]">
      <div
        [class]="modalClasses"
        [style.backgroundColor]="themeService.currentTheme().atmosphere.surface"
        [style.width]="width"
        [style.maxWidth]="'100%'"
        [style.maxHeight]="'92vh'"
      >
        <!-- Close Button -->
        <button
          type="button"
          (click)="onClose($event)"
          class="absolute top-8 right-8 p-1.5 rounded-full transition-all z-[60] opacity-50 hover:opacity-100 cursor-pointer hover:bg-[color-mix(in_srgb,var(--josanz-border)_45%,transparent)]"
          [style.color]="themeService.currentTheme().atmosphere.text"
          aria-label="Cerrar modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-12 pt-14 pb-8 no-scrollbar">
          <h2
            class="text-[32px] font-bold mb-10 pr-12 tracking-tight"
            [style.color]="customColor || themeService.currentTheme().atmosphere.text"
          >
            {{ title }}
          </h2>
          <div [style.color]="themeService.currentTheme().atmosphere.text">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer -->
        <div 
          class="px-12 py-8 flex items-center justify-center gap-6 flex-shrink-0 border-t"
          [style.backgroundColor]="themeService.currentTheme().atmosphere.surface"
          [style.borderColor]="themeService.currentTheme().atmosphere.border"
        >
          <ng-content select="[footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class ModalComponent {
  public themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() width = '712px';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Output() close = new EventEmitter<void>();

  get modalClasses() {
    const base =
      'shadow-[0px_20px_50px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden transition-all duration-300';
    
    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = {
      rounded: 'rounded-[24px]',
      pill: 'rounded-[40px]',
      square: 'rounded-none',
      modal: 'rounded-[24px]',
      inner: 'rounded-[12px]',
      avatar: 'rounded-[12px]',
      field: 'rounded-[12px]'
    };

    return [
      base,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded
    ].join(' ');
  }

  onClose(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close.emit();
  }
}
