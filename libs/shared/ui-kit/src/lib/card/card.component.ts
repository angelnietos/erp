import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'filled' | 'glass' | 'bordered' | 'elevated' | 'flat' | 'gradient' | 'dark' | 'light' | 'interactive' | 'highlight' | 'shadow' | 'outline';

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
      border-radius: var(--radius-lg);
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      transition: var(--transition-base);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: var(--shadow-sm, 0 4px 24px rgba(0, 0, 0, 0.25)), var(--shadow-inset-shine, inset 0 1px 0 rgba(255, 255, 255, 0.05));
    }

    .card-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: color-mix(in srgb, var(--bg-primary) 55%, transparent);
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
      background: color-mix(in srgb, var(--bg-primary) 70%, transparent);
      border-top: 1px solid var(--border-soft);
    }

    .hover-effect {
      cursor: pointer;
    }

    /* Additional variants */
    .ui-elevated {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      border: none;
    }

    .ui-flat {
      background: var(--bg-tertiary);
      border: none;
      box-shadow: none;
    }

    .ui-gradient {
      background: linear-gradient(135deg, var(--bg-secondary), rgba(99, 102, 241, 0.1));
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .ui-dark {
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .ui-light {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .ui-interactive {
      cursor: pointer;
    }
    .ui-interactive:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .ui-highlight {
      border-color: var(--brand-border-soft, var(--brand));
      box-shadow: 0 0 32px color-mix(in srgb, var(--brand-glow) 55%, transparent);
    }

    .ui-shadow {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .ui-outline {
      background: transparent;
      border: 2px solid var(--border-soft);
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() variant: CardVariant = 'default';
  @Input() hover = false;
  @Input() footer = false;
}
