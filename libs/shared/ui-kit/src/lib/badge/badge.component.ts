import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary' | 'dark' | 'light' | 'outline';

@Component({
  selector: 'ui-josanz-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge-' + variant">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 4px; /* Shaper, more technical look */
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.3s ease;
      font-family: var(--font-display);
      border: 1px solid transparent;
    }

    /* Variants */
    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.2);
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.2);
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .badge-info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border-color: rgba(59, 130, 246, 0.2);
    }

    .badge-default {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      border-color: rgba(148, 163, 184, 0.2);
    }

    .badge-primary {
      background: rgba(240, 62, 62, 0.1);
      color: var(--brand);
      border-color: rgba(240, 62, 62, 0.2);
    }

    .badge-secondary {
      background: rgba(34, 211, 238, 0.1);
      color: var(--accent);
      border-color: rgba(34, 211, 238, 0.2);
    }

    .badge-dark {
      background: #000;
      color: white;
      border: 1px solid #333;
    }

    .badge-light {
      background: rgba(255, 255, 255, 0.9);
      color: #000;
    }

    .badge-outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-soft);
    }
  `],
})
export class UiBadgeComponent {
  @Input() variant: BadgeVariant = 'default';
}
