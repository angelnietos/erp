import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-feature-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
  `]
})
export class UiFeatureStatsComponent {}
