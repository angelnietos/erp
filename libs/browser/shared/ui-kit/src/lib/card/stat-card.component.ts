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
        <lucide-icon [name]="icon" size="22" aria-hidden="true"></lucide-icon>
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
        padding: 2rem;
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.5s var(--transition-spring);
        background: var(--surface);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-md);
      }

      /* Scanline Effect */
      .stat-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(255,255,255,0.03) 50%, transparent 50%);
        background-size: 100% 4px;
        pointer-events: none;
        opacity: 0.5;
      }

      .stat-card:hover {
        transform: translateY(-12px) scale(1.02);
        background: var(--surface-hover);
        border-color: var(--brand);
        box-shadow: var(--shadow-lg), 0 0 30px var(--brand-glow);
      }

      .stat-icon-wrapper {
        width: 3rem;
        height: 3rem;
        background: var(--brand-ambient-strong);
        border: 1px solid var(--brand-border-soft);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        transition: all 0.4s var(--transition-spring);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      }

      .stat-card:hover .stat-icon-wrapper {
        background: var(--brand);
        color: #fff;
        transform: rotate(-12deg) scale(1.2);
        box-shadow: 0 0 25px var(--brand-glow);
      }

      .stat-label {
        font-size: 0.7rem;
        font-weight: 900;
        color: var(--text-muted);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-family: var(--font-display);
      }

      .stat-value {
        font-size: 2.75rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -0.05em;
        color: #fff;
        font-family: var(--font-gaming);
        filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
      }

      .stat-trend {
        font-size: 0.75rem;
        font-weight: 900;
        padding: 0.35rem 0.85rem;
        border-radius: 50px;
        font-family: var(--font-gaming);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-card {
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid color-mix(in srgb, var(--border-soft) 50%, transparent);
        box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.04);
        padding: 1.25rem 1.5rem;
        gap: 1.25rem;
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-card:hover {
        transform: translateY(-4px);
        background: #ffffff;
        box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.08);
        border-color: color-mix(in srgb, var(--brand) 25%, transparent);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-icon-wrapper {
        width: 3rem;
        height: 3rem;
        background: color-mix(in srgb, var(--brand) 10%, #f9f9f9);
        border-radius: 10px;
        color: var(--brand);
        border: none;
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-card:hover .stat-icon-wrapper {
        background: var(--brand);
        color: #fff;
        transform: scale(1.05);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--brand) 25%, transparent);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-label {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: none;
        color: var(--text-muted);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        font-family: var(--font-main, inherit);
        letter-spacing: -0.02em;
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-trend {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
      }

      @media (prefers-reduced-motion: reduce) {
        .stat-card {
          transition: none;
        }
        .stat-card:hover {
          transform: none;
        }
        .stat-card:hover .stat-icon-wrapper {
          transform: none;
        }
        .stat-icon-wrapper {
          transition: none;
        }
        .accent-line {
          transition: none;
        }
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
