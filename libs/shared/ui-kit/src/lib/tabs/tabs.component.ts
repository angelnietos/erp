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
    .tabs { display: flex; gap: 4px; padding: 4px; border-radius: 12px; }

    /* Default Variant */
    .tabs-default {
      background: rgba(255,255,255,0.03);
    }
    .tabs-default .tab-item {
      color: #94A3B8;
    }
    .tabs-default .tab-item:hover {
      color: #E2E8F0;
      background: rgba(255,255,255,0.05);
    }
    .tabs-default .tab-item.active {
      background: #4F46E5;
      color: white;
    }

    /* Pills Variant */
    .tabs-pills {
      background: transparent;
      gap: 8px;
      padding: 0;
    }
    .tabs-pills .tab-item {
      background: transparent;
      border-radius: 8px;
      color: var(--theme-text, #1E293B);
    }
    .tabs-pills .tab-item:hover {
      background: var(--theme-border, #E2E8F0);
    }
    .tabs-pills .tab-item.active {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }

    /* Underline Variant */
    .tabs-underline {
      background: transparent;
      padding: 0;
      gap: 0;
      border-bottom: 1px solid var(--theme-border, #E2E8F0);
    }
    .tabs-underline .tab-item {
      background: transparent;
      border-radius: 0;
      color: var(--theme-text-muted, #64748B);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .tabs-underline .tab-item:hover {
      color: var(--theme-text, #1E293B);
      background: transparent;
    }
    .tabs-underline .tab-item.active {
      background: transparent;
      color: var(--theme-primary, #4F46E5);
      border-bottom-color: var(--theme-primary, #4F46E5);
    }

    /* Enclosed Variant */
    .tabs-enclosed {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid var(--theme-border, #E2E8F0);
      border-radius: 8px;
    }
    .tabs-enclosed .tab-item {
      background: transparent;
      color: var(--theme-text-muted, #64748B);
    }
    .tabs-enclosed .tab-item:hover {
      color: var(--theme-text, #1E293B);
    }
    .tabs-enclosed .tab-item.active {
      background: var(--theme-surface, #FFFFFF);
      color: var(--theme-primary, #4F46E5);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Dark Variant */
    .tabs-dark {
      background: #1E293B;
    }
    .tabs-dark .tab-item {
      color: #94A3B8;
      background: transparent;
    }
    .tabs-dark .tab-item:hover {
      color: #E2E8F0;
      background: rgba(255,255,255,0.05);
    }
    .tabs-dark .tab-item.active {
      background: #334155;
      color: white;
    }

    /* Light Variant */
    .tabs-light {
      background: #F1F5F9;
    }
    .tabs-light .tab-item {
      color: #64748B;
      background: transparent;
    }
    .tabs-light .tab-item:hover {
      color: #1E293B;
      background: rgba(255,255,255,0.5);
    }
    .tabs-light .tab-item.active {
      background: white;
      color: #1E293B;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    /* Primary Variant */
    .tabs-primary {
      background: rgba(79, 70, 229, 0.1);
    }
    .tabs-primary .tab-item {
      color: #6366F1;
      background: transparent;
    }
    .tabs-primary .tab-item:hover {
      background: rgba(79, 70, 229, 0.2);
    }
    .tabs-primary .tab-item.active {
      background: #4F46E5;
      color: white;
    }

    /* Ghost Variant */
    .tabs-ghost {
      background: transparent;
      padding: 0;
      gap: 2px;
    }
    .tabs-ghost .tab-item {
      background: transparent;
      color: var(--theme-text-muted, #64748B);
      border-radius: 6px;
    }
    .tabs-ghost .tab-item:hover {
      color: var(--theme-text, #1E293B);
      background: var(--theme-border, #E2E8F0);
    }
    .tabs-ghost .tab-item.active {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }

    /* Common Tab Item Styles */
    .tab-item {
      display: flex; align-items: center; gap: 8px; padding: 10px 20px;
      background: transparent; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
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
  @Input() variant: TabsVariant = 'default';
  @Output() tabChange = new EventEmitter<string>();

  onTabSelect(id: string) {
    this.activeTab = id;
    this.tabChange.emit(id);
  }
}
