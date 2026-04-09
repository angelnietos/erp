import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderVariant = 'default' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';

@Component({
  selector: 'ui-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="loader" [class]="'loader-' + variant">
        <div class="spinner"></div>
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
      font-size: 0.58rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.08em;
      margin: 0; 
      color: var(--text-muted);
      animation: pulse 1.5s ease-in-out infinite;
      font-family: var(--font-main);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  `],
})
export class UiLoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
  @Input() variant: LoaderVariant = 'default';
}
