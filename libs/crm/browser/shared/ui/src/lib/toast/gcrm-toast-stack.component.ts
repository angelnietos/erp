import { Component, inject } from '@angular/core';
import { GcrmToastService } from './gcrm-toast.service';

@Component({
  selector: 'gcrm-toast-stack',
  standalone: true,
  template: `
    <div class="gcrm-toast-stack" aria-live="polite" aria-relevant="additions">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="gcrm-toast" [attr.data-variant]="toast.variant" role="status">
          <p class="gcrm-toast__message">{{ toast.message }}</p>
          <button
            type="button"
            class="gcrm-toast__close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .gcrm-toast-stack {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 10050;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        width: min(100vw - 2rem, 22rem);
        pointer-events: none;
      }

      .gcrm-toast {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.85rem 0.95rem;
        border-radius: 0.75rem;
        border: 1px solid transparent;
        box-shadow:
          0 10px 28px rgb(12 18 34 / 0.14),
          0 2px 8px rgb(12 18 34 / 0.08);
        background: var(--vf-bg-elevated, #fff);
        color: var(--vf-text, #0c1222);
        pointer-events: auto;
        animation: gcrm-toast-in 0.22s ease-out;
      }

      .gcrm-toast[data-variant='success'] {
        border-color: rgba(16, 185, 129, 0.35);
        background: linear-gradient(
          180deg,
          rgba(16, 217, 129, 0.12) 0%,
          var(--vf-bg-elevated, #fff) 100%
        );
      }

      .gcrm-toast[data-variant='error'] {
        border-color: rgba(220, 38, 38, 0.35);
        background: linear-gradient(
          180deg,
          rgba(254, 226, 226, 0.85) 0%,
          var(--vf-bg-elevated, #fff) 100%
        );
      }

      .gcrm-toast[data-variant='info'] {
        border-color: rgba(37, 99, 235, 0.28);
        background: linear-gradient(
          180deg,
          rgba(219, 234, 254, 0.85) 0%,
          var(--vf-bg-elevated, #fff) 100%
        );
      }

      .gcrm-toast__message {
        margin: 0;
        flex: 1;
        font-size: 0.88rem;
        line-height: 1.45;
      }

      .gcrm-toast__close {
        flex: 0 0 auto;
        border: none;
        background: transparent;
        color: inherit;
        opacity: 0.65;
        font-size: 1.15rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
      }

      .gcrm-toast__close:hover {
        opacity: 1;
      }

      @keyframes gcrm-toast-in {
        from {
          opacity: 0;
          transform: translateY(0.45rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class GcrmToastStackComponent {
  readonly toastService = inject(GcrmToastService);
}
