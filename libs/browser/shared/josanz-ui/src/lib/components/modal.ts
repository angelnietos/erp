import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-[#000000]/80 animate-in fade-in duration-300">
      <div class="bg-white rounded-[12px] shadow-[0px_10px_30px_rgba(0,0,0,0.3)] w-full max-w-[650px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <!-- Close Button -->
        <div class="flex justify-end pt-6 pr-6">
          <button (click)="onClose()" class="text-[#1A1A1A] hover:opacity-70 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Header -->
        <div class="px-12 pt-2 pb-6">
          <h2 class="text-[26px] font-medium text-[#1A1A1A]">{{ title }}</h2>
        </div>

        <!-- Body -->
        <div class="px-12 py-2 flex-1">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="px-12 py-10 flex justify-end items-center gap-10">
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
