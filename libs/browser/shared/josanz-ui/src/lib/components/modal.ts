import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[1000] flex items-center justify-center bg-[#000000]/80 p-4 animate-in fade-in duration-300">
      <div class="bg-white rounded-[8px] shadow-[0px_10px_24px_rgba(97,97,97,0.3)] w-full max-w-[712px] max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
        
        <!-- Close Button -->
        <div class="absolute top-6 right-6 z-10">
          <button (click)="onClose()" class="text-[#1A1A1A] hover:opacity-70 transition-opacity p-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <!-- Header -->
          <div class="px-12 pt-12 pb-6">
            <h2 class="text-[32px] font-bold text-[#1A1A1A] tracking-tight">{{ title }}</h2>
          </div>

          <!-- Body -->
          <div class="px-12 pb-6">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer (Sticky at bottom) -->
        <div class="px-12 py-10 flex justify-center items-center gap-6 border-t border-gray-50 bg-white">
          <ng-content select="[footer-actions]"></ng-content>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
