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
      animation: modalFadeIn 0.4s var(--ease-out-expo);
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(20px) saturate(1.5);
    }

    @keyframes modalFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(20px); } }
    @keyframes modalSpringUp { 
      0% { opacity: 0; transform: translateY(100px) scale(0.9) rotateX(10deg); } 
      100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); } 
    }

    /* Modal Content Base — Rockstar + Nintendo */
    .modal-content {
      --modal-radius: var(--radius-lg);
      --modal-bg: var(--bg-secondary);
      --modal-border: var(--border-soft);
      --modal-accent: var(--brand);
      
      border-radius: var(--modal-radius); 
      min-width: 580px;
      max-width: 95vw; 
      max-height: 90vh; 
      overflow: hidden;
      background: var(--modal-bg);
      border: 1px solid var(--modal-border);
      box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
      animation: modalSpringUp 0.6s var(--transition-spring);
      position: relative;
      isolation: isolate;
    }

    /* Cinematic Noise Layer */
    .modal-content::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.05;
      pointer-events: none;
      z-index: -1;
    }

    /* Scanline Effect on Header */
    .modal-header::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
      background-size: 100% 4px, 3px 100%;
      pointer-events: none;
      opacity: 0.3;
      z-index: 5;
    }

    /* Nintendo Switch Style Side Accent */
    .modal-content::after {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 6px;
      background: var(--modal-accent);
      box-shadow: 0 0 30px var(--modal-accent);
      z-index: 10;
      animation: modalIndicatorPulse 3s infinite;
    }

    @keyframes modalIndicatorPulse {
      0%, 100% { opacity: 1; filter: brightness(1); }
      50% { opacity: 0.6; filter: brightness(1.5); }
    }

    .modal-color-danger { --modal-accent: var(--danger); }
    .modal-color-success { --modal-accent: var(--success); }
    .modal-color-warning { --modal-accent: var(--warning); }
    .modal-color-info { --modal-accent: var(--info); }
    
    .modal-shape-glass {
      background: rgba(10, 10, 15, 0.4);
      backdrop-filter: blur(60px) saturate(2.5);
      border-color: rgba(255, 255, 255, 0.08);
    }

    /* Header — Console Menu Style */
    .modal-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 3rem;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      color: #fff;
      font-family: var(--font-gaming);
      text-shadow: 0 0 20px var(--modal-accent);
    }

    .close-btn {
      width: 3rem; height: 3rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.4s var(--transition-spring);
    }

    .close-btn:hover {
      color: #fff;
      background: var(--brand);
      transform: rotate(90deg) scale(1.1);
      box-shadow: 0 0 30px var(--brand-glow);
    }

    .close-btn:focus-visible {
      outline: none;
      color: var(--text-primary, #fff);
      border-color: var(--modal-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--modal-accent) 45%, transparent);
    }

    .modal-body {
      padding: 3rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 2rem 3rem;
      display: flex;
      justify-content: flex-end;
      gap: 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.03);
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
