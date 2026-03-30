import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalVariant = 'default' | 'dark' | 'light' | 'glass' | 'gradient' | 'primary' | 'danger' | 'success' | 'warning' | 'info';

@Component({
  selector: 'ui-josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" [class]="'overlay-' + variant" (click)="onClose()">
        <div class="modal-content" [class]="'modal-' + variant" (click)="$event.stopPropagation()">
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
    /* Overlay Variants */
    .overlay-default { background: rgba(0,0,0,0.7); }
    .overlay-dark { background: rgba(0,0,0,0.85); }
    .overlay-light { background: rgba(0,0,0,0.4); }
    .overlay-glass { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
    .overlay-gradient { background: rgba(0,0,0,0.6); }
    .overlay-primary { background: rgba(79, 70, 229, 0.7); }
    .overlay-danger { background: rgba(239, 68, 68, 0.7); }
    .overlay-success { background: rgba(16, 185, 129, 0.7); }
    .overlay-warning { background: rgba(245, 158, 11, 0.7); }
    .overlay-info { background: rgba(14, 165, 233, 0.7); }

    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center;
      justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease;
    }

    /* Modal Variants */
    .modal-default {
      background: var(--theme-surface, #FFFFFF);
      color: var(--theme-text, #1E293B);
    }
    .modal-default .modal-header { border-bottom: 1px solid var(--theme-border, #E2E8F0); }
    .modal-default .modal-header h3 { color: var(--theme-text, #1E293B); }
    .modal-default .close-btn { color: var(--theme-text-muted, #64748B); }
    .modal-default .close-btn:hover { color: var(--theme-text, #1E293B); }
    .modal-default .modal-footer { border-top: 1px solid var(--theme-border, #E2E8F0); background: var(--theme-background, #F8FAFC); }

    .modal-dark {
      background: #1E293B;
      color: white;
    }
    .modal-dark .modal-header { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .modal-dark .modal-header h3 { color: white; }
    .modal-dark .close-btn { color: #94A3B8; }
    .modal-dark .close-btn:hover { color: white; }
    .modal-dark .modal-footer { border-top: 1px solid rgba(255,255,255,0.1); background: #0F172A; }

    .modal-light {
      background: #FFFFFF;
      color: #1E293B;
    }
    .modal-light .modal-header { border-bottom: 1px solid #E2E8F0; }
    .modal-light .modal-header h3 { color: #1E293B; }
    .modal-light .close-btn { color: #64748B; }
    .modal-light .close-btn:hover { color: #1E293B; }
    .modal-light .modal-footer { border-top: 1px solid #E2E8F0; background: #F8FAFC; }

    .modal-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
    }
    .modal-glass .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-glass .modal-header h3 { color: white; }
    .modal-glass .close-btn { color: rgba(255,255,255,0.6); }
    .modal-glass .close-btn:hover { color: white; }
    .modal-glass .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-gradient {
      background: linear-gradient(135deg, #1E293B, #334155);
      color: white;
    }
    .modal-gradient .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-gradient .modal-header h3 { color: white; }
    .modal-gradient .close-btn { color: #94A3B8; }
    .modal-gradient .close-btn:hover { color: white; }
    .modal-gradient .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); }

    .modal-primary {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }
    .modal-primary .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-primary .modal-header h3 { color: white; }
    .modal-primary .close-btn { color: rgba(255,255,255,0.7); }
    .modal-primary .close-btn:hover { color: white; }
    .modal-primary .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-danger {
      background: #DC2626;
      color: white;
    }
    .modal-danger .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-danger .modal-header h3 { color: white; }
    .modal-danger .close-btn { color: rgba(255,255,255,0.7); }
    .modal-danger .close-btn:hover { color: white; }
    .modal-danger .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-success {
      background: #059669;
      color: white;
    }
    .modal-success .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-success .modal-header h3 { color: white; }
    .modal-success .close-btn { color: rgba(255,255,255,0.7); }
    .modal-success .close-btn:hover { color: white; }
    .modal-success .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-warning {
      background: #D97706;
      color: white;
    }
    .modal-warning .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-warning .modal-header h3 { color: white; }
    .modal-warning .close-btn { color: rgba(255,255,255,0.7); }
    .modal-warning .close-btn:hover { color: white; }
    .modal-warning .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-info {
      background: #0284C7;
      color: white;
    }
    .modal-info .modal-header { border-bottom: 1px solid rgba(255,255,255,0.2); }
    .modal-info .modal-header h3 { color: white; }
    .modal-info .close-btn { color: rgba(255,255,255,0.7); }
    .modal-info .close-btn:hover { color: white; }
    .modal-info .modal-footer { border-top: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.1); }

    .modal-content {
      border-radius: 16px; min-width: 400px;
      max-width: 90vw; max-height: 90vh; overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px;
    }
    .modal-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .close-btn {
      background: none; border: none; font-size: 28px;
      cursor: pointer; padding: 0; line-height: 1;
    }
    .modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
    .modal-footer { padding: 16px 24px; display: flex; gap: 12px; justify-content: flex-end; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Input() variant: ModalVariant = 'default';
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }
}
