import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-angular';
import { ToastService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'josanz-toast-stack',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="toast-stack" role="region" aria-label="Mensajes">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.variant" role="status">
          @if (t.variant === 'success') {
            <lucide-icon [img]="IconCheck" size="18" class="toast-icon" aria-hidden="true" />
          } @else if (t.variant === 'error') {
            <lucide-icon [img]="IconAlert" size="18" class="toast-icon" aria-hidden="true" />
          } @else {
            <lucide-icon [img]="IconInfo" size="18" class="toast-icon" aria-hidden="true" />
          }
          <span class="toast-msg">{{ t.message }}</span>
          <button
            type="button"
            class="toast-close"
            (click)="toast.dismiss(t.id)"
            aria-label="Cerrar"
          >
            <lucide-icon [img]="IconX" size="16" aria-hidden="true" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        right: 1.25rem;
        bottom: 1.25rem;
        z-index: 3000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: min(420px, calc(100vw - 2.5rem));
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.75rem 0.85rem;
        border-radius: 10px;
        border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.12));
        background: rgba(18, 18, 22, 0.94);
        backdrop-filter: blur(12px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
        animation: toast-in 0.22s ease-out;
      }
      .toast.success {
        border-color: rgba(34, 197, 94, 0.35);
      }
      .toast.error {
        border-color: rgba(239, 68, 68, 0.45);
      }
      .toast.info {
        border-color: rgba(59, 130, 246, 0.35);
      }
      .toast-icon {
        flex-shrink: 0;
        margin-top: 1px;
        opacity: 0.9;
      }
      .toast.success .toast-icon {
        color: var(--success, #22c55e);
      }
      .toast.error .toast-icon {
        color: var(--danger, #ef4444);
      }
      .toast.info .toast-icon {
        color: var(--info, #3b82f6);
      }
      .toast-msg {
        flex: 1;
        font-size: 0.8rem;
        line-height: 1.35;
        color: var(--text-primary, #f4f4f5);
      }
      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--text-muted, #a1a1aa);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
      }
      .toast-close:hover {
        opacity: 1;
        color: #fff;
      }
      .toast-close:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--info, #3b82f6) 65%, transparent);
        outline-offset: 2px;
        border-radius: 4px;
        opacity: 1;
        color: #fff;
      }
      @keyframes toast-in {
        from {
          transform: translateY(8px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }
      }
    `,
  ],
})
export class ToastStackComponent {
  readonly toast = inject(ToastService);
  readonly IconCheck = CheckCircle;
  readonly IconAlert = AlertCircle;
  readonly IconInfo = Info;
  readonly IconX = X;
}
