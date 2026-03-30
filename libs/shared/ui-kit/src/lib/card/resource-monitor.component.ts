import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface ResourceItem {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'error';
  value: number;
  label: string;
  icon?: string;
}

@Component({
  selector: 'ui-josanz-resource-monitor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="resource-monitor ui-glass ui-neon">
      <div class="monitor-header">
        <h3 class="text-uppercase">{{ title }}</h3>
        <span class="status-indicator" [class]="globalStatus">
          {{ globalStatus === 'ok' ? 'EN LÍNEA' : globalStatus === 'warning' ? 'SISTEMA ALERTA' : 'SISTEMA CRÍTICO' }}
        </span>
      </div>
      
      <div class="resource-list">
        @for (item of items; track item.id) {
          <div class="resource-item">
            <div class="item-info">
              <div class="item-label-group">
                @if (item.icon) { <lucide-icon [name]="item.icon" size="14"></lucide-icon> }
                <span class="item-name">{{ item.name }}</span>
              </div>
              <span class="item-status-text" [class]="item.status">{{ item.label }}</span>
            </div>
            
            <div class="progress-container">
              <div class="progress-bar" 
                   [class]="item.status"
                   [style.width.%]="item.value">
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .resource-monitor {
      padding: 1.5rem;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-soft);
      padding-bottom: 0.75rem;
    }

    .monitor-header h3 { font-size: 0.8rem; color: var(--text-secondary); opacity: 0.8; }

    .status-indicator {
      font-size: 0.6rem;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid currentColor;
    }
    .status-indicator.ok { color: var(--success); background: rgba(0, 210, 138, 0.05); }
    .status-indicator.warning { color: var(--warning); background: rgba(255, 184, 0, 0.05); }
    .status-indicator.error { color: var(--danger); background: rgba(255, 75, 75, 0.05); }

    .resource-list { display: flex; flex-direction: column; gap: 1.25rem; }

    .resource-item { display: flex; flex-direction: column; gap: 0.5rem; }

    .item-info { display: flex; justify-content: space-between; align-items: baseline; }
    
    .item-label-group { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); }
    .item-name { font-size: 0.8rem; font-weight: 700; }
    
    .item-status-text { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
    .item-status-text.ok { color: var(--success); }
    .item-status-text.warning { color: var(--warning); }
    .item-status-text.error { color: var(--danger); }

    .progress-container { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.03); border-radius: 3px; overflow: hidden; }
    
    .progress-bar { height: 100%; border-radius: 3px; transition: width 0.5s var(--transition-spring); position: relative; }
    .progress-bar.ok { background: var(--success); box-shadow: 0 0 10px var(--success); }
    .progress-bar.warning { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
    .progress-bar.error { background: var(--danger); box-shadow: 0 0 10px var(--danger); }
  `],
})
export class UiResourceMonitorComponent {
  @Input() title = 'MONITOR DEL SISTEMA';
  @Input() items: ResourceItem[] = [];

  get globalStatus(): 'ok' | 'warning' | 'error' {
    if (this.items.some(i => i.status === 'error')) return 'error';
    if (this.items.some(i => i.status === 'warning')) return 'warning';
    return 'ok';
  }
}
