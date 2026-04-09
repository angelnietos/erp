import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalColor = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info';
export type ModalShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'neumorphic' | 'minimal' | 'fullscreen';
export type ModalVariant = string;

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div 
        class="modal-overlay" 
        [class]="'overlay-shape-' + shape"
        (click)="onClose()"
        (keydown.escape)="onClose()"
        tabindex="0"
        aria-modal="true"
        role="dialog"
      >
        <div 
          class="modal-content" 
          [class]="'modal-shape-' + shape" 
          [class]="'modal-color-' + color" 
          [class.modal-auto-overrides]="shape === 'auto'"
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
    /* Overlay Base */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center;
      justify-content: center; z-index: 1000; 
      animation: modalFadeIn 0.3s ease;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(var(--variant-blur, 16px)) saturate(1.1);
      -webkit-backdrop-filter: blur(var(--variant-blur, 16px)) saturate(1.1);
    }

    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { 
      from { opacity: 0; transform: translateY(20px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }

    /* Modal Content Base - Integrates with DOM Theme Mixins */
    .modal-content {
      --modal-radius: var(--radius-xl, 28px);
      --modal-bg: var(--bg-secondary);
      --modal-border: var(--border-soft);
      --modal-border-width: 1px;
      --modal-shadow: var(--shadow-lg, 0 24px 64px rgba(0, 0, 0, 0.55));
      --modal-header-color: var(--text-primary);
      
      /* Read JS-injected tokens — these override the defaults above */
      border-radius: var(--modal-radius); 
      min-width: 480px;
      max-width: 90vw; 
      max-height: 90vh; 
      overflow: hidden;
      background: var(--modal-bg);
      border: var(--modal-border-width) solid var(--modal-border);
      box-shadow:
        var(--modal-shadow),
        0 0 0 1px color-mix(in srgb, var(--brand) 12%, transparent),
        var(--shadow-inset-shine, none);
      animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    /* shape-auto: reads ThemeService-injected tokens directly */
    .modal-shape-auto {
      border-radius: var(--modal-radius);
      background: var(--modal-bg);
      border-width: var(--modal-border-width);
      box-shadow: var(--modal-shadow), 0 0 0 1px color-mix(in srgb, var(--brand) 12%, transparent);
    }
    .modal-color-default { --modal-border: var(--border-soft); }
    .modal-color-primary { border-top: 4px solid var(--brand); --modal-header-color: var(--brand); }
    .modal-color-danger { border-top: 4px solid var(--danger); --modal-header-color: var(--danger); }
    .modal-color-success { border-top: 4px solid var(--success); --modal-header-color: var(--success); }
    .modal-color-warning { border-top: 4px solid var(--warning); --modal-header-color: var(--warning); }
    .modal-color-info { border-top: 4px solid var(--info); --modal-header-color: var(--info); }

    /* STRUCTURAL SHAPES */
    .modal-shape-auto {
      /* Relies on the default native injection from HTML tokens */
    }
    
    .modal-shape-solid {
      --modal-bg: var(--bg-secondary);
      --modal-radius: 12px;
      --modal-border: var(--border-soft);
      --modal-shadow: 0 16px 40px rgba(0,0,0,0.4);
    }

    .modal-shape-glass {
      --modal-bg: color-mix(in srgb, var(--bg-secondary) 75%, transparent);
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      --modal-border: var(--border-vibrant);
    }
    .overlay-shape-glass {
      background: color-mix(in srgb, var(--bg-primary) 40%, transparent);
    }

    .modal-shape-flat {
      --modal-bg: var(--bg-tertiary);
      --modal-border-width: 0px;
      --modal-radius: 4px;
      --modal-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .modal-shape-outline {
      --modal-bg: var(--bg-primary);
      --modal-border-width: 2px;
      --modal-border: var(--border-soft);
      --modal-shadow: none;
    }

    .modal-shape-neumorphic {
      --modal-bg: var(--bg-primary);
      --modal-border-width: 0px;
      --modal-radius: 30px;
      --modal-shadow: -12px -12px 30px rgba(255,255,255,0.02), 12px 12px 30px rgba(0,0,0,0.6);
    }

    .modal-shape-minimal {
      --modal-bg: var(--bg-primary);
      --modal-border-width: 0px;
      --modal-radius: 0px;
      --modal-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .modal-shape-fullscreen {
      width: 100vw; height: 100vh; max-width: 100%; border-radius: 0; margin: 0;
      border: none;
    }

    /* Modal Innards */
    .modal-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 1.5rem 2rem;
      background: color-mix(in srgb, var(--bg-primary) 50%, transparent);
      border-bottom: 1px solid var(--border-soft);
    }

    .modal-header h3 { 
      margin: 0; 
      font-size: 1.15rem; 
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--modal-header-color);
      font-family: var(--font-display);
    }

    .close-btn {
      background: none; border: none; font-size: 2rem;
      cursor: pointer; padding: 0; line-height: 1;
      color: var(--text-muted); transition: all 0.3s ease;
    }
    
    .close-btn:hover { color: var(--brand); transform: rotate(90deg); }

    .modal-body { padding: 2rem; max-height: 60vh; overflow-y: auto; }

    .modal-footer { 
      padding: 1.5rem 2rem; display: flex; gap: 1rem; 
      justify-content: flex-end; 
      background: color-mix(in srgb, var(--bg-primary) 60%, transparent);
      border-top: 1px solid var(--border-soft);
    }

    /* Custom Scrollbar for Modal Body */
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: 3px; }
    .modal-body::-webkit-scrollbar-thumb:hover { background: var(--brand); }
  `],
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;

  @Input() color: ModalColor = 'default';
  @Input() shape: ModalShape = 'auto';

  // Legacy parser
  @Input() set variant(val: string) {
    if (['primary', 'danger', 'success', 'warning', 'info', 'default'].includes(val)) {
      this.color = val as ModalColor;
      this.shape = 'auto';
    } else if (['glass', 'solid', 'flat', 'neumorphic', 'minimal', 'outline', 'fullscreen'].includes(val)) {
      this.shape = val as ModalShape;
    } else {
      this.color = 'default';
      this.shape = 'auto';
    }
  }

  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }
}
