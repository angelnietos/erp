import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary' | 'dark' | 'light' | 'outline' | 'ghost' | 'purple' | 'indigo' | 'teal' | 'orange' | 'pink' | 'rose' | 'violet' | 'fuchsia' | 'app';

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
      gap: 8px;
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.6rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--font-display);
      border: 1px solid transparent;
      white-space: nowrap;
      transition: var(--transition-base);
    }
    
    .badge:hover { transform: scale(1.05); }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    .badge-primary {
      background: var(--brand-ambient-strong);
      color: var(--brand);
      border-color: var(--brand-border-soft);
    }

    .badge-success { background: rgba(0, 242, 173, 0.12); color: var(--success); border-color: rgba(0, 242, 173, 0.25); }
    .badge-warning { background: rgba(255, 202, 58, 0.12); color: var(--warning); border-color: rgba(255, 202, 58, 0.25); }
    .badge-error { background: rgba(255, 94, 108, 0.12); color: var(--danger); border-color: rgba(255, 94, 108, 0.25); }
    .badge-info { background: rgba(63, 193, 255, 0.12); color: var(--info); border-color: rgba(63, 193, 255, 0.25); }
    
    .badge-default {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border-color: var(--border-soft);
    }

    /* Additional variants */
    .badge-secondary {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border-color: rgba(99, 102, 241, 0.2);
    }

    .badge-dark {
      background: rgba(0, 0, 0, 0.3);
      color: #e2e8f0;
      border-color: rgba(0, 0, 0, 0.3);
    }

    .badge-light {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .badge-outline {
      background: transparent;
      color: var(--text-primary);
      border-color: var(--border-soft);
    }

    .badge-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: none;
    }

    .badge-purple {
      background: rgba(168, 85, 247, 0.1);
      color: #a855f7;
      border-color: rgba(168, 85, 247, 0.2);
    }

    .badge-indigo {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border-color: rgba(99, 102, 241, 0.2);
    }

    .badge-teal {
      background: rgba(20, 184, 166, 0.1);
      color: #14b8a6;
      border-color: rgba(20, 184, 166, 0.2);
    }

    .badge-orange {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
      border-color: rgba(249, 115, 22, 0.2);
    }

    .badge-pink {
      background: rgba(236, 72, 153, 0.1);
      color: #ec4899;
      border-color: rgba(236, 72, 153, 0.2);
    }

    .badge-rose {
      background: rgba(244, 63, 94, 0.1);
      color: #f43f5e;
      border-color: rgba(244, 63, 94, 0.2);
    }

    .badge-violet {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
      border-color: rgba(139, 92, 246, 0.2);
    }

    .badge-fuchsia {
      background: rgba(217, 70, 239, 0.1);
      color: #d946ef;
      border-color: rgba(217, 70, 239, 0.2);
    }
  `],
})
export class UiBadgeComponent {
  @Input() variant: BadgeVariant = 'default';
}
