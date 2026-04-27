import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'dark' | 'light' | 'ghost' | 'outline' | 'theme' | 'purple' | 'indigo' | 'teal' | 'orange' | 'pink' | 'rose' | 'violet' | 'fuchsia' | 'app';

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="alert" [class]="'alert-' + variant">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .alert {
      padding: 1.25rem 1.75rem;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: alertSlideIn 0.5s var(--transition-spring);
      backdrop-filter: blur(25px) saturate(2);
      -webkit-backdrop-filter: blur(25px) saturate(2);
      border: 1px solid var(--border-soft);
      font-weight: 700;
      line-height: 1.4;
      font-family: var(--font-main);
      position: relative;
      overflow: hidden;
    }

    /* Side Accent */
    .alert::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 5px;
      background: currentColor;
      box-shadow: 0 0 15px currentColor;
    }

    @keyframes alertSlideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .alert-error {
      background: rgba(255, 59, 48, 0.05);
      color: var(--danger);
      border-color: rgba(255, 59, 48, 0.2);
      animation: alertSlideIn 0.5s var(--transition-spring), alertPulse 2s infinite;
    }

    .alert-success {
      background: rgba(0, 255, 170, 0.05);
      color: var(--success);
      border-color: rgba(0, 255, 170, 0.2);
    }

    .alert-warning {
      background: rgba(255, 204, 0, 0.05);
      color: var(--warning);
      border-color: rgba(255, 204, 0, 0.2);
    }

    .alert-info {
      background: rgba(0, 212, 255, 0.05);
      color: var(--info);
      border-color: rgba(0, 212, 255, 0.2);
    }

    .alert-primary, .alert-theme {
      background: var(--brand-ambient);
      color: var(--brand);
      border-color: var(--brand-border-soft);
      box-shadow: 0 0 30px var(--brand-ambient);
      animation: alertSlideIn 0.5s var(--transition-spring), alertPulse 3s infinite;
    }

    @keyframes alertPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.2); }
      50% { box-shadow: 0 0 40px currentColor; }
    }

    .alert-dark {
      background: rgba(0, 0, 0, 0.95);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.1);
    }

    :host-context(html[data-erp-tenant='babooni']) .alert {
      font-size: 0.875rem;
      line-height: 1.55;
      border-radius: var(--radius-md, 8px);
    }

    @media (prefers-reduced-motion: reduce) {
      .alert {
        animation: none;
      }
    }
  `],
})
export class UiAlertComponent {
  @Input() variant: AlertVariant = 'error';
}
