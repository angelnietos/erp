import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'indigo' | 'teal' | 'orange' | 'pink' | 'rose' | 'violet' | 'fuchsia';
export type BadgeShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'neumorphic' | 'minimal' | 'ghost';
export type BadgeVariant = BadgeColor | BadgeShape | 'error' | 'secondary' | 'dark' | 'light' | 'app' | string;

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" 
      [class]="'badge-color-' + color"
      [class]="'badge-shape-' + shape"
      [class.badge-auto-overrides]="shape === 'auto'"
    >
      @if (color !== 'default') { <div class="dot"></div> }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.25rem 0.75rem;
      border-radius: var(--badge-radius, 100px);
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      font-family: var(--font-display);
      border: var(--badge-border-width, 1px) solid var(--badge-border, transparent);
      white-space: nowrap;
      transition:
        transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.25s ease,
        background 0.25s ease;
      background: var(--badge-bg, transparent);
      color: var(--badge-color, var(--text-primary));
      box-shadow: var(--badge-shadow, none);
    }
    
    .badge:hover {
      transform: scale(1.04) translateY(-1px);
      box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--badge-color, var(--brand)) 35%, transparent);
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    /* THEMATIC COLOR TOKENS */
    .badge-color-default { --badge-bg: var(--surface); --badge-color: var(--text-secondary); --badge-border: var(--border-soft); }
    .badge-color-primary { --badge-bg: var(--brand-ambient-strong, color-mix(in srgb, var(--brand) 15%, transparent)); --badge-color: var(--brand); --badge-border: color-mix(in srgb, var(--brand) 30%, transparent); }
    .badge-color-success { --badge-bg: rgba(16, 185, 129, 0.12); --badge-color: var(--success); --badge-border: rgba(16, 185, 129, 0.25); }
    .badge-color-warning { --badge-bg: rgba(245, 158, 11, 0.12); --badge-color: var(--warning); --badge-border: rgba(245, 158, 11, 0.25); }
    .badge-color-danger { --badge-bg: rgba(239, 68, 68, 0.12); --badge-color: var(--danger); --badge-border: rgba(239, 68, 68, 0.25); }
    .badge-color-info { --badge-bg: rgba(59, 130, 246, 0.12); --badge-color: var(--info); --badge-border: rgba(59, 130, 246, 0.25); }

    /* Extended Legacy Colors */
    .badge-color-purple { --badge-bg: rgba(168, 85, 247, 0.1); --badge-color: #a855f7; --badge-border: rgba(168, 85, 247, 0.2); }
    .badge-color-indigo { --badge-bg: rgba(99, 102, 241, 0.1); --badge-color: #6366f1; --badge-border: rgba(99, 102, 241, 0.2); }
    .badge-color-teal { --badge-bg: rgba(20, 184, 166, 0.1); --badge-color: #14b8a6; --badge-border: rgba(20, 184, 166, 0.2); }
    .badge-color-orange { --badge-bg: rgba(249, 115, 22, 0.1); --badge-color: #f97316; --badge-border: rgba(249, 115, 22, 0.2); }
    .badge-color-pink { --badge-bg: rgba(236, 72, 153, 0.1); --badge-color: #ec4899; --badge-border: rgba(236, 72, 153, 0.2); }
    .badge-color-rose { --badge-bg: rgba(244, 63, 94, 0.1); --badge-color: #f43f5e; --badge-border: rgba(244, 63, 94, 0.2); }
    .badge-color-violet { --badge-bg: rgba(139, 92, 246, 0.1); --badge-color: #8b5cf6; --badge-border: rgba(139, 92, 246, 0.2); }
    .badge-color-fuchsia { --badge-bg: rgba(217, 70, 239, 0.1); --badge-color: #d946ef; --badge-border: rgba(217, 70, 239, 0.2); }

    /* STRUCTURAL SHAPES */
    .badge-shape-auto {
      /* HTML overrides via global CSS root variables natively apply */
    }
    
    .badge-shape-solid {
      --badge-bg: var(--badge-color);
      --badge-color: var(--text-on-brand, #fff);
      --badge-border-width: 0px;
      --badge-shadow: 0 4px 10px color-mix(in srgb, var(--badge-bg) 40%, transparent);
    }

    .badge-shape-glass {
      --badge-bg: color-mix(in srgb, var(--badge-color) 14%, var(--surface));
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      --badge-border: color-mix(in srgb, var(--badge-color) 40%, transparent);
    }

    .badge-shape-outline {
      --badge-bg: transparent;
      --badge-border-width: 1px;
      --badge-border: var(--badge-color);
    }

    .badge-shape-flat {
      --badge-border-width: 0px;
    }

    .badge-shape-ghost {
      --badge-bg: transparent;
      --badge-border-width: 0px;
    }

    .badge-shape-neumorphic {
      --badge-bg: var(--bg-primary);
      --badge-border-width: 0px;
      --badge-radius: 6px;
      --badge-shadow: -2px -2px 5px rgba(255,255,255,0.02), 2px 2px 5px rgba(0,0,0,0.4);
    }

    .badge-shape-minimal {
      --badge-bg: transparent;
      --badge-border-width: 0px;
      --badge-radius: 0px;
      padding-left: 0; padding-right: 0;
    }
  `],
})
export class UiBadgeComponent {
  @Input() color: BadgeColor = 'default';
  @Input() shape: BadgeShape = 'auto';

  // Legacy parser
  @Input() set variant(val: string) {
    if (val === 'error') {
      this.color = 'danger';
      this.shape = 'auto';
    } else if (['success', 'warning', 'danger', 'info', 'primary', 'default', 'purple', 'indigo', 'teal', 'orange', 'pink', 'rose', 'violet', 'fuchsia'].includes(val)) {
      this.color = val as BadgeColor;
      this.shape = 'auto';
    } else if (['solid', 'glass', 'outline', 'ghost', 'flat'].includes(val)) {
      this.shape = val as BadgeShape;
    } else if (val === 'dark' || val === 'light' || val === 'secondary' || val === 'app') {
      this.color = 'primary';
      this.shape = 'auto';
    } else {
      this.color = 'default';
      this.shape = 'auto';
    }
  }
}
