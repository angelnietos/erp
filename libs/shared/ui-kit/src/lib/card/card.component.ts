import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.hover-effect]="hover">
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
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px; backdrop-filter: blur(12px); overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-header {
      padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex; justify-content: space-between; align-items: center;
    }
    .card-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: white; }
    .card-body { padding: 24px; }
    .card-footer { padding: 16px 24px; background: rgba(255, 255, 255, 0.01); border-top: 1px solid rgba(255, 255, 255, 0.05); }
    .hover-effect:hover { border-color: rgba(79, 70, 229, 0.4); transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.5); }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() hover = false;
  
  hasFooter() { return true; } // Generic for identifying projection later
}
