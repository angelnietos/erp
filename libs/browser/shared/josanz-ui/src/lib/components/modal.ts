import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-in fade-in duration-300">
      <div 
        style="width: 712px; border-radius: 8px; box-shadow: 0px 10px 24px rgba(97, 97, 97, 0.4);"
        class="bg-white overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative max-h-[90vh]"
      >
        <!-- Close Icon -->
        <button (click)="onClose()" class="absolute top-6 right-6 text-[#1A1A1A] hover:opacity-50 transition-opacity z-20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Scrollable Area -->
        <div class="flex-1 overflow-y-auto px-12 pt-12 pb-6">
          <h2 class="text-[32px] font-bold text-[#1A1A1A] mb-8">{{ title }}</h2>
          <div class="modal-body-content">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="px-12 py-10 flex justify-center items-center gap-8 bg-white">
          <ng-content select="[footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
