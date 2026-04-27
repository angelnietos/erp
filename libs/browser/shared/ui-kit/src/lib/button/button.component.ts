import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'app' | 'default';
export type ButtonShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'ghost' | 'neumorphic' | 'gradient' | 'soft' | 'link';
export type ButtonVariant = string;
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      [type]="type" 
      class="btn"
      [attr.aria-label]="ariaLabel ?? null"
      [attr.title]="title ?? null"
      [attr.aria-busy]="loading ? true : null"
      [class.btn-sm]="size === 'sm'"
      [class.btn-md]="size === 'md'"
      [class.btn-lg]="size === 'lg'"
      [class.btn-color-primary]="color === 'primary'"
      [class.btn-color-danger]="color === 'danger'"
      [class.btn-color-success]="color === 'success'"
      [class.btn-color-warning]="color === 'warning'"
      [class.btn-color-secondary]="color === 'secondary'"
      [class.btn-color-info]="color === 'info'"
      [class.btn-color-app]="color === 'app'"
      [class.btn-color-default]="color === 'default'"
      [class.btn-shape-solid]="shape === 'solid' || shape === 'auto'"
      [class.btn-shape-glass]="shape === 'glass'"
      [class.btn-shape-outline]="shape === 'outline'"
      [class.btn-shape-ghost]="shape === 'ghost'"
      [class.btn-shape-link]="shape === 'link'"
      [class.btn-auto-overrides]="shape === 'auto'"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        <ng-content></ng-content>
        @if (getIconName()) { 
          <lucide-icon [name]="getIconName()!" class="btn-icon" aria-hidden="true"></lucide-icon> 
        }
      }
    </button>
  `,
  styles: [`
    .btn {
      position: relative;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      transition: all 0.4s var(--transition-spring);
      font-family: var(--font-display, inherit);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      white-space: nowrap;
      outline: none;
      box-sizing: border-box;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      overflow: hidden;
      user-select: none;
      isolation: isolate;
    }

    /* Physical Feel Layer */
    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1;
    }

    .btn:hover::before { opacity: 1; }
    
    .btn:active {
      transform: scale(0.96) translateY(2px);
      filter: brightness(0.9);
    }

    .btn-sm { padding: 0.75rem 1.5rem; font-size: 0.7rem; }
    .btn-md { padding: 1rem 2rem; font-size: 0.75rem; }
    .btn-lg { padding: 1.25rem 3rem; font-size: 0.85rem; }

    /* CORE COLOR TOKENS — Vibrant Nintendo/Ubisoft Palette */
    .btn-color-primary, .btn-color-app { 
      --btn-accent: var(--brand); 
      background: linear-gradient(135deg, #ff0055 0%, var(--brand) 100%);
      color: #fff;
      box-shadow: 0 4px 15px var(--brand-ambient-strong), inset 0 1px 0 rgba(255,255,255,0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .btn-color-secondary {
      --btn-accent: var(--switch-blue, #00beef);
      background: linear-gradient(135deg, #00d4ff 0%, var(--switch-blue) 100%);
      color: #fff;
    }

    .btn-color-danger { 
      --btn-accent: var(--danger); 
      background: linear-gradient(135deg, #ff5e6c 0%, var(--danger) 100%);
      color: #fff;
    }

    .btn-color-success { 
      --btn-accent: var(--success); 
      background: linear-gradient(135deg, #00ffaa 0%, #10b981 100%);
      color: #013220; /* Deep green for contrast */
      font-weight: 900;
    }

    .btn-color-info {
      --btn-accent: var(--info);
      background: linear-gradient(135deg, #3fc1ff 0%, var(--info) 100%);
      color: #fff;
    }

    .btn-color-default { 
      --btn-accent: rgba(255, 255, 255, 0.1); 
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .btn-shape-solid:hover, .btn-shape-auto:hover {
       transform: translateY(-4px);
       box-shadow: 0 15px 30px var(--brand-ambient-strong), 0 0 20px var(--brand-glow);
       filter: brightness(1.2) saturate(1.2);
    }

    .btn-shape-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .btn-shape-glass:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--brand);
      box-shadow: 0 0 20px var(--brand-ambient-strong);
      transform: translateY(-4px);
    }

    .btn-shape-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
    }
    .btn-shape-ghost:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .btn-icon { width: 1.2rem; height: 1.2rem; transition: transform 0.4s var(--transition-spring); position: relative; z-index: 2; }
    .btn:hover .btn-icon { transform: scale(1.2) rotate(5deg); color: inherit; }

    .spinner {
      width: 1.25rem; height: 1.25rem;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: rotate 0.8s infinite linear;
    }
    @keyframes rotate { to { transform: rotate(360deg); } }

    :host-context(html[data-erp-tenant='babooni']) .btn {
      text-transform: none;
      letter-spacing: 0.02em;
      font-weight: 600;
      border-radius: 10px;
    }
    
    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-solid,
    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-auto {
      background: #0a0a0a;
      color: #ffffff;
      border: 1px solid #111111;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-solid:hover,
    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-auto:hover {
      background: #1a1a1a;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-shape-ghost:not(.btn-color-danger) {
      /* Sustituye el gris fijo: icono alineado con texto + marca según tema. */
      color: color-mix(in srgb, var(--text-primary) 70%, var(--brand) 30%);
      background: color-mix(in srgb, var(--brand) 4%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-shape-ghost:not(.btn-color-danger):hover {
      background: color-mix(in srgb, var(--brand) 10%, transparent);
      color: var(--brand);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-color-danger.btn-shape-ghost {
      color: color-mix(in srgb, var(--text-primary) 50%, var(--danger) 50%);
      background: color-mix(in srgb, var(--danger) 4%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-color-danger.btn-shape-ghost:hover {
      color: #fff;
      background: color-mix(in srgb, var(--danger) 16%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      .btn {
        transition-duration: 0.15s;
      }
      .btn:hover::after {
        opacity: 0;
      }
      .btn-shape-solid:hover,
      .btn-shape-auto:hover,
      .btn-shape-glass:hover {
        transform: none;
      }
      .btn:hover .btn-icon {
        transform: none;
      }
    }
  `],
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  /** Nombre accesible del botón nativo (p. ej. solo icono). */
  @Input({ alias: 'aria-label' }) ariaLabel: string | null | undefined = undefined;
  /** Tooltip nativo del botón. */
  @Input() title: string | null | undefined = undefined;
  @Input() icon: string | { name: string } = '';
  
  @Input() color: ButtonColor = 'app';
  @Input() shape: ButtonShape = 'auto';

  // Backwards compatibility layer mapping legacy 'variant' attributes to the new Color/Shape architecture
  @Input() set variant(val: string) {
    if (['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'app', 'default'].includes(val)) {
      this.color = val as ButtonColor;
      this.shape = 'auto'; // Will inherit shape natively from active Theme
    } else if (['glass', 'outline', 'ghost', 'gradient', 'soft', 'link', 'flat', 'neumorphic', 'solid'].includes(val)) {
      this.shape = val as ButtonShape;
      // Keep existing color or default
    } else if (val.startsWith('outline-')) {
      this.shape = 'outline';
      this.color = val.split('-')[1] as ButtonColor;
    } else {
      this.color = 'default';
      this.shape = 'auto';
    }
  }

  @Output() clicked = new EventEmitter<Event>();

  getIconName(): string | undefined {
    if (!this.icon) return undefined;
    if (typeof this.icon === 'string') return this.icon;
    return this.icon.name || undefined;
  }
}
