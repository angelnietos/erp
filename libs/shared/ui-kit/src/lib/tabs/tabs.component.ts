import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
}

@Component({
  selector: 'ui-josanz-tabs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="tabs">
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
    .tabs { display: flex; gap: 4px; padding: 4px; background: rgba(255,255,255,0.03); border-radius: 12px; }
    .tab-item {
      display: flex; align-items: center; gap: 8px; padding: 10px 20px;
      background: transparent; border: none; border-radius: 8px;
      color: #94A3B8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .tab-item:hover { color: #E2E8F0; background: rgba(255,255,255,0.05); }
    .tab-item.active { background: #4F46E5; color: white; }
    .tab-icon { width: 18px; height: 18px; }
    .tab-badge {
      background: rgba(255,255,255,0.15); padding: 2px 8px;
      border-radius: 10px; font-size: 11px; font-weight: 600;
    }
    .tab-item.active .tab-badge { background: rgba(255,255,255,0.25); }
  `],
})
export class UiTabsComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabSelect(id: string) {
    this.activeTab = id;
    this.tabChange.emit(id);
  }
}
