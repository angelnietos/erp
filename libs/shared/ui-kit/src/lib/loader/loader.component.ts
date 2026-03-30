import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderVariant = 'default' | 'dark' | 'light' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';

@Component({
  selector: 'ui-josanz-loader',
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
    .loader-container { display: flex; justify-content: center; align-items: center; padding: 40px; }
    .loader-container.overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 1000;
    }
    .loader { display: flex; flex-direction: column; align-items: center; gap: 16px; }

    /* Spinner Base */
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(79,70,229,0.2);
      border-radius: 50%; animation: spin 0.8s infinite linear;
    }

    /* Variants */
    .loader-default .spinner {
      border-color: rgba(79,70,229,0.2);
      border-top-color: #4F46E5;
    }
    .loader-default .message { color: #94A3B8; }

    .loader-dark .spinner {
      border-color: rgba(255,255,255,0.2);
      border-top-color: white;
    }
    .loader-dark .message { color: #E2E8F0; }

    .loader-light .spinner {
      border-color: rgba(0,0,0,0.1);
      border-top-color: #1E293B;
    }
    .loader-light .message { color: #64748B; }

    .loader-primary .spinner {
      border-color: rgba(79, 70, 229, 0.2);
      border-top-color: #4F46E5;
    }
    .loader-primary .message { color: #4F46E5; }

    .loader-success .spinner {
      border-color: rgba(16, 185, 129, 0.2);
      border-top-color: #10B981;
    }
    .loader-success .message { color: #10B981; }

    .loader-warning .spinner {
      border-color: rgba(245, 158, 11, 0.2);
      border-top-color: #F59E0B;
    }
    .loader-warning .message { color: #F59E0B; }

    .loader-danger .spinner {
      border-color: rgba(239, 68, 68, 0.2);
      border-top-color: #EF4444;
    }
    .loader-danger .message { color: #EF4444; }

    .loader-info .spinner {
      border-color: rgba(14, 165, 233, 0.2);
      border-top-color: #0EA5E9;
    }
    .loader-info .message { color: #0EA5E9; }

    .loader-gradient .spinner {
      border-color: rgba(79, 70, 229, 0.2);
      border-top-color: transparent;
      border-radius: 50%;
      background: linear-gradient(45deg, #4F46E5, #10B981, #F59E0B, #EF4444);
      -webkit-background-clip: content-box;
      background-clip: content-box;
    }
    .loader-gradient .message { 
      background: linear-gradient(45deg, #4F46E5, #10B981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .message { font-size: 14px; margin: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class UiLoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
  @Input() variant: LoaderVariant = 'default';
}
