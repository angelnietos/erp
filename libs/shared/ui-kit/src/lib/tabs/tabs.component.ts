import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export type TabsVariant = 'default' | 'underline';

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
    .tabs { 
      display: flex; 
      gap: 8px; 
      padding: 6px; 
      border-radius: var(--radius-lg); 
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      width: fit-content;
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
      letter-spacing: 0.08em;
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
      background: var(--brand);
      box-shadow: 0 4px 15px -5px var(--brand-glow);
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
      gap: 24px;
      border-bottom: 1px solid var(--border-soft);
      border-radius: 0;
      width: 100%;
    }

    .tabs-underline .tab-item { 
      border-radius: 0; 
      padding: 1rem 0.5rem; 
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
