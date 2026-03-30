import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

@Component({
  selector: 'ui-josanz-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge-' + variant">
      @if (variant !== 'default') { <div class="dot"></div> }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: var(--font-display);
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Variants */
    .badge-primary {
      background: rgba(230, 0, 18, 0.1);
      color: var(--brand);
      border-color: rgba(230, 0, 18, 0.2);
    }

    .badge-success {
      background: rgba(0, 210, 138, 0.1);
      color: var(--success);
      border-color: rgba(0, 210, 138, 0.2);
    }

    .badge-warning {
      background: rgba(255, 184, 0, 0.1);
      color: var(--warning);
      border-color: rgba(255, 184, 0, 0.2);
    }

    .badge-error {
      background: rgba(255, 75, 75, 0.1);
      color: var(--danger);
      border-color: rgba(255, 75, 75, 0.2);
    }

    .badge-info {
      background: rgba(0, 136, 255, 0.1);
      color: var(--info);
      border-color: rgba(0, 136, 255, 0.2);
    }

    .badge-default {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border-color: var(--border-soft);
    }
  `],
})
export class UiBadgeComponent {
  @Input() variant: BadgeVariant = 'default';
}
