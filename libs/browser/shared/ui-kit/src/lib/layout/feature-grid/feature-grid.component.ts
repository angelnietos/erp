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
      gap: 1.5rem;
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .feature-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class UiFeatureGridComponent {
  @Input() columns = 'repeat(auto-fill, minmax(380px, 1fr))';
}
