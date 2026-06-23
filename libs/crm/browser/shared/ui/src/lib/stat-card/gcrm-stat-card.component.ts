import { Component, Input } from '@angular/core';

export type GcrmStatCardTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'gcrm-stat-card',
  standalone: true,
  template: `
    <article class="stat" [class]="'tone-' + tone">
      <p class="stat__label">{{ label }}</p>
      <p class="stat__value">{{ value }}</p>
      @if (hint) {
        <p class="stat__hint">{{ hint }}</p>
      }
    </article>
  `,
  styles: [
    `
      .stat {
        padding: 1rem 1.1rem;
        border-radius: var(--vf-radius, 0.75rem);
        border: 1px solid var(--vf-border, #e2e8f0);
        background: var(--vf-bg-elevated, #fff);
        box-shadow: var(--vf-shadow, 0 1px 2px rgb(15 23 42 / 0.05));
        min-height: 5.5rem;
      }
      .stat__label {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--vf-text-muted, #64748b);
      }
      .stat__value {
        margin: 0;
        font-size: 1.85rem;
        font-weight: 700;
        line-height: 1.1;
        color: var(--vf-text, #0f172a);
      }
      .stat__hint {
        margin: 0.4rem 0 0;
        font-size: 0.8rem;
        color: var(--vf-text-muted, #64748b);
      }
      .tone-success .stat__value {
        color: var(--vf-accent, #16a34a);
      }
      .tone-warning .stat__value {
        color: var(--vf-warning, #d97706);
      }
      .tone-danger .stat__value {
        color: var(--vf-danger, #dc2626);
      }
      .tone-info .stat__value {
        color: var(--vf-info, #2563eb);
      }
    `,
  ],
})
export class GcrmStatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '—';
  @Input() hint = '';
  @Input() tone: GcrmStatCardTone = 'default';
}
