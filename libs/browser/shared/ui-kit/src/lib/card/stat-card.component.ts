import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="stat-card ui-glass ui-neon" [class.accent]="accent">
      <div class="stat-icon-wrapper">
        <lucide-icon [name]="icon" size="22"></lucide-icon>
      </div>
      <div class="stat-content">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-value-row">
          <h2 class="stat-value">{{ value }}</h2>
          @if (trend !== undefined) {
            <span
              class="stat-trend"
              [class.up]="trend > 0"
              [class.down]="trend < 0"
            >
              {{ trend > 0 ? '↑' : '↓' }} {{ trend > 0 ? '+' : '' }}{{ trend }}%
            </span>
          }
        </div>
      </div>
      @if (accent) {
        <div class="accent-line"></div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .stat-card {
        padding: 1.125rem 1.375rem;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition:
          transform 0.35s var(--ease-out-expo),
          box-shadow 0.35s var(--ease-out-expo);
        background: var(--card-bg, var(--surface));
        border: 1px solid var(--card-border, var(--border-soft));
        box-shadow: var(--shadow-sm), var(--shadow-inset-shine);
      }

      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow:
          var(--shadow-md),
          0 0 32px -8px var(--brand-glow);
      }

      /* Shimmer on hover */
      .stat-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 60%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.06),
          transparent
        );
        transform: skewX(-15deg);
        transition: left 0.6s var(--ease-out-expo);
        pointer-events: none;
      }
      .stat-card:hover::after {
        left: 150%;
      }

      .stat-icon-wrapper {
        width: 3rem;
        height: 3rem;
        min-width: 3rem;
        background: color-mix(in srgb, var(--brand) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        transition: all 0.35s var(--ease-out-expo);
      }

      .stat-card:hover .stat-icon-wrapper {
        transform: scale(1.12) rotate(-6deg);
        background: var(--brand);
        color: #fff;
        box-shadow: 0 0 20px var(--brand-glow);
        border-color: transparent;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        flex: 1;
        min-width: 0;
      }

      .stat-label {
        font-size: 0.6rem;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-family: var(--font-display);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stat-value-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        font-family: var(--font-display);
        letter-spacing: -0.02em;
        color: var(--text-primary);
        line-height: 1;
      }

      .stat-trend {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.2rem 0.55rem;
        border-radius: 2rem;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .stat-trend.up {
        background: color-mix(
          in srgb,
          var(--success, #10b981) 12%,
          transparent
        );
        color: var(--success, #10b981);
        border: 1px solid
          color-mix(in srgb, var(--success, #10b981) 25%, transparent);
      }

      .stat-trend.down {
        background: color-mix(in srgb, var(--danger, #ef4444) 12%, transparent);
        color: var(--danger, #ef4444);
        border: 1px solid
          color-mix(in srgb, var(--danger, #ef4444) 25%, transparent);
      }

      .accent-line {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(
          90deg,
          var(--brand),
          color-mix(in srgb, var(--brand) 50%, transparent)
        );
        box-shadow: 0 0 12px var(--brand-glow);
      }
    `,
  ],
})
export class UiStatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = 'package';
  @Input() trend?: number;
  @Input() accent = false;
}
