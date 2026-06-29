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
        position: relative;
        overflow: hidden;
        padding: 1.05rem 1.15rem 1.05rem 1.25rem;
        border-radius: var(--vf-radius, 1rem);
        border: 1px solid var(--vf-border, #dde4ef);
        background: var(--vf-bg-elevated, #fff);
        box-shadow: var(--vf-shadow-sm);
        min-height: 5.75rem;
        transition:
          transform var(--vf-duration, 0.2s) var(--vf-ease, ease),
          box-shadow var(--vf-duration, 0.2s) var(--vf-ease, ease);
      }

      .stat::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.75rem;
        bottom: 0.75rem;
        width: 4px;
        border-radius: 0 var(--vf-radius-pill, 999px) var(--vf-radius-pill, 999px) 0;
        background: var(--vf-border-strong, #c8d2e0);
      }

      .stat:hover {
        transform: translateY(-2px);
        box-shadow: var(--vf-shadow);
      }

      .stat__label {
        margin: 0 0 0.4rem;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--vf-text-muted, #5c6b82);
      }

      .stat__value {
        margin: 0;
        font-family: var(--vf-font-display, inherit);
        font-size: 2rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
        color: var(--vf-text, #0c1222);
      }

      .stat__hint {
        margin: 0.45rem 0 0;
        font-size: 0.78rem;
        color: var(--vf-text-muted, #5c6b82);
        line-height: 1.35;
      }

      .tone-success {
        background: linear-gradient(145deg, #fff 0%, #f0fdf8 100%);
        border-color: #bbf7d0;
      }

      .tone-success::before {
        background: var(--vf-accent-gradient, linear-gradient(180deg, #34f5a8, #0d9f5f));
      }

      .tone-success .stat__value {
        color: #047857;
      }

      .tone-warning {
        background: linear-gradient(145deg, #fff 0%, #fffaf5 100%);
        border-color: #fed7aa;
      }

      .tone-warning::before {
        background: linear-gradient(180deg, #fdba74, #ea580c);
      }

      .tone-warning .stat__value {
        color: #c2410c;
      }

      .tone-danger {
        background: linear-gradient(145deg, #fff 0%, #fff5f7 100%);
        border-color: #fecdd3;
      }

      .tone-danger::before {
        background: linear-gradient(180deg, #fb7185, #e11d48);
      }

      .tone-danger .stat__value {
        color: #be123c;
      }

      .tone-info {
        background: linear-gradient(145deg, #fff 0%, #f5fbff 100%);
        border-color: #bae6fd;
      }

      .tone-info::before {
        background: linear-gradient(180deg, #38bdf8, #0ea5e9);
      }

      .tone-info .stat__value {
        color: #0369a1;
      }

      /* Dark mode overrides */
      :host-context(.vf-theme-dark) .tone-success {
        background: linear-gradient(145deg, #111b27 0%, #0d281a 100%);
        border-color: rgba(52, 245, 168, 0.2);
      }
      :host-context(.vf-theme-dark) .tone-success .stat__value {
        color: #34f5a8;
      }

      :host-context(.vf-theme-dark) .tone-warning {
        background: linear-gradient(145deg, #1f1a12 0%, #2e1d0f 100%);
        border-color: rgba(234, 88, 12, 0.2);
      }
      :host-context(.vf-theme-dark) .tone-warning .stat__value {
        color: #fdba74;
      }

      :host-context(.vf-theme-dark) .tone-danger {
        background: linear-gradient(145deg, #24141a 0%, #3b1320 100%);
        border-color: rgba(225, 29, 72, 0.2);
      }
      :host-context(.vf-theme-dark) .tone-danger .stat__value {
        color: #fda4af;
      }

      :host-context(.vf-theme-dark) .tone-info {
        background: linear-gradient(145deg, #121e2d 0%, #0c233c 100%);
        border-color: rgba(14, 165, 233, 0.2);
      }
      :host-context(.vf-theme-dark) .tone-info .stat__value {
        color: #7dd3fc;
      }

      /* ===== Forest theme overrides ===== */
      :host-context(.vf-theme-forest) .stat {
        background: rgba(15, 35, 24, 0.75);
        border-color: rgba(102, 187, 106, 0.15);
        backdrop-filter: blur(12px);
      }
      :host-context(.vf-theme-forest) .tone-success {
        background: linear-gradient(145deg, #0d1f0f 0%, #163520 100%);
        border-color: rgba(102, 187, 106, 0.3);
      }
      :host-context(.vf-theme-forest) .tone-success .stat__value { color: #a5d6a7; }
      :host-context(.vf-theme-forest) .tone-warning {
        background: linear-gradient(145deg, #1f1a0d 0%, #2c2010 100%);
        border-color: rgba(255, 167, 38, 0.25);
      }
      :host-context(.vf-theme-forest) .tone-warning .stat__value { color: #ffb74d; }
      :host-context(.vf-theme-forest) .tone-danger {
        background: linear-gradient(145deg, #200d0d 0%, #2e1214 100%);
        border-color: rgba(229, 115, 115, 0.25);
      }
      :host-context(.vf-theme-forest) .tone-danger .stat__value { color: #ef9a9a; }
      :host-context(.vf-theme-forest) .tone-info {
        background: linear-gradient(145deg, #0d1825 0%, #0e2035 100%);
        border-color: rgba(100, 181, 246, 0.25);
      }
      :host-context(.vf-theme-forest) .tone-info .stat__value { color: #90caf9; }

      /* ===== Cyberpunk theme overrides ===== */
      :host-context(.vf-theme-cyberpunk) .stat {
        background: rgba(12, 12, 20, 0.80);
        border-color: rgba(167, 139, 250, 0.12);
        backdrop-filter: blur(14px);
      }
      :host-context(.vf-theme-cyberpunk) .tone-success {
        background: linear-gradient(145deg, #0a1710 0%, #0d2016 100%);
        border-color: rgba(52, 211, 153, 0.25);
      }
      :host-context(.vf-theme-cyberpunk) .tone-success .stat__value { color: #6ee7b7; }
      :host-context(.vf-theme-cyberpunk) .tone-warning {
        background: linear-gradient(145deg, #1f1900 0%, #2a2100 100%);
        border-color: rgba(250, 204, 21, 0.3);
      }
      :host-context(.vf-theme-cyberpunk) .tone-warning .stat__value { color: #fde68a; }
      :host-context(.vf-theme-cyberpunk) .tone-danger {
        background: linear-gradient(145deg, #1f0505 0%, #280808 100%);
        border-color: rgba(248, 113, 113, 0.25);
      }
      :host-context(.vf-theme-cyberpunk) .tone-danger .stat__value { color: #fca5a5; }
      :host-context(.vf-theme-cyberpunk) .tone-info {
        background: linear-gradient(145deg, #060f1e 0%, #091730 100%);
        border-color: rgba(34, 211, 238, 0.25);
      }
      :host-context(.vf-theme-cyberpunk) .tone-info .stat__value { color: #67e8f9; }

      @media (prefers-reduced-motion: reduce) {
        .stat {
          transition: none;
        }

        .stat:hover {
          transform: none;
        }
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
