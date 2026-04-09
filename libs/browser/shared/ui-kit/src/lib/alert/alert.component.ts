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
      padding: 1.1rem 1.35rem;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid transparent;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-display);
      box-shadow: var(--shadow-inset-shine, inset 0 1px 0 rgba(255, 255, 255, 0.06));
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

    /* Additional color variants */
    .alert-purple {
      background: rgba(168, 85, 247, 0.08);
      color: #a855f7;
      border-color: rgba(168, 85, 247, 0.3);
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.1);
    }

    .alert-indigo {
      background: rgba(99, 102, 241, 0.08);
      color: #6366f1;
      border-color: rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
    }

    .alert-teal {
      background: rgba(20, 184, 166, 0.08);
      color: #14b8a6;
      border-color: rgba(20, 184, 166, 0.3);
      box-shadow: 0 0 15px rgba(20, 184, 166, 0.1);
    }

    .alert-orange {
      background: rgba(249, 115, 22, 0.08);
      color: #f97316;
      border-color: rgba(249, 115, 22, 0.3);
      box-shadow: 0 0 15px rgba(249, 115, 22, 0.1);
    }

    .alert-pink {
      background: rgba(236, 72, 153, 0.08);
      color: #ec4899;
      border-color: rgba(236, 72, 153, 0.3);
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.1);
    }

    .alert-rose {
      background: rgba(244, 63, 94, 0.08);
      color: #f43f5e;
      border-color: rgba(244, 63, 94, 0.3);
      box-shadow: 0 0 15px rgba(244, 63, 94, 0.1);
    }

    .alert-violet {
      background: rgba(139, 92, 246, 0.08);
      color: #8b5cf6;
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.1);
    }

    .alert-fuchsia {
      background: rgba(217, 70, 239, 0.08);
      color: #d946ef;
      border-color: rgba(217, 70, 239, 0.3);
      box-shadow: 0 0 15px rgba(217, 70, 239, 0.1);
    }

    .alert-theme {
      background: var(--bg-tertiary);
      color: var(--brand);
      border-color: var(--brand);
      box-shadow: 0 0 20px var(--brand-glow);
    }

    /* App variant - uses current theme's primary color */
    .alert-app {
      background: rgba(var(--theme-primary-rgb, 79, 70, 229), 0.08);
      color: var(--theme-primary, var(--brand));
      border-color: rgba(var(--theme-primary-rgb, 79, 70, 229), 0.3);
      box-shadow: 0 0 15px rgba(var(--theme-primary-rgb, 79, 70, 229), 0.1);
    }
  `],
})
export class UiAlertComponent {
  @Input() variant: AlertVariant = 'error';
}
