import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'dark' | 'light' | 'ghost' | 'outline' | 'theme';

@Component({
  selector: 'ui-josanz-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="alert" [class]="'alert-' + variant">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .alert {
      padding: 1rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: alertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid transparent;
      font-weight: 500;
    }

    @keyframes alertSlideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Variants */
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.2);
      box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.05);
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.2);
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.2);
    }

    .alert-info {
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.2);
    }

    .alert-primary {
      background: rgba(240, 62, 62, 0.1);
      color: var(--brand);
      border-color: rgba(240, 62, 62, 0.2);
    }

    .alert-secondary {
      background: rgba(34, 211, 238, 0.1);
      color: var(--accent);
      border-color: rgba(34, 211, 238, 0.2);
    }

    .alert-dark {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .alert-light {
      background: rgba(255, 255, 255, 0.9);
      color: #000;
    }

    .alert-ghost {
      background: transparent;
      color: var(--text-primary);
      border: none;
    }

    .alert-outline {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-vibrant);
    }
  `],
})
export class UiAlertComponent {
  @Input() variant: AlertVariant = 'error';
}
