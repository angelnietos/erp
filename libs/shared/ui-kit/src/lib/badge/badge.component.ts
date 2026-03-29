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
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    /* Variants */
    .badge-success {
      background: rgba(34, 197, 94, 0.15);
      color: #22C55E;
    }

    .badge-warning {
      background: rgba(234, 179, 8, 0.15);
      color: #EAB308;
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
    }

    .badge-info {
      background: rgba(59, 130, 246, 0.15);
      color: #3B82F6;
    }

    .badge-default {
      background: rgba(148, 163, 184, 0.15);
      color: #94A3B8;
    }

    .badge-primary {
      background: rgba(79, 70, 229, 0.15);
      color: #4F46E5;
    }

    .badge-secondary {
      background: rgba(100, 116, 139, 0.15);
      color: #475569;
    }

    .badge-dark {
      background: #1E293B;
      color: white;
    }

    .badge-light {
      background: #F8FAFC;
      color: #1E293B;
      border: 1px solid #E2E8F0;
    }

    .badge-outline {
      background: transparent;
      color: var(--theme-text, #1E293B);
      border: 1px solid var(--theme-border, #E2E8F0);
    }
  `],
})
export class UiBadgeComponent {
  @Input() variant: BadgeVariant = 'default';
}
