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
      padding: 2rem; 
    }
    
    .loader-container.overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.9); 
      backdrop-filter: blur(25px) saturate(2);
      z-index: 50000;
      animation: loaderFadeIn 0.5s var(--ease-out-expo);
    }

    @keyframes loaderFadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    .loader { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 1.5rem; 
    }

    /* Holographic Spinner */
    .spinner {
      width: 60px; 
      height: 60px; 
      border: 3px solid rgba(255, 255, 255, 0.03);
      border-top: 3px solid var(--brand);
      border-radius: 50%; 
      animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      box-shadow: 0 0 30px var(--brand-glow);
      position: relative;
    }
    
    .spinner::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 2px solid rgba(255, 255, 255, 0.03);
      border-bottom: 2px solid var(--brand-ambient-strong);
      border-radius: 50%;
      animation: spin 1.5s linear infinite reverse;
    }

    .spinner::after {
      content: '';
      position: absolute;
      inset: -10px;
      border: 1px solid rgba(255, 255, 255, 0.02);
      border-left: 1px solid var(--brand-glow);
      border-radius: 50%;
      animation: spin 3s linear infinite;
      filter: blur(2px);
    }

    .loader-success .spinner { border-top-color: var(--success); box-shadow: 0 0 30px var(--success); }
    .loader-danger .spinner { border-top-color: var(--danger); box-shadow: 0 0 30px var(--danger); }
    .loader-warning .spinner { border-top-color: var(--warning); box-shadow: 0 0 30px var(--warning); }

    .message {
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      color: #fff;
      text-shadow: 0 0 15px var(--brand-glow);
      animation: messagePulse 2s ease-in-out infinite;
      font-family: var(--font-display);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes messagePulse { 0%, 100% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1); } }
  `],
})
export class UiLoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
  @Input() variant: LoaderVariant = 'default';
}
