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
        padding: 1.5rem 1.75rem;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.4s var(--ease-out-expo);
        background: var(--surface);
        border: 1px solid var(--border-soft);
        box-shadow: var(--shadow-sm);
      }

      .stat-card:hover {
        transform: translateY(-8px);
        background: var(--surface-hover);
        border-color: var(--brand);
        box-shadow: var(--shadow-md), 0 0 20px -5px var(--brand-glow);
      }

      .stat-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
      }

      .stat-icon-wrapper {
        width: 3.5rem;
        height: 3.5rem;
        background: var(--brand-ambient);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        transition: all 0.4s var(--ease-out-expo);
      }

      .stat-card:hover .stat-icon-wrapper {
        background: var(--brand);
        color: #fff;
        transform: rotate(-8deg) scale(1.1);
        box-shadow: 0 0 20px var(--brand-glow);
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .stat-label {
        font-size: 0.65rem;
        font-weight: 900;
        color: var(--text-muted);
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .stat-value-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }

      .stat-value {
        font-size: 2.2rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        font-family: var(--font-gaming, inherit);
      }

      .stat-trend {
        font-size: 0.72rem;
        font-weight: 900;
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
        backdrop-filter: blur(4px);
      }

      .stat-trend.up { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
      .stat-trend.down { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }

      .accent-line {
        position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
        background: var(--brand); box-shadow: 0 0 15px var(--brand-glow);
        transform: scaleX(0); transition: transform 0.4s; transform-origin: left;
      }
      .stat-card:hover .accent-line { transform: scaleX(1); }

      :host-context(html[data-erp-tenant='babooni']) .stat-card {
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-label {
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: none;
        color: var(--text-muted);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-value {
        font-size: 1.85rem;
        font-weight: 700;
        font-family: var(--font-main, inherit);
      }

      :host-context(html[data-erp-tenant='babooni']) .stat-trend {
        border-radius: 8px;
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
