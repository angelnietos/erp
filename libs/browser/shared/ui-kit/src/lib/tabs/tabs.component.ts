import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export type TabsVariant =
  | 'default'
  | 'underline'
  | 'pills'
  | 'boxed'
  | 'bordered'
  | 'soft'
  | 'minimal'
  | 'icon'
  | 'animated'
  | 'gradient';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="'tabs tabs-' + variant">
      @for (tab of tabs; track tab.id) {
        <button
          class="tab-item"
          [class.active]="activeTab === tab.id"
          (click)="onTabSelect(tab.id)"
        >
          @if (tab.icon) {
            <lucide-icon [name]="tab.icon" class="tab-icon" aria-hidden="true"></lucide-icon>
          }
          <span class="tab-label">{{ tab.label }}</span>
          @if (tab.badge !== undefined) {
            <span class="tab-badge">{{ tab.badge }}</span>
          }
          <div class="active-indicator"></div>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 6px;
        border-radius: var(--radius-lg);
        background: var(--bg-tertiary);
        border: 1px solid var(--border-soft);
        width: fit-content;
        box-shadow: var(--shadow-md);
      }

      .tab-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0.75rem 1.25rem;
        background: transparent;
        border: none;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        cursor: pointer;
        transition: all 0.4s var(--transition-spring);
        color: var(--text-muted);
        font-family: var(--font-display);
        position: relative;
        overflow: hidden;
      }

      .tab-item:hover {
        color: var(--text-primary);
        background: var(--brand-ambient);
        transform: translateY(-1px);
      }

      .tab-item.active {
        color: #fff;
        background: var(--brand);
        box-shadow: 
          0 10px 25px -5px var(--brand-glow),
          inset 0 1px 1px rgba(255, 255, 255, 0.2);
        transform: scale(1.02);
      }

      .tab-icon {
        width: 1.2rem;
        height: 1.2rem;
        color: currentColor;
      }

      .tab-badge {
        background: var(--brand-ambient-strong);
        padding: 2px 10px;
        border-radius: 100px;
        font-size: 0.65rem;
        font-weight: 900;
        color: #fff;
        margin-left: 6px;
      }

      /* Underline Variant — Modern Sleek */
      .tabs-underline {
        background: transparent;
        border: none;
        padding: 0;
        gap: 24px;
        border-bottom: 2px solid var(--border-soft);
        border-radius: 0;
      }

      .tabs-underline .tab-item {
        border-radius: 0;
        padding: 0.75rem 0.5rem;
        background: transparent !important;
        box-shadow: none !important;
      }

      .tabs-underline .tab-item.active {
        color: var(--brand);
        transform: none;
      }

      .tabs-underline .active-indicator {
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--brand);
        transform: scaleX(0);
        transition: transform 0.4s var(--transition-spring);
        box-shadow: 0 0 15px var(--brand-glow);
        border-radius: 2px 2px 0 0;
      }

      .tabs-underline .tab-item.active .active-indicator {
        transform: scaleX(1);
      }

      /* Pills variant */
      .tabs-pills .tab-list {
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: 4px;
      }

      .tabs-pills .tab-item {
        border-radius: 8px;
      }

      /* Boxed variant */
      .tabs-boxed {
        border-bottom: 1px solid var(--border-soft);
      }

      .tabs-boxed .tab-item {
        border: 1px solid transparent;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
      }

      .tabs-boxed .tab-item.active {
        background: var(--bg-secondary);
        border-color: var(--border-soft);
      }

      /* Bordered variant */
      .tabs-bordered {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
      }

      /* Soft variant */
      .tabs-soft .tab-item {
        background: rgba(255, 255, 255, 0.05);
      }

      .tabs-soft .tab-item.active {
        background: rgba(255, 255, 255, 0.1);
      }

      /* Minimal variant */
      .tabs-minimal .tab-item {
        background: transparent;
        border: none;
      }

      /* Icon variant */
      .tabs-icon .tab-item {
        flex-direction: column;
        gap: 4px;
      }

      /* Animated variant */
      .tabs-animated .tab-item.active {
        animation: tabPulse 0.3s ease;
      }

      @keyframes tabPulse {
        0% {
          transform: scale(0.95);
        }
        50% {
          transform: scale(1.02);
        }
        100% {
          transform: scale(1);
        }
      }

      /* Gradient variant */
      .tabs-gradient .tab-list {
        background: linear-gradient(180deg, var(--bg-tertiary), transparent);
      }

      @media (prefers-reduced-motion: reduce) {
        .tab-item {
          transition: none;
        }
        .tab-item.active {
          transform: none;
        }
        .tabs-underline .active-indicator {
          transition: none;
        }
        .tabs-animated .tab-item.active {
          animation: none;
        }
      }

      /* Babooni: pestañas menos “gaming”, alineadas con Biosstel */
      :host-context(html[data-erp-tenant='babooni']) .tabs-default {
        background: color-mix(in srgb, var(--theme-surface, #fffefe) 94%, var(--text-primary) 4%);
        border: 1px solid var(--border-soft, rgba(8, 8, 8, 0.1));
        box-shadow: 0 1px 2px rgba(8, 8, 8, 0.04);
      }

      :host-context(html[data-erp-tenant='babooni']) .tabs-default .tab-item {
        font-size: 0.8125rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0.02em;
        color: var(--text-muted);
      }

      :host-context(html[data-erp-tenant='babooni']) .tabs-default .tab-item:hover {
        color: var(--text-primary);
        background: rgba(0, 0, 0, 0.05);
      }

      :host-context(html[data-erp-tenant='babooni']) .tabs-default .tab-item.active {
        color: var(--text-on-brand, #fff);
        background: var(--brand);
        box-shadow: none;
        transform: none;
      }

      :host-context(html[data-erp-tenant='babooni']) .tabs-underline .tab-item {
        font-size: 0.8125rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0.02em;
      }
    `,
  ],
})
export class UiTabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab = '';
  @Input() variant: TabsVariant = 'default';
  @Output() tabChange = new EventEmitter<string>();

  onTabSelect(id: string) {
    this.activeTab = id;
    this.tabChange.emit(id);
  }
}
