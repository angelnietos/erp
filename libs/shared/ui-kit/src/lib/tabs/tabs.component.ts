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
      gap: 6px; 
      padding: 6px; 
      border-radius: 8px; 
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      width: fit-content;
    }

    .tab-item {
      display: flex; 
      align-items: center; 
      gap: 10px; 
      padding: 10px 20px;
      background: transparent; 
      border: none; 
      border-radius: 6px;
      font-size: 0.85rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
      background: var(--brand);
      color: #fff;
      box-shadow: 0 4px 15px -5px var(--brand-glow);
    }

    .tab-icon { width: 18px; height: 18px; transition: transform 0.3s ease; }
    .tab-item:hover .tab-icon { transform: scale(1.1); }

    .tab-badge {
      background: rgba(255, 255, 255, 0.15); 
      padding: 2px 8px;
      border-radius: 4px; 
      font-size: 0.7rem; 
      font-weight: 900;
    }
    
    /* Variant Modifiers */
    .tabs-underline {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-soft);
      border-radius: 0;
      padding: 0;
      width: 100%;
    }
    
    .tabs-underline .tab-item {
      border-radius: 0;
    }
    
    .tabs-underline .tab-item.active {
      background: transparent;
      color: var(--brand);
      box-shadow: none;
    }
    
    .tabs-underline .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .tabs-pills {
      background: transparent;
      border: none;
      gap: 12px;
    }
    
    .tabs-pills .tab-item {
      border-radius: 999px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
    }
    
    .tabs-pills .tab-item.active {
      background: var(--brand);
      border-color: var(--brand);
    }

    .tabs-enclosed {
      background: #000;
      border-color: #222;
    }

    .tabs-dark {
      background: #000;
    }
    
    .tabs-ghost {
      background: transparent;
      border: none;
    }
    
    .tabs-primary .tab-item.active {
      background: var(--brand);
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
