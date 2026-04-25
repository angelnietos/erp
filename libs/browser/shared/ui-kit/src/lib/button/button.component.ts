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
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      transition: all 0.4s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
      font-family: var(--font-display, inherit);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      white-space: nowrap;
      outline: none;
      box-sizing: border-box;
      border-radius: var(--radius-md, 12px);
      border: 1px solid transparent;
      overflow: hidden;
      user-select: none;
    }

    .btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .btn:hover::after { opacity: 1; }

    .btn:focus-visible {
      outline: 2px solid var(--ring-focus, #fff);
      outline-offset: 3px;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.8);
      transform: none !important;
    }

    .btn-sm { padding: 0.6rem 1.15rem; font-size: 0.65rem; gap: 8px; }
    .btn-md { padding: 0.8rem 1.75rem; font-size: 0.75rem; }
    .btn-lg { padding: 1rem 2.25rem; font-size: 0.85rem; }

    /* CORE COLOR TOKENS */
    .btn-color-primary { --btn-accent: var(--brand, #e60012); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-danger { --btn-accent: var(--danger, #ef4444); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-success { --btn-accent: var(--success, #10b981); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-warning { --btn-accent: var(--warning, #f59e0b); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-secondary { --btn-accent: var(--bg-tertiary, #334155); --btn-text: var(--text-primary); }
    .btn-color-info { --btn-accent: var(--info, #3b82f6); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-app { --btn-accent: var(--brand, #e60012); --btn-text: var(--text-on-brand, #fff); }
    .btn-color-default { --btn-accent: var(--surface-secondary, rgba(255, 255, 255, 0.1)); --btn-text: var(--text-primary); }

    /* SHAPES */
    .btn-shape-solid, .btn-shape-auto {
      background: linear-gradient(135deg, var(--btn-accent) 0%, color-mix(in srgb, var(--btn-accent), #000 15%) 100%);
      color: var(--btn-text);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 4px 15px -4px color-mix(in srgb, var(--btn-accent) 50%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .btn-shape-solid:hover, .btn-shape-auto:hover {
       transform: translateY(-2px);
       box-shadow: 
         0 12px 24px -8px color-mix(in srgb, var(--btn-accent) 60%, transparent),
         0 0 20px color-mix(in srgb, var(--btn-accent) 30%, transparent);
       filter: brightness(1.1);
    }

    .btn-shape-glass {
      background: color-mix(in srgb, var(--btn-accent) 12%, transparent);
      color: #fff;
      border: 1px solid color-mix(in srgb, var(--btn-accent) 30%, rgba(255,255,255,0.1));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    }
    .btn-shape-glass:hover {
      background: color-mix(in srgb, var(--btn-accent) 22%, transparent);
      border-color: var(--btn-accent);
      transform: translateY(-2px);
      box-shadow: 0 0 20px -5px var(--btn-accent);
    }

    .btn-shape-outline {
      background: transparent;
      color: var(--btn-accent);
      border: 2px solid var(--btn-accent);
    }
    .btn-shape-outline:hover {
      background: color-mix(in srgb, var(--btn-accent) 8%, transparent);
      border-color: var(--btn-accent);
      color: var(--btn-accent);
      box-shadow: 0 0 25px -5px color-mix(in srgb, var(--btn-accent) 40%, transparent);
    }

    .btn-shape-ghost {
      background: transparent;
      color: var(--btn-accent);
    }
    .btn-shape-ghost:hover {
      background: color-mix(in srgb, var(--btn-accent) 12%, transparent);
      color: var(--btn-accent);
      filter: brightness(1.2);
    }

    .btn-shape-link {
        text-decoration: underline; text-underline-offset: 4px;
        color: var(--btn-accent); background: transparent; padding: 0;
    }

    .btn-icon { width: 1.25rem; height: 1.25rem; transition: transform 0.3s; }
    .btn:hover .btn-icon { transform: scale(1.1); }

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

    :host-context(html[data-erp-tenant='babooni']) .btn-shape-ghost {
      color: var(--text-muted);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .btn-shape-ghost:hover {
      background: color-mix(in srgb, var(--brand) 6%, transparent);
      color: var(--brand);
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
