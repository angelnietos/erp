import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'app' | 'default';
export type ButtonShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'ghost' | 'neumorphic' | 'gradient' | 'soft' | 'link';
export type ButtonVariant = string;
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-josanz-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      [type]="type" 
      class="btn"
      [class]="'btn-color-' + color"
      [class]="'btn-shape-' + shape"
      [class]="'btn-' + size"
      [class.btn-auto-overrides]="shape === 'auto'"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        <ng-content></ng-content>
        @if (getIconName()) { 
          <lucide-icon [name]="getIconName()!" class="btn-icon"></lucide-icon> 
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
      gap: 10px;
      transition:
        transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
        filter 0.28s ease,
        border-color 0.28s ease;
      font-family: var(--font-display, inherit);
      text-transform: uppercase;
      letter-spacing: 0.09em;
      white-space: nowrap;
      outline: none;
      box-sizing: border-box;
      /* Inherit dynamic global shape from ThemeService-injected tokens */
      border-radius: var(--btn-radius, var(--radius-md, 8px));
    }

    .btn:focus-visible {
      outline: 2px solid var(--ring-focus, color-mix(in srgb, var(--btn-bg) 50%, transparent));
      outline-offset: 3px;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.6);
      transform: none !important;
      box-shadow: none !important;
    }

    .btn-sm { padding: 0.45rem 0.85rem; font-size: 0.58rem; gap: 6px; }
    .btn-md { padding: 0.55rem 1.15rem; font-size: 0.62rem; }
    .btn-lg { padding: 0.7rem 1.5rem; font-size: 0.68rem; }

    /* CORE COLOR TOKENS */
    .btn-color-primary { --btn-bg: var(--brand, #4338ca); --btn-border: var(--brand, #4338ca); --btn-text: #fff; --btn-glow: var(--brand-glow, rgba(67, 56, 202, 0.4)); }
    .btn-color-danger { --btn-bg: var(--danger, #ef4444); --btn-border: var(--danger, #ef4444); --btn-text: #fff; --btn-glow: rgba(239, 68, 68, 0.4); }
    .btn-color-success { --btn-bg: var(--success, #10b981); --btn-border: var(--success, #10b981); --btn-text: #fff; --btn-glow: rgba(16, 185, 129, 0.4); }
    .btn-color-warning { --btn-bg: var(--warning, #f59e0b); --btn-border: var(--warning, #f59e0b); --btn-text: #fff; --btn-glow: rgba(245, 158, 11, 0.4); }
    .btn-color-secondary { --btn-bg: var(--secondary, #64748b); --btn-border: var(--secondary, #64748b); --btn-text: #fff; --btn-glow: rgba(100, 116, 139, 0.4); }
    .btn-color-info { --btn-bg: var(--info, #3b82f6); --btn-border: var(--info, #3b82f6); --btn-text: #fff; --btn-glow: rgba(59, 130, 246, 0.4); }
    .btn-color-app { --btn-bg: var(--theme-primary, var(--brand, #4338ca)); --btn-border: var(--theme-primary, var(--brand, #4338ca)); --btn-text: #fff; --btn-glow: var(--brand-glow, rgba(67, 56, 202, 0.4)); }
    .btn-color-default { --btn-bg: var(--bg-tertiary, #1a1a1a); --btn-border: var(--border-soft, #333); --btn-text: var(--text-primary, #fff); --btn-glow: rgba(0,0,0,0.2); }

    /* EXPLICIT STRUCTURAL SHAPES */
    .btn-shape-auto {
      /* Reads tokens pushed by ThemeService.applyStructuralTokens() */
      background: var(--btn-bg);
      color: var(--btn-text);
      border: var(--btn-border-width, 1px) solid var(--btn-border);
      box-shadow: var(--btn-shadow, 0 4px 15px -4px var(--btn-glow));
      border-radius: var(--btn-radius, var(--radius-md, 8px));
    }
    .btn-shape-auto:hover:not(:disabled) {
      filter: brightness(1.12) saturate(1.05);
      transform: translateY(-2px);
      box-shadow: var(--btn-shadow, 0 8px 25px -5px var(--btn-glow));
    }

    .btn-shape-auto:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
      filter: brightness(1.05);
    }

    .btn-shape-solid {
      background: var(--btn-bg); color: var(--btn-text);
      border: 1px solid var(--btn-border);
      box-shadow: 0 4px 10px -2px var(--btn-glow);
    }
    .btn-shape-solid:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 8px 15px -4px var(--btn-glow); }
    .btn-shape-solid:active:not(:disabled) { transform: translateY(0) scale(0.98); }

    .btn-shape-glass {
      background: color-mix(in srgb, var(--btn-bg) 15%, transparent);
      color: var(--text-primary, #fff);
      border: 1px solid color-mix(in srgb, var(--btn-bg) 40%, transparent);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 4px 15px -5px rgba(0,0,0,0.3);
    }
    .btn-shape-glass:hover:not(:disabled) { background: color-mix(in srgb, var(--btn-bg) 35%, transparent); border-color: var(--btn-bg); color: #fff; transform: translateY(-2px); }
    .btn-shape-glass:active:not(:disabled) { transform: translateY(0) scale(0.99); }

    .btn-shape-outline {
      background: transparent; color: var(--btn-bg);
      border: 2px solid var(--btn-bg);
      box-shadow: none;
    }
    .btn-shape-outline:hover:not(:disabled) { background: var(--btn-bg); color: var(--btn-text); box-shadow: 0 0 15px var(--btn-glow); }

    .btn-shape-flat {
      background: var(--btn-bg); color: var(--btn-text);
      border: none; border-radius: 4px; box-shadow: none;
    }
    .btn-shape-flat:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }

    .btn-shape-ghost { background: transparent; color: var(--btn-bg); border: 1px solid transparent; box-shadow: none; }
    .btn-shape-ghost:hover:not(:disabled) { background: color-mix(in srgb, var(--btn-bg) 15%, transparent); }

    .btn-shape-neumorphic {
      background: var(--bg-primary, #050608);
      color: var(--btn-bg);
      border: 1px solid var(--border-soft, transparent);
      border-radius: 24px;
      box-shadow: -4px -4px 10px rgba(255,255,255,0.02), 4px 4px 10px rgba(0,0,0,0.5);
    }
    .btn-shape-neumorphic:active:not(:disabled) { box-shadow: inset -4px -4px 10px rgba(255,255,255,0.02), inset 4px 4px 10px rgba(0,0,0,0.5); }

    .btn-shape-soft {
      background: color-mix(in srgb, var(--btn-bg) 15%, transparent);
      color: var(--btn-bg);
      border: none;
    }
    .btn-shape-soft:hover:not(:disabled) { background: color-mix(in srgb, var(--btn-bg) 25%, transparent); }

    .btn-shape-gradient {
      background: linear-gradient(135deg, var(--btn-bg), color-mix(in srgb, var(--btn-bg) 20%, #000));
      color: #fff; border: none;
      box-shadow: 0 6px 20px -5px var(--btn-glow), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .btn-shape-gradient:hover:not(:disabled) { filter: brightness(1.15); box-shadow: 0 10px 25px -4px var(--btn-glow); transform: translateY(-2px); }

    .btn-shape-link {
      background: transparent; color: var(--btn-bg); border: none; padding: 0; box-shadow: none;
      text-decoration: underline; text-underline-offset: 4px; border-radius: 0;
    }
    .btn-shape-link:hover:not(:disabled) { filter: brightness(1.2); }

    .btn-icon { width: 1.15rem; height: 1.15rem; }

    .spinner {
      width: 1.25rem; height: 1.25rem;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: rotate 0.8s infinite linear;
    }
    @keyframes rotate { to { transform: rotate(360deg); } }
  `],
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
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
