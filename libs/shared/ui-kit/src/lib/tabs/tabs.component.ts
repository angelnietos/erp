import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

export type TabsVariant = 'default' | 'pills' | 'underline' | 'enclosed' | 'dark' | 'light' | 'primary' | 'ghost';

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
          {{ tab.label }}
          @if (tab.badge) { <span class="tab-badge">{{ tab.badge }}</span> }
        </button>
      }
    </div>
  `,
  styles: [`
    .tabs { 
      display: flex; 
      gap: 4px; 
      padding: 4px; 
      border-radius: 4px; 
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      width: fit-content;
    }

    .tab-item {
      display: flex; 
      align-items: center; 
      gap: 10px; 
      padding: 8px 18px;
      background: transparent; 
      border: 1px solid transparent; 
      border-radius: 2px;
      font-size: 0.75rem; 
      font-weight: 800; 
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--text-secondary);
      font-family: var(--font-display);
      position: relative;
    }

    .tab-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.03);
    }

    .tab-item.active {
      background: var(--bg-secondary);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 2px;
      background: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .tab-icon { width: 16px; height: 16px; transition: transform 0.3s ease; color: var(--text-muted); }
    .tab-item.active .tab-icon { color: var(--brand); }
    .tab-item:hover .tab-icon { transform: scale(1.1); color: #fff; }

    .tab-badge {
      background: var(--brand); 
      padding: 1px 6px;
      border-radius: 2px; 
      font-size: 0.65rem; 
      font-weight: 950;
      color: #fff;
      box-shadow: 0 0 10px var(--brand-glow);
    }
    
    /* Variant Modifiers */
    .tabs-underline {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-soft);
      border-radius: 0;
      padding: 0;
      width: 100%;
      gap: 20px;
    }
    
    .tabs-underline .tab-item { border-radius: 0; padding: 12px 10px; }
    .tabs-underline .tab-item.active { background: transparent; color: var(--brand); box-shadow: none; border: none; }
    .tabs-underline .tab-item.active::after { bottom: 0; width: 100%; height: 3px; }

    .tabs-pills { background: transparent; border: none; gap: 10px; }
    .tabs-pills .tab-item { border-radius: 4px; background: var(--bg-tertiary); border: 1px solid var(--border-soft); }
    .tabs-pills .tab-item.active { background: var(--brand); border-color: var(--brand); box-shadow: 0 0 20px var(--brand-glow); }
    .tabs-pills .tab-item.active::after { display: none; }

    .tabs-ghost { background: transparent; border: none; }
    .tabs-ghost .tab-item.active { background: rgba(255, 255, 255, 0.05); border-color: var(--border-soft); box-shadow: none; }
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
