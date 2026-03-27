import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" (click)="onClose()">×</button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); display: flex; align-items: center;
      justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease;
    }
    .modal-content {
      background: #1E293B; border-radius: 16px; min-width: 400px;
      max-width: 90vw; max-height: 90vh; overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .modal-header h3 { margin: 0; color: white; font-size: 18px; font-weight: 600; }
    .close-btn {
      background: none; border: none; color: #94A3B8; font-size: 28px;
      cursor: pointer; padding: 0; line-height: 1;
    }
    .close-btn:hover { color: white; }
    .modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 12px; justify-content: flex-end; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }
}