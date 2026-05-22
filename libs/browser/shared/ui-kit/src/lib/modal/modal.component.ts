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
        [attr.aria-labelledby]="title ? titleHeadingId : null"
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
            <h3 [id]="titleHeadingId">{{ title }}</h3>
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
      z-index: 20000;
      animation: modalFadeIn 0.5s var(--ease-out-expo);
      background: rgba(2, 4, 8, 0.85);
      backdrop-filter: blur(25px) saturate(1.8);
    }

    @keyframes modalFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(25px); } }
    @keyframes modalSpringUp { 
      0% { opacity: 0; transform: translateY(60px) scale(0.95); } 
      100% { opacity: 1; transform: translateY(0) scale(1); } 
    }

    /* Modal Content Base — Cyber-Luxe */
    .modal-content {
      --modal-radius: var(--radius-xl);
      --modal-bg: rgba(13, 18, 30, 0.95);
      --modal-border: rgba(255, 255, 255, 0.1);
      --modal-accent: var(--brand);
      
      border-radius: var(--modal-radius); 
      min-width: 500px;
      max-width: 90vw; 
      max-height: 85vh; 
      overflow: hidden;
      background: var(--modal-bg);
      backdrop-filter: blur(45px);
      border: 1px solid var(--modal-border);
      box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
      animation: modalSpringUp 0.6s var(--transition-spring);
      position: relative;
      isolation: isolate;
    }

    /* Cinematic Noise Layer */
    .modal-content::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: -1;
    }

    .modal-color-danger { --modal-accent: var(--danger); }
    .modal-color-success { --modal-accent: var(--success); }
    .modal-color-warning { --modal-accent: var(--warning); }
    .modal-color-info { --modal-accent: var(--info); }
    
    .modal-shape-glass {
      background: rgba(10, 15, 25, 0.4);
      backdrop-filter: blur(60px) saturate(2);
      border-color: rgba(255, 255, 255, 0.12);
    }

    /* Header — Cyber-Luxe Menu Style */
    .modal-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 2.25rem 3rem;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #fff;
      font-family: var(--font-main);
      text-shadow: 0 0 20px var(--modal-accent);
    }

    .close-btn {
      width: 2.75rem; height: 2.75rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.4s var(--transition-spring);
    }

    .close-btn:hover {
      color: #fff;
      background: rgba(var(--brand-rgb), 0.2);
      border-color: var(--brand);
      transform: rotate(90deg);
      box-shadow: 0 0 20px rgba(var(--brand-rgb), 0.3);
    }

    .modal-body {
      padding: 3rem;
      max-height: 65vh;
      overflow-y: auto;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-primary);
    }

    .modal-footer {
      padding: 1.75rem 3rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Custom Scrollbar */
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-thumb { 
      background: rgba(255, 255, 255, 0.1); 
      border-radius: 10px; 
    }
    .modal-body::-webkit-scrollbar-thumb:hover { background: var(--modal-accent); }

    @media (prefers-reduced-motion: reduce) {
      .modal-overlay {
        animation: none;
      }
      .modal-content {
        animation: none;
      }
      .close-btn:hover {
        transform: none;
      }
    }
  `],
})
export class UiModalComponent {
  private static titleSeq = 0;
  /** Stable id for `aria-labelledby` on the dialog overlay. */
  readonly titleHeadingId = `ui-modal-title-${++UiModalComponent.titleSeq}`;

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
