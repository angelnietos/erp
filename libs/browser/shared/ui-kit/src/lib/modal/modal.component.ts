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
          [class]="
            'modal-content modal-shape-' +
            shape +
            ' modal-color-' +
            color +
            (shape === 'auto' ? ' modal-auto-overrides' : '')
          "
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          tabindex="0"
        >
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" (click)="onClose()" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body text-friendly">
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
      justify-content: center;
      /* Por encima de cabecera shell (≈5k) y toasts (3k) */
      z-index: 20000;
      animation: modalFadeIn 0.35s ease-out;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(12px) saturate(1.2);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);
    }

    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { 
      from { opacity: 0; transform: translateY(30px) scale(0.96); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }

    /* Modal Content Base */
    .modal-content {
      --modal-radius: 28px;
      --modal-bg: var(--bg-secondary, #111);
      --modal-border: var(--border-soft, rgba(255, 255, 255, 0.1));
      --modal-border-width: 1px;
      --modal-shadow: 0 32px 80px rgba(0, 0, 0, 0.7);
      --modal-header-color: var(--text-primary, #fff);
      --modal-accent: var(--brand, #3b82f6);
      
      border-radius: var(--modal-radius); 
      min-width: 520px;
      max-width: 95vw; 
      max-height: 92vh; 
      overflow: hidden;
      background: var(--modal-bg);
      border: var(--modal-border-width) solid var(--modal-border);
      box-shadow:
        var(--modal-shadow),
        0 0 0 1px color-mix(in srgb, var(--modal-accent) 15%, transparent),
        0 0 40px -10px color-mix(in srgb, var(--modal-accent) 25%, transparent);
      animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    /* COLORS & GLOWS */
    .modal-color-default { --modal-accent: var(--brand); }
    .modal-color-primary { --modal-accent: var(--brand); }
    .modal-color-danger { --modal-accent: var(--danger, #ef4444); }
    .modal-color-success { --modal-accent: var(--success, #10b981); }
    .modal-color-warning { --modal-accent: var(--warning, #f59e0b); }
    .modal-color-info { --modal-accent: var(--info, #3b82f6); }

    .modal-color-primary, .modal-color-danger, .modal-color-success, .modal-color-warning, .modal-color-info {
       --modal-header-color: var(--modal-accent);
    }
    
    .modal-shape-glass {
      --modal-bg: color-mix(in srgb, var(--bg-secondary, #111) 68%, transparent);
      backdrop-filter: blur(40px) saturate(1.8); -webkit-backdrop-filter: blur(40px) saturate(1.8);
      --modal-border: color-mix(in srgb, var(--modal-accent) 30%, rgba(255,255,255,0.1));
      box-shadow: 
        var(--modal-shadow),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
        0 0 50px -15px color-mix(in srgb, var(--modal-accent) 40%, transparent);
    }

    .modal-shape-solid { --modal-radius: 16px; --modal-border-width: 2px; }

    /* Header & Action Refinement */
    .modal-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 1.75rem 2.5rem;
      background: linear-gradient(to bottom, color-mix(in srgb, var(--modal-accent) 8%, transparent), transparent);
      border-bottom: 1px solid var(--modal-border);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--modal-header-color);
      font-family: inherit;
      filter: drop-shadow(0 0 8px color-mix(in srgb, var(--modal-accent) 40%, transparent));
    }

    .close-btn {
      width: 2.5rem; height: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--modal-border);
      border-radius: 12px;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted, #888);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .close-btn:hover {
      color: #fff;
      background: color-mix(in srgb, var(--modal-accent) 20%, transparent);
      border-color: var(--modal-accent);
      transform: rotate(90deg) scale(1.1);
      box-shadow: 0 0 20px -5px var(--modal-accent);
    }

    .modal-body {
      padding: 2rem 2.5rem;
      max-height: 70vh;
      overflow-y: auto;
      scrollbar-gutter: stable;
    }

    .modal-footer {
      padding: 1.5rem 2.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid var(--modal-border);
    }

    /* Form Specific Spacing inside Modal Body */
    ::ng-content .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    ::ng-content .form-section { margin-bottom: 2.5rem; }
    ::ng-content .section-title { 
      font-size: 0.75rem; font-weight: 900; color: var(--modal-accent);
      text-transform: uppercase; letter-spacing: 0.2em;
      margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem;
    }
    ::ng-content .section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, var(--modal-border), transparent); }

    /* Custom Scrollbar */
    .modal-body::-webkit-scrollbar { width: 4px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { 
      background: var(--modal-border); 
      border-radius: 10px; 
      transition: background 0.3s;
    }
    .modal-body::-webkit-scrollbar-thumb:hover { background: var(--modal-accent); }
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
