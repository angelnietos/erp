import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'filled' | 'glass' | 'bordered';

@Component({
  selector: 'ui-josanz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="card" 
      [class.ui-glass]="variant === 'glass'"
      [class.ui-filled]="variant === 'filled'"
      [class.ui-accent]="variant === 'bordered'"
      [class.ui-neon]="hover"
      [class.hover-effect]="hover"
    >
      @if (title) {
        <div class="card-header">
          <div class="header-main">
            <h3 class="text-uppercase">{{ title }}</h3>
            <ng-content select="[header-subtitle]"></ng-content>
          </div>
          <div class="header-actions">
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (footer) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      transition: var(--transition-base);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .card-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.1);
    }

    .header-main { display: flex; flex-direction: column; gap: 0.25rem; }

    .card-header h3 {
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      color: var(--text-secondary);
      margin: 0;
    }

    .card-body {
      padding: 1.75rem;
      flex: 1;
    }

    .card-footer {
      padding: 1.25rem 1.75rem;
      background: rgba(0, 0, 0, 0.15);
      border-top: 1px solid var(--border-soft);
    }

    .hover-effect {
      cursor: pointer;
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() variant: CardVariant = 'default';
  @Input() hover = false;
  @Input() footer = false;
}
