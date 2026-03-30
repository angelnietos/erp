import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export type TabsVariant = 'default' | 'underline' | 'pills' | 'boxed' | 'bordered' | 'soft' | 'minimal' | 'icon' | 'animated' | 'gradient';

@Component({
  selector: 'ui-josanz-tabs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="tabs" [class]="'tabs-' + variant">
      @for (tab of tabs; track tab.id) {
        <button 
          class="tab-item" 
          [class.active]="activeTab === tab.id"
          (click)="onTabSelect(tab.id)"
        >
          @if (tab.icon) { <lucide-icon [name]="tab.icon" class="tab-icon"></lucide-icon> }
          <span class="tab-label">{{ tab.label }}</span>
          @if (tab.badge !== undefined) { <span class="tab-badge">{{ tab.badge }}</span> }
          <div class="active-indicator"></div>
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; }

    .tabs { 
      display: flex; 
      gap: 4px; 
      padding: 4px; 
      border-radius: var(--radius-md); 
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      width: fit-content;
    }

    .tab-item {
      display: flex; 
      align-items: center; 
      gap: 6px; 
      padding: 0.45rem 0.75rem;
      background: transparent; 
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.58rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer; 
      transition: var(--transition-base);
      color: var(--text-secondary);
      font-family: var(--font-display);
      position: relative;
      overflow: hidden;
    }

    .tab-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.03);
    }

    .tab-item.active {
      color: #fff;
      background: linear-gradient(180deg, color-mix(in srgb, var(--brand) 90%, #fff) 0%, var(--brand) 100%);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.2) inset,
        0 8px 28px -8px var(--brand-glow);
    }

    .tab-label { position: relative; z-index: 10; }

    .tab-icon { width: 1.1rem; height: 1.1rem; color: currentColor; position: relative; z-index: 10; }

    .tab-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 0.6rem;
      font-weight: 900;
      color: #fff;
      margin-left: 4px;
      position: relative;
      z-index: 10;
    }
    
    /* Underline Variant */
    .tabs-underline {
      background: transparent;
      border: none;
      padding: 0;
      gap: 12px;
      border-bottom: 1px solid var(--border-soft);
      border-radius: 0;
      width: 100%;
    }

    .tabs-underline .tab-item { 
      border-radius: 0; 
      padding: 0.5rem 0.35rem; 
      background: transparent !important;
      color: var(--text-secondary);
      box-shadow: none !important;
    }

    .tabs-underline .tab-item:hover { color: #fff; }

    .tabs-underline .tab-item.active { color: var(--brand); }

    .tabs-underline .active-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--brand);
      transform: scaleX(0);
      transition: var(--transition-spring);
      box-shadow: 0 0 10px var(--brand-glow);
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
      0% { transform: scale(0.95); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    /* Gradient variant */
    .tabs-gradient .tab-list {
      background: linear-gradient(180deg, var(--bg-tertiary), transparent);
    }
  `],
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
