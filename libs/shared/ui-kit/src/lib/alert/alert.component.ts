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
      padding: 1.25rem 1.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(12px);
      border: 1px solid transparent;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: var(--font-display);
    }

    @keyframes alertSlideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Variants */
    .alert-error {
      background: rgba(239, 68, 68, 0.08);
      color: #ff5555;
      border-color: rgba(239, 68, 68, 0.3);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.08);
      color: #00ffaa;
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.08);
      color: #ffaa00;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .alert-info {
      background: rgba(59, 130, 246, 0.08);
      color: #00ccff;
      border-color: rgba(59, 130, 246, 0.3);
    }

    .alert-primary {
      background: rgba(240, 62, 62, 0.08);
      color: var(--brand);
      border-color: var(--brand);
      box-shadow: 0 0 20px var(--brand-glow);
    }

    .alert-secondary {
      background: rgba(34, 211, 238, 0.08);
      color: #00f2ff;
      border-color: rgba(34, 211, 238, 0.3);
    }

    .alert-dark {
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border-color: var(--border-soft);
    }

    .alert-ghost {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
      border: 1px solid transparent;
    }

    .alert-outline {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-soft);
    }
  `],
})
export class UiAlertComponent {
  @Input() variant: AlertVariant = 'error';
}
