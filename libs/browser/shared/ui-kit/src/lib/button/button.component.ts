import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '@josanz-erp/shared-data-access';

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
      [class.btn-compact]="actualDensity === 'compact'"
      [class.btn-wide]="actualDensity === 'wide'"
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
        @if (getIconName(); as iconName) {
          <lucide-icon
            [name]="iconName"
            class="btn-icon"
            [class.btn-icon-plus]="isAddIcon(iconName)"
            aria-hidden="true"
          ></lucide-icon>
        }
      }
    </button>
  `,
  styles: [`
    .btn {
      position: relative;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      transition: 
        transform 0.4s var(--transition-spring),
        filter 0.3s ease,
        box-shadow 0.4s var(--transition-spring),
        background-color 0.2s ease,
        border-color 0.2s ease;
      font-family: var(--font-main, inherit);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
      line-height: 1;
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

    .btn-sm { padding: 0.5rem 1rem; font-size: 0.7rem; }
    .btn-md { padding: 0.875rem 1.75rem; font-size: 0.75rem; }
    .btn-lg { padding: 1.25rem 2.5rem; font-size: 0.85rem; }

    /* Density Overrides */
    .btn-compact { 
      padding: 0.4rem 1rem !important; 
      font-size: 0.7rem !important;
      gap: 6px !important;
    }
    .btn-wide { 
      padding: 1.5rem 3.5rem !important; 
      font-size: 0.95rem !important;
      gap: 12px !important;
    }

    .btn-color-primary {
      background: linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 80%, black) 100%);
      color: #fff;
      box-shadow: 0 4px 15px var(--brand-ambient-strong), inset 0 1px 0 rgba(255,255,255,0.1);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* CTA de módulo (NUEVO …): mismo criterio que primary; --brand sigue al tema activo. */
    .btn-color-app.btn-shape-solid,
    .btn-color-app.btn-shape-auto {
      background: linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 80%, black) 100%);
      color: #fff;
      box-shadow: 0 4px 15px var(--brand-ambient-strong), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      border: 1px solid color-mix(in srgb, var(--brand) 25%, rgba(255, 255, 255, 0.08));
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
      color: #013220;
      font-weight: 900;
    }

    .btn-color-info {
      --btn-accent: var(--info);
      background: linear-gradient(135deg, #3fc1ff 0%, var(--info) 100%);
      color: #fff;
    }

    .btn-color-warning {
      --btn-accent: var(--warning);
      background: linear-gradient(135deg, #ffe08a 0%, var(--warning) 100%);
      color: #1a1200;
      font-weight: 800;
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
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .btn-shape-glass:hover {
      background: var(--brand-ambient-strong);
      border-color: var(--brand);
      box-shadow: 0 0 20px var(--brand-glow);
      transform: translateY(-4px);
    }

    .btn-color-primary.btn-shape-glass,
    .btn-color-app.btn-shape-glass {
      background: color-mix(in srgb, var(--brand) 26%, rgba(0, 0, 0, 0.3));
      border: 1px solid color-mix(in srgb, var(--brand) 42%, rgba(255, 255, 255, 0.14));
      color: #fff;
      box-shadow: 0 4px 22px -6px color-mix(in srgb, var(--brand) 45%, transparent);
    }
    .btn-color-primary.btn-shape-glass:hover,
    .btn-color-app.btn-shape-glass:hover {
      background: color-mix(in srgb, var(--brand) 38%, rgba(0, 0, 0, 0.2));
      border-color: var(--brand);
      box-shadow: 0 8px 28px -6px color-mix(in srgb, var(--brand) 55%, transparent);
    }

    .btn-color-success.btn-shape-glass {
      background: color-mix(in srgb, var(--success) 30%, rgba(0, 0, 0, 0.25));
      border: 1px solid color-mix(in srgb, var(--success) 48%, rgba(255, 255, 255, 0.12));
      color: #021910;
    }
    .btn-color-success.btn-shape-glass:hover {
      background: color-mix(in srgb, var(--success) 45%, rgba(0, 0, 0, 0.18));
      border-color: var(--success);
      box-shadow: 0 0 24px color-mix(in srgb, var(--success) 40%, transparent);
    }

    .btn-color-warning.btn-shape-glass {
      background: color-mix(in srgb, var(--warning) 34%, rgba(0, 0, 0, 0.2));
      border: 1px solid color-mix(in srgb, var(--warning) 52%, rgba(255, 255, 255, 0.1));
      color: #1f1600;
    }
    .btn-color-warning.btn-shape-glass:hover {
      background: color-mix(in srgb, var(--warning) 48%, rgba(0, 0, 0, 0.12));
      border-color: var(--warning);
      box-shadow: 0 0 22px color-mix(in srgb, var(--warning) 45%, transparent);
    }

    .btn-color-secondary.btn-shape-glass {
      background: color-mix(in srgb, var(--switch-blue, #00beef) 28%, rgba(0, 0, 0, 0.3));
      border: 1px solid color-mix(in srgb, var(--switch-blue) 50%, rgba(255, 255, 255, 0.12));
      color: #ecfeff;
    }
    .btn-color-secondary.btn-shape-glass:hover {
      background: color-mix(in srgb, var(--switch-blue) 40%, rgba(0, 0, 0, 0.22));
      border-color: var(--switch-blue);
      box-shadow: 0 0 22px color-mix(in srgb, var(--switch-blue) 35%, transparent);
    }

    .btn-color-danger.btn-shape-glass {
      background: color-mix(in srgb, var(--danger) 26%, rgba(0, 0, 0, 0.3));
      border: 1px solid color-mix(in srgb, var(--danger) 45%, rgba(255, 255, 255, 0.1));
      color: #fff;
    }
    .btn-color-danger.btn-shape-glass:hover {
      background: color-mix(in srgb, var(--danger) 40%, rgba(0, 0, 0, 0.2));
      border-color: var(--danger);
      box-shadow: 0 0 24px color-mix(in srgb, var(--danger) 40%, transparent);
    }

    .btn-shape-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
    }
    .btn-shape-ghost:hover {
      background: var(--brand-ambient);
      color: var(--brand);
      border-color: var(--brand-border-soft);
      transform: translateY(-2px);
    }

    .btn-icon {
      width: 1rem;
      height: 1rem;
      min-width: 1rem;
      min-height: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      transition: none;
      position: relative;
      z-index: 2;
      color: inherit;
    }
    .btn-sm .btn-icon {
      width: 0.95rem;
      height: 0.95rem;
      min-width: 0.95rem;
      min-height: 0.95rem;
    }
    .btn-lg .btn-icon {
      width: 1.1rem;
      height: 1.1rem;
      min-width: 1.1rem;
      min-height: 1.1rem;
    }
    .btn:hover .btn-icon { transform: none; color: inherit; }
    .btn-icon-plus,
    .btn:hover .btn-icon-plus {
      transform: none;
    }
    
    .btn-shape-ghost:hover .btn-icon {
      color: var(--brand);
      filter: none;
    }

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
      background: linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 72%, #0a0a0a) 100%);
      color: #fff;
      border: 1px solid color-mix(in srgb, var(--brand) 42%, rgba(255, 255, 255, 0.1));
      box-shadow:
        0 4px 18px color-mix(in srgb, var(--brand) 32%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-solid:hover,
    :host-context(html[data-erp-tenant='babooni']) .btn-color-app.btn-shape-auto:hover {
      background: linear-gradient(135deg, color-mix(in srgb, var(--brand) 95%, #fff) 0%, var(--brand) 100%);
      filter: brightness(1.05);
      transform: translateY(-1px);
      box-shadow: 0 6px 22px color-mix(in srgb, var(--brand) 38%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .btn-shape-ghost:not(.btn-color-danger) {
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
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() color: ButtonColor = 'primary';
  @Input() shape: ButtonShape = 'auto';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() ariaLabel?: string;
  @Input() title?: string;

  private _variant: ButtonVariant = '';
  @Input() set variant(val: string) {
    this._variant = val;
    if (['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'app', 'default'].includes(val)) {
      this.color = val as ButtonColor;
      this.shape = 'auto';
    } else if (['glass', 'outline', 'ghost', 'gradient', 'soft', 'link', 'flat', 'neumorphic', 'solid'].includes(val)) {
      this.shape = val as ButtonShape;
    } else if (val?.startsWith('outline-')) {
      this.shape = 'outline';
      const parts = val.split('-');
      if (parts.length > 1) this.color = parts[1] as ButtonColor;
    } else {
      // If it's not a known color or shape, treat it as an icon name (legacy)
      this.shape = 'auto';
    }
  }
  get variant(): string { return this._variant; }

  @Output() clicked = new EventEmitter<MouseEvent>();

  private themeService = inject(ThemeService);

  get actualDensity(): string {
    return this.themeService.currentDensity();
  }

  getIconName(): string | null {
    if (this.icon) return this.icon;
    // Legacy support: if variant is not a known structural keyword, use it as icon name
    if (this.variant && !['glass', 'solid', 'outline', 'ghost', 'link', 'primary', 'secondary', 'danger', 'success', 'warning', 'info', 'app', 'default'].includes(this.variant)) {
      return this.variant;
    }
    return null;
  }

  isAddIcon(iconName: string): boolean {
    const normalized = iconName.toLowerCase();
    return normalized === 'plus' || normalized.includes('plus');
  }
}
