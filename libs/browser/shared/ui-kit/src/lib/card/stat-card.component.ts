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
        padding: 2.5rem;
        border-radius: var(--radius-xl);
        display: flex;
        flex-direction: column;
        gap: 2rem;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.6s var(--transition-spring);
        background: var(--bg-secondary);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-lg);
        isolation: isolate;
      }

      /* Nintendo Style Side Accent */
      .stat-card::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0; width: 4px;
        background: var(--brand);
        box-shadow: 0 0 15px var(--brand-glow);
        z-index: 10;
        transition: width 0.4s var(--transition-spring);
      }

      .stat-card:hover::before { width: 8px; }

      /* Cinematic Scanlines */
      .stat-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(255,255,255,0.01) 50%, transparent 50%);
        background-size: 100% 2px;
        pointer-events: none;
        opacity: 0.3;
        z-index: -1;
      }

      .stat-card:hover {
        transform: translateY(-15px) scale(1.02);
        background: var(--bg-tertiary);
        border-color: var(--brand);
        box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5), 0 0 40px var(--brand-ambient);
      }

      .stat-icon-wrapper {
        width: 3.5rem;
        height: 3.5rem;
        background: var(--brand-ambient-strong);
        border: 1px solid var(--brand-border-soft);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        transition: all 0.5s var(--transition-spring);
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
      }

      .stat-card:hover .stat-icon-wrapper {
        background: var(--brand);
        color: #fff;
        transform: rotate(-10deg) scale(1.25);
        box-shadow: 0 0 30px var(--brand-glow);
        animation: iconPulse 1.5s infinite;
      }

      @keyframes iconPulse {
        0%, 100% { transform: rotate(-10deg) scale(1.25); }
        50% { transform: rotate(-10deg) scale(1.35); }
      }

      .stat-label {
        font-size: 0.75rem;
        font-weight: 900;
        color: var(--text-muted);
        letter-spacing: 0.25em;
        text-transform: uppercase;
        font-family: var(--font-display);
      }

      .stat-value {
        font-size: 3rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -0.05em;
        color: #fff;
        font-family: var(--font-gaming);
        text-shadow: 0 0 20px rgba(255,255,255,0.15);
      }

      .stat-trend {
        font-size: 0.8rem;
        font-weight: 900;
        padding: 0.4rem 1rem;
        border-radius: 100px;
        font-family: var(--font-gaming);
        background: rgba(255, 255, 255, 0.05);
      }

      .stat-trend.up { color: var(--success); background: color-mix(in srgb, var(--success) 10%, transparent); }
      .stat-trend.down { color: var(--danger); background: color-mix(in srgb, var(--danger) 10%, transparent); }

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
