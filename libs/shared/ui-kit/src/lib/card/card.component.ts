import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'elevated' | 'dark' | 'gradient' | 'glass' | 'bordered' | 'minimal';

@Component({
  selector: 'ui-josanz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class]="'card-' + variant" [class.hover-effect]="hover">
      @if (title) {
        <div class="card-header">
          <h3>{{ title }}</h3>
          <ng-content select="[header-actions]"></ng-content>
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-default {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
    }

    .card-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid var(--theme-border, #E2E8F0);
    }

    .card-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
    }

    .card-ghost {
      background: transparent;
      border: none;
    }

    .card-elevated {
      background: var(--theme-surface, #FFFFFF);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .card-dark {
      background: #1E293B;
      border: 1px solid #334155;
      color: white;
    }

    .card-dark .card-header {
      border-bottom-color: #334155;
    }

    .card-dark .card-header h3 {
      color: white;
    }

    .card-dark .card-footer {
      background: #0F172A;
      border-top-color: #334155;
    }

    .card-gradient {
      background: linear-gradient(135deg, var(--theme-primary, #4F46E5), var(--theme-secondary, #64748B));
      border: none;
      color: white;
    }

    .card-gradient .card-header {
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }

    .card-gradient .card-header h3 {
      color: white;
    }

    .card-gradient .card-footer {
      background: rgba(0, 0, 0, 0.1);
      border-top-color: rgba(255, 255, 255, 0.2);
    }

    .card-glass {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
    }

    .card-bordered {
      background: var(--theme-surface, #FFFFFF);
      border: 2px solid var(--theme-primary, #4F46E5);
    }

    .card-minimal {
      background: var(--theme-surface, #FFFFFF);
      border: none;
      border-radius: 8px;
      box-shadow: none;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--theme-border, #E2E8F0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--theme-text, #1E293B);
    }

    .card-body {
      padding: 24px;
    }

    .card-footer {
      padding: 16px 24px;
      background: var(--theme-background, #F8FAFC);
      border-top: 1px solid var(--theme-border, #E2E8F0);
    }

    .hover-effect:hover {
      border-color: var(--theme-primary, #4F46E5);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() variant: CardVariant = 'default';
  @Input() hover = false;
  
  hasFooter() { return true; }
}
