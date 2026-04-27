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
      [attr.aria-describedby]="hint ? hintId : null"
      [attr.title]="title ?? null"
      [attr.aria-busy]="loading ? 'true' : null"
      [attr.aria-pressed]="pressed ?? null"
      [attr.role]="role ?? null"
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
      (keydown.enter)="handleKeyDown($event)"
      (keydown.space)="handleKeyDown($event)"
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
    @if (hint) {
      <span [id]="hintId" class="sr-only">{{ hint }}</span>
    }
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
       border-radius: var(--radius-lg);
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
      outline: 2px solid var(--ring-focus);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--ring-focus) 25%, transparent);
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.8);
      transform: none !important;
    }

    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.7rem; gap: 0.375rem; min-height: var(--tap-target-min); }
    .btn-md { padding: 0.5rem 1rem; font-size: 0.8rem; min-height: var(--tap-target-min); }
    .btn-lg { padding: 0.625rem 1.25rem; font-size: 0.85rem; min-height: calc(var(--tap-target-min) + 0.25rem); }

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
      border: 1px solid color-mix(in srgb, var(--btn-accent), rgba(255, 255, 255, 0.2) 20%);
      box-shadow:
        0 2px 8px -2px color-mix(in srgb, var(--btn-accent) 40%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .btn-shape-solid:hover, .btn-shape-auto:hover {
       transform: translateY(-1px);
       box-shadow:
         0 8px 20px -4px color-mix(in srgb, var(--btn-accent) 50%, transparent),
         0 0 15px color-mix(in srgb, var(--btn-accent) 20%, transparent),
         inset 0 1px 0 rgba(255,255,255,0.25);
       filter: brightness(1.05);
    }

    .btn-shape-glass {
      background: color-mix(in srgb, var(--btn-accent) 10%, rgba(255, 255, 255, 0.05));
      color: var(--btn-accent);
      border: 1px solid color-mix(in srgb, var(--btn-accent) 25%, rgba(255,255,255,0.1));
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 2px 12px -4px color-mix(in srgb, var(--btn-accent) 20%, transparent);
    }
    .btn-shape-glass:hover {
      background: color-mix(in srgb, var(--btn-accent) 15%, rgba(255, 255, 255, 0.08));
      border-color: var(--btn-accent);
      transform: translateY(-1px);
      box-shadow:
        0 4px 16px -2px color-mix(in srgb, var(--btn-accent) 30%, transparent),
        0 0 20px -5px var(--btn-accent);
      color: var(--btn-accent);
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

    .btn-icon { width: 1rem; height: 1rem; transition: transform 0.3s; }
    .btn:hover .btn-icon { transform: scale(1.05); }

    .spinner {
      width: 1.25rem; height: 1.25rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-right: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Loading state improvements */
    .btn[aria-busy="true"] {
      position: relative;
      color: transparent !important;
    }

    .btn[aria-busy="true"] .spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--btn-text);
    }

    .btn[aria-busy="true"] .btn-icon,
    .btn[aria-busy="true"] ng-content {
      opacity: 0;
    }

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

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Mobile touch improvements */
    @media (hover: none) and (pointer: coarse) {
      .btn {
        /* Remove hover effects on touch devices */
        transform: none !important;
      }

      .btn:active {
        transform: scale(0.98);
        transition-duration: 0.1s;
      }

      .btn-shape-solid:active,
      .btn-shape-auto:active,
      .btn-shape-glass:active {
        box-shadow:
          0 2px 8px -2px color-mix(in srgb, var(--btn-accent) 40%, transparent),
          inset 0 1px 0 rgba(255,255,255,0.1);
      }
    }

    /* Improve focus visibility on mobile */
    @media (max-width: 768px) {
      .btn:focus-visible {
        outline: 3px solid var(--ring-focus);
        outline-offset: 4px;
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
  /** Additional hint text for screen readers */
  @Input() hint: string | null = null;
  /** ARIA role for the button */
  @Input() role: string | null = null;
  /** ARIA pressed state for toggle buttons */
  @Input() pressed: boolean | null = null;
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

  /** Unique ID for hint text */
  hintId = `btn-hint-${Math.random().toString(36).substr(2, 9)}`;

  getIconName(): string | undefined {
    if (!this.icon) return undefined;
    if (typeof this.icon === 'string') return this.icon;
    return this.icon.name || undefined;
  }

  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      if (!this.disabled && !this.loading) {
        this.clicked.emit(event);
      }
    }
  }
}
