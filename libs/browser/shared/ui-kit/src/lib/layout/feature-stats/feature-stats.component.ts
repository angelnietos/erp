import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-feature-stats',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="stats-wrapper" [class.is-collapsed]="isCollapsed()">
      <div class="stats-header">
        <div class="header-line"></div>
        <button
          type="button"
          class="collapse-btn"
          [attr.aria-expanded]="!isCollapsed()"
          (click)="toggleCollapse()"
        >
          <lucide-icon [name]="isCollapsed() ? 'chevron-down' : 'chevron-up'" size="14"></lucide-icon>
          <span>{{ isCollapsed() ? 'Mostrar métricas' : 'Ocultar métricas' }}</span>
        </button>
        <div class="header-line"></div>
      </div>
      
      <div class="stats-container">
        <div class="stats-grid">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0 clamp(1rem, 2.5vw, 2rem);
    }

    .stats-wrapper {
      margin-bottom: 2rem;
      transition: all 0.5s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
    }

    .stats-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }

    .stats-header:hover {
      opacity: 1;
    }

    .header-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-soft), transparent);
    }

    .collapse-btn {
      background: var(--surface);
      border: 1px solid var(--border-soft);
      border-radius: 20px;
      padding: 4px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }

    .collapse-btn:hover {
      background: var(--surface-hover);
      color: var(--brand);
      border-color: var(--brand);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .stats-container {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 0.5s var(--ease-out-expo);
      overflow: hidden;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      min-height: 0;
      padding: 0.5rem 0;
    }

    .stats-wrapper.is-collapsed .stats-container {
      grid-template-rows: 0fr;
    }

    .stats-wrapper.is-collapsed .stats-grid {
      visibility: hidden;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.4s ease;
    }

    .stats-wrapper:not(.is-collapsed) .stats-grid {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
      transition: all 0.5s var(--ease-out-expo);
    }

    :host-context(html[data-erp-tenant='babooni']) {
      padding: 0 clamp(0.75rem, 2vw, 1.25rem);
    }

    :host-context(html[data-erp-tenant='babooni']) .stats-wrapper {
      margin-bottom: 1.25rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .stats-grid {
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    :host-context(html[data-erp-tenant='babooni']) .collapse-btn {
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: color-mix(in srgb, var(--text-primary, #080808) 82%, var(--text-muted, #646464));
    }
  `]
})
export class UiFeatureStatsComponent {
  private readonly STORAGE_KEY = 'josanz-stats-collapsed';
  
  readonly isCollapsed = signal(this.getInitialState());

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isCollapsed()));
    });
  }

  private getInitialState(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}
