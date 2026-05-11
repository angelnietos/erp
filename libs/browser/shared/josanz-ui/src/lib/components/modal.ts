import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-[12px] shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex justify-between items-center px-10 pt-10 pb-4">
          <h2 class="text-[24px] font-bold text-[#1A1A1A]">{{ title }}</h2>
          <button (click)="onClose()" class="text-[#A0AEC0] hover:text-[#2D3748] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-10 py-4 flex-1">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="px-10 py-10 flex justify-end items-center gap-10">
          <button (click)="onClose()" class="text-[14px] font-medium text-[#718096] hover:text-[#2D3748] transition-colors">
            Cancelar
          </button>
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
