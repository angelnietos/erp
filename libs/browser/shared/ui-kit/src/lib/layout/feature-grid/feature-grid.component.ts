import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-feature-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-grid" [style.grid-template-columns]="columns">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .feature-grid {
      display: grid;
      gap: var(--feature-page-gap, 1.5rem);
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .feature-grid {
        grid-template-columns: 1fr !important;
      }
    }

    :host-context(html[data-erp-tenant='babooni']) .feature-grid {
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    /* Cinematic staggered entry animation */
    .feature-grid > * {
      animation: bbSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes bbSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-grid > *:nth-child(1) { animation-delay: 0.05s; }
    .feature-grid > *:nth-child(2) { animation-delay: 0.1s; }
    .feature-grid > *:nth-child(3) { animation-delay: 0.15s; }
    .feature-grid > *:nth-child(4) { animation-delay: 0.2s; }
    .feature-grid > *:nth-child(5) { animation-delay: 0.25s; }
    .feature-grid > *:nth-child(6) { animation-delay: 0.3s; }
    .feature-grid > *:nth-child(n+7) { animation-delay: 0.35s; }
  `]
})
export class UiFeatureGridComponent {
  @Input() columns = 'repeat(auto-fill, minmax(var(--grid-min-col-width, 380px), 1fr))';
}
