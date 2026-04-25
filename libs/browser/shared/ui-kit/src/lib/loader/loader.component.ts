import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderVariant = 'default' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';

@Component({
  selector: 'ui-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="loader-container"
      [class.overlay]="overlay"
      role="status"
      [attr.aria-live]="message ? 'polite' : null"
      aria-busy="true"
    >
      <div class="loader" [class]="'loader-' + variant">
        <div class="spinner" aria-hidden="true"></div>
        @if (message) {
          <p class="message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loader-container { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      padding: 1.5rem; 
    }
    
    .loader-container.overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(5, 7, 10, 0.85); 
      backdrop-filter: blur(12px);
      z-index: 2000;
    }
    
    .loader { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 0.85rem; 
    }

    /* Spinner Base - Modern Tech Style */
    .spinner {
      width: 36px; 
      height: 36px; 
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-top: 2px solid var(--brand);
      border-right: 2px solid var(--brand);
      border-radius: 50%; 
      animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      box-shadow: 0 0 15px var(--brand-glow);
      position: relative;
    }
    
    .spinner::after {
      content: '';
      position: absolute;
      top: 5px; left: 5px; right: 5px; bottom: 5px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 2px solid var(--accent);
      border-left: 2px solid var(--accent);
      border-radius: 50%;
      animation: spin 0.6s linear infinite reverse;
    }

    /* Variants */
    .loader-default .spinner { border-top-color: var(--brand); border-right-color: var(--brand); }
    .loader-default .message { color: var(--text-secondary); }

    .loader-dark .spinner { border-top-color: #fff; border-right-color: #fff; }
    .loader-dark .message { color: #fff; }

    .loader-primary .spinner { border-top-color: var(--brand); border-right-color: var(--brand); }
    .loader-primary .message { color: var(--brand); }

    .loader-success .spinner { border-top-color: var(--success); border-right-color: var(--success); }
    .loader-success .message { color: var(--success); }

    .loader-danger .spinner { border-top-color: var(--danger); border-right-color: var(--danger); }
    .loader-danger .message { color: var(--danger); }

    .message {
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0.02em;
      margin: 0;
      max-width: 22rem;
      text-align: center;
      line-height: 1.45;
      color: var(--text-secondary);
      animation: pulse 1.5s ease-in-out infinite;
      font-family: var(--font-main);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

    :host-context(html[data-erp-tenant='babooni']) .loader-container.overlay {
      background: rgba(255, 255, 255, 0.7);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .spinner {
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-top: 1px solid var(--brand);
      border-right: 1px solid var(--brand);
      box-shadow: none;
      width: 28px;
      height: 28px;
    }

    :host-context(html[data-erp-tenant='babooni']) .spinner::after {
      top: 4px; left: 4px; right: 4px; bottom: 4px;
      border: 1px solid rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid color-mix(in srgb, var(--brand) 40%, transparent);
      border-left: 1px solid color-mix(in srgb, var(--brand) 40%, transparent);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .message {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner,
      .spinner::after {
        animation: none !important;
      }
      .message {
        animation: none;
        opacity: 0.95;
      }
    }
  `],
})
export class UiLoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
  @Input() variant: LoaderVariant = 'default';
}
