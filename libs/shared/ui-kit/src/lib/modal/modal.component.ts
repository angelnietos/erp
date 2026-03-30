import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalVariant = 'default' | 'dark' | 'light' | 'glass' | 'gradient' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'soft' | 'outline' | 'transparent' | 'centered' | 'fullscreen';

@Component({
  selector: 'ui-josanz-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div 
        class="modal-overlay" 
        [class]="'overlay-' + variant" 
        (click)="onClose()"
        (keydown.escape)="onClose()"
        tabindex="0"
        aria-modal="true"
        role="dialog"
      >
        <div 
          class="modal-content" 
          [class]="'modal-' + variant" 
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          tabindex="0"
        >
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" (click)="onClose()" aria-label="Close modal">×</button>
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
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center;
      justify-content: center; z-index: 1000; 
      animation: modalFadeIn 0.3s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .overlay-default { background: rgba(0, 0, 0, 0.7); }
    .overlay-dark { background: rgba(0, 0, 0, 0.9); }
    .overlay-glass { background: rgba(15, 23, 42, 0.3); }

    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { 
      from { opacity: 0; transform: translateY(20px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }

    /* Modal Content Base */
    .modal-content {
      border-radius: 12px; 
      min-width: 480px;
      max-width: 90vw; 
      max-height: 90vh; 
      overflow: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    .modal-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 1.5rem 2rem;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--border-soft);
    }

    .modal-header h3 { 
      margin: 0; 
      font-size: 1.25rem; 
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fff;
      font-family: var(--font-display);
    }

    .close-btn {
      background: none; 
      border: none; 
      font-size: 2rem;
      cursor: pointer; 
      padding: 0; 
      line-height: 1;
      color: var(--text-muted);
      transition: all 0.3s ease;
    }
    
    .close-btn:hover {
      color: var(--brand);
      transform: rotate(90deg);
    }

    .modal-body { 
      padding: 2rem; 
      max-height: 60vh; 
      overflow-y: auto; 
    }

    .modal-footer { 
      padding: 1.5rem 2rem; 
      display: flex; 
      gap: 1rem; 
      justify-content: flex-end; 
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid var(--border-soft);
    }

    /* Variants */
    .modal-dark { background: #000; border-color: #222; }
    .modal-glass { 
      background: rgba(15, 23, 42, 0.8); 
      backdrop-filter: blur(20px); 
    }
    .modal-primary { border-top: 4px solid var(--brand); }
    .modal-danger { border-top: 4px solid var(--danger); }
    .modal-success { border-top: 4px solid var(--success); }
    .modal-warning { border-top: 4px solid var(--warning); }
    .modal-info { border-top: 4px solid var(--info); }

    /* Additional variants */
    .modal-soft {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-outline {
      background: transparent;
      border: 2px solid var(--border-soft);
    }

    .modal-transparent {
      background: transparent;
      box-shadow: none;
    }

    .modal-centered {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-fullscreen {
      width: 100vw;
      height: 100vh;
      max-width: 100%;
      border-radius: 0;
      margin: 0;
    }

    /* Custom Scrollbar for Modal Body */
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 3px; }
    .modal-body::-webkit-scrollbar-thumb:hover { background: var(--brand); }
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
