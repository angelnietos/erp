import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="loader">
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
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(79,70,229,0.2);
      border-top-color: #4F46E5; border-radius: 50%;
      animation: spin 0.8s infinite linear;
    }
    .message { color: #94A3B8; font-size: 14px; margin: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class UiLoaderComponent {
  @Input() message = '';
  @Input() overlay = false;
}