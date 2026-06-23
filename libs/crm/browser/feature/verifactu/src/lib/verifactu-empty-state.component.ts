import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-verifactu-empty-state',
  standalone: true,
  template: `
    <div class="vf-empty-state" role="status">
      <div class="vf-empty-state__icon" [attr.data-tone]="tone" aria-hidden="true">
        @switch (icon) {
          @case ('queue') {
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="10" width="32" height="28" rx="6" stroke="currentColor" stroke-width="2" />
              <path d="M16 20h16M16 26h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          }
          @case ('history') {
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2" />
              <path d="M24 16v9l6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          }
          @default {
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 34l10-18 10 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="24" cy="16" r="3" fill="currentColor" />
            </svg>
          }
        }
      </div>
      <h3 class="vf-empty-state__title">{{ title }}</h3>
      <p class="vf-empty-state__lede">{{ description }}</p>
      <div class="vf-empty-state__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .vf-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5rem 1.5rem;
        border-radius: var(--vf-radius, 1rem);
        border: 1px dashed var(--vf-border-strong, #c8d2e0);
        background: linear-gradient(
          165deg,
          var(--vf-bg-elevated, #fff) 0%,
          var(--vf-bg-subtle, #eef2f8) 100%
        );
      }

      .vf-empty-state__icon {
        display: grid;
        place-items: center;
        width: 4.25rem;
        height: 4.25rem;
        margin-bottom: 1rem;
        border-radius: 1.1rem;
        color: var(--vf-accent, #0d9f5f);
        background: var(--vf-accent-soft, rgba(16, 217, 129, 0.12));
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
      }

      .vf-empty-state__icon[data-tone='warning'] {
        color: #c2410c;
        background: #fff7ed;
      }

      .vf-empty-state__icon svg {
        width: 2rem;
        height: 2rem;
      }

      .vf-empty-state__title {
        margin: 0 0 0.45rem;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.1rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--vf-text, #0c1222);
      }

      .vf-empty-state__lede {
        margin: 0;
        max-width: 28rem;
        font-size: 0.9rem;
        line-height: 1.55;
        color: var(--vf-text-muted, #5c6b82);
      }

      .vf-empty-state__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.15rem;
      }

      .vf-empty-state__actions:empty {
        display: none;
        margin-top: 0;
      }
    `,
  ],
})
export class VerifactuEmptyStateComponent {
  @Input() title = 'Sin datos';
  @Input() description = '';
  @Input() icon: 'queue' | 'history' | 'default' = 'default';
  @Input() tone: 'default' | 'warning' = 'default';
}
