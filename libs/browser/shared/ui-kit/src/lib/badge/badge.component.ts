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
    <span
      class="badge"
      [ngClass]="['badge-color-' + color, 'badge-shape-' + shape]"
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
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      border: 1px solid transparent;
      white-space: nowrap;
      transition: all 0.3s var(--transition-spring);
      background: var(--badge-bg, transparent);
      color: var(--badge-color, var(--text-primary));
    }
    
    .badge:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3), 0 0 15px var(--badge-color);
      filter: brightness(1.2);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
      animation: pulse 2s infinite;
    }

    /* THEMATIC COLOR TOKENS — Vibrant Ubisoft/Nintendo Palette */
    .badge-color-default { 
      --badge-bg: var(--brand-ambient); 
      --badge-color: var(--brand); 
      --badge-border: var(--brand-border-soft); 
    }
    .badge-color-primary { 
      --badge-bg: var(--brand); 
      --badge-color: #fff; 
      --badge-shadow: 0 0 15px var(--brand-glow);
    }
    .badge-color-success { 
      --badge-bg: #00ffaa; 
      --badge-color: #013220; 
      --badge-shadow: 0 0 15px rgba(0, 255, 170, 0.4);
    }
    .badge-color-warning { 
      --badge-bg: #ffcc00; 
      --badge-color: #422006; 
    }
    .badge-color-danger { 
      --badge-bg: #ff3b30; 
      --badge-color: #fff; 
    }
    .badge-color-info { 
      --badge-bg: #00d4ff; 
      --badge-color: #fff; 
    }

    /* STRUCTURAL SHAPES */
    .badge-shape-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      --badge-bg: rgba(255, 255, 255, 0.05);
    }
    
    .badge-shape-solid {
      --badge-bg: var(--badge-color);
      --badge-color: #fff;
    }

    /* Babooni: badges con contraste sobre superficie clara + tokens de tema */
    :host-context(html[data-erp-tenant='babooni']) .badge-color-primary {
      --badge-bg: color-mix(in srgb, var(--brand) 14%, var(--theme-surface, #fffefe));
      --badge-color: color-mix(in srgb, var(--brand) 72%, var(--text-primary, #111) 28%);
      --badge-border: color-mix(in srgb, var(--brand) 32%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .badge-color-success {
      --badge-bg: color-mix(in srgb, var(--success, #21b158) 16%, var(--theme-surface, #fffefe));
      --badge-color: color-mix(in srgb, var(--success, #21b158) 62%, var(--text-primary, #111) 38%);
      --badge-border: color-mix(in srgb, var(--success, #21b158) 38%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .badge-color-warning {
      --badge-bg: color-mix(in srgb, var(--warning, #f59e0b) 18%, var(--theme-surface, #fffefe));
      --badge-color: color-mix(in srgb, var(--warning) 48%, #422006);
      --badge-border: color-mix(in srgb, var(--warning) 35%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .badge-color-danger {
      --badge-bg: color-mix(in srgb, var(--danger, #ef4444) 14%, var(--theme-surface, #fffefe));
      --badge-color: color-mix(in srgb, var(--danger) 50%, #450a0a);
      --badge-border: color-mix(in srgb, var(--danger) 34%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .badge-color-info {
      --badge-bg: color-mix(in srgb, var(--info, #5966f4) 14%, var(--theme-surface, #fffefe));
      --badge-color: color-mix(in srgb, var(--info) 45%, #0f172a);
      --badge-border: color-mix(in srgb, var(--info) 32%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.65rem;
      border-radius: 6px;
      letter-spacing: 0.01em;
      border-width: 1px;
    }

    :host-context(html[data-erp-tenant='babooni']) .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .dot {
      width: 4px;
      height: 4px;
    }

    @media (prefers-reduced-motion: reduce) {
      .badge:hover {
        transform: none;
        box-shadow: var(--badge-shadow, none);
      }
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
