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
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slide-up 0.3s ease-out;
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Variants */
    .alert-error {
      background: var(--theme-error, #EF4444);
      color: white;
      border: 1px solid var(--theme-error, #EF4444);
      opacity: 0.15;
    }

    .alert-success {
      background: var(--theme-success, #10B981);
      color: white;
      border: 1px solid var(--theme-success, #10B981);
      opacity: 0.15;
    }

    .alert-warning {
      background: var(--theme-warning, #F59E0B);
      color: white;
      border: 1px solid var(--theme-warning, #F59E0B);
      opacity: 0.15;
    }

    .alert-info {
      background: var(--theme-info, #0EA5E9);
      color: white;
      border: 1px solid var(--theme-info, #0EA5E9);
      opacity: 0.15;
    }

    /* Reset opacity for text */
    .alert-error, .alert-success, .alert-warning, .alert-info {
      opacity: 1;
    }

    .alert-error { background: rgba(239, 68, 68, 0.15); color: #DC2626; border-color: rgba(239, 68, 68, 0.2); }
    .alert-success { background: rgba(16, 185, 129, 0.15); color: #059669; border-color: rgba(16, 185, 129, 0.2); }
    .alert-warning { background: rgba(245, 158, 11, 0.15); color: #D97706; border-color: rgba(245, 158, 11, 0.2); }
    .alert-info { background: rgba(14, 165, 233, 0.15); color: #0284C7; border-color: rgba(14, 165, 233, 0.2); }
    .alert-primary {
      background: rgba(79, 70, 229, 0.15);
      color: #4f46e5;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .alert-secondary {
      background: rgba(100, 116, 139, 0.15);
      color: #475569;
      border: 1px solid rgba(100, 116, 139, 0.2);
    }

    .alert-dark {
      background: #1E293B;
      color: white;
      border: 1px solid #334155;
    }

    .alert-light {
      background: #F8FAFC;
      color: #1E293B;
      border: 1px solid #E2E8F0;
    }

    .alert-ghost {
      background: transparent;
      color: var(--theme-text, #1E293B);
      border: none;
    }

    .alert-outline {
      background: transparent;
      color: var(--theme-text, #1E293B);
      border: 2px solid var(--theme-border, #E2E8F0);
    }
  `],
})
export class UiAlertComponent {
  @Input() variant: AlertVariant = 'error';
}
