import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerModal, type JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-6 backdrop-blur-sm">
      <div
        class="bg-white rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden"
        [style.width]="width"
        [style.maxWidth]="'100%'"
        [style.maxHeight]="'90vh'"
      >
        <!-- Close Button -->
        <button
          type="button"
          (click)="onClose()"
          class="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 opacity-60 hover:opacity-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-900">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-10 pt-12 pb-6 no-scrollbar">
          <h2
            class="text-[28px] font-semibold mb-6 pr-8 tracking-tight"
            [class.text-slate-900]="!customColor"
            [style.color]="customColor || null"
          >
            {{ title }}
          </h2>
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="px-10 py-6 flex items-center justify-center gap-6 bg-white flex-shrink-0">
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
  @Input() title = '';
  @Input() width = '712px';
  /** Esquinas del panel (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color del título del modal (opcional). */
  @Input() customColor?: string;
  @Output() close = new EventEmitter<void>();

  panelClass(): string {
    return `bg-white rounded-[24px] shadow-2xl flex flex-col relative overflow-hidden`;
  }

  onClose() {
    this.close.emit();
  }
}
