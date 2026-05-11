import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-in fade-in duration-300">
      <div 
        class="bg-white rounded-[12px] shadow-[0px_10px_24px_rgba(0,0,0,0.2)] w-[712px] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 relative"
      >
        <!-- Close Button -->
        <button (click)="onClose()" class="absolute top-8 right-8 text-[#1A1A1A] hover:opacity-50 transition-opacity z-20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-12 scrollbar-none">
          <h2 class="text-[32px] font-bold text-[#1A1A1A] mb-8">{{ title }}</h2>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-12 pb-12 pt-4 flex justify-center items-center gap-8 bg-white rounded-b-[12px]">
          <ng-content select="[footer-actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
