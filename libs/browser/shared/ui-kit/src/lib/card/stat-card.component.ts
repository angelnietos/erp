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
        padding: var(--stat-card-padding, 1.5rem 2rem);
        font-family: var(--font-main);
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(16px);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-lg);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      .stat-card:hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--brand);
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.2);
      }

      .stat-icon-wrapper {
        width: var(--avatar-size, 44px);
        height: var(--avatar-size, 44px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--brand-surface);
        border-radius: 12px;
        color: var(--brand);
        margin-bottom: 12px;
        transition: all 0.3s ease;
      }

      .stat-card:hover .stat-icon-wrapper {
        background: var(--brand);
        color: #fff;
        transform: scale(1.1);
        box-shadow: 0 0 20px var(--brand-glow);
      }

      .stat-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        display: block;
        margin-bottom: 4px;
        letter-spacing: 0.02em;
      }

      .stat-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.1;
        letter-spacing: -0.02em;
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
