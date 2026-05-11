import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-[#000000]/80 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div class="bg-white rounded-[16px] shadow-[0px_20px_40px_rgba(0,0,0,0.4)] w-full max-w-[760px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <!-- Header -->
        <div class="flex justify-between items-center px-12 pt-12 pb-6">
          <h2 class="text-[32px] font-bold text-[#1A1A1A] tracking-tight">{{ title }}</h2>
          <button (click)="onClose()" class="text-[#A0AEC0] hover:text-[#2D3748] transition-colors p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-12 py-4 flex-1">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="px-12 py-12 flex justify-between items-center gap-6">
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
