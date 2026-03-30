import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-josanz-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="stat-card ui-glass ui-neon" [class.accent]="accent">
      <div class="stat-icon-wrapper">
        <lucide-icon [name]="icon" size="24"></lucide-icon>
      </div>
      <div class="stat-content">
        <span class="stat-label text-uppercase">{{ label }}</span>
        <div class="stat-value-row">
          <h2 class="stat-value">{{ value }}</h2>
          @if (trend !== undefined) {
            <span class="stat-trend" [class.up]="trend > 0" [class.down]="trend < 0">
              {{ trend > 0 ? '+' : '' }}{{ trend }}%
            </span>
          }
        </div>
      </div>
      @if (accent) { <div class="accent-line"></div> }
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.75rem;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .stat-icon-wrapper {
      width: 3.5rem;
      height: 3.5rem;
      background: var(--brand-surface, color-mix(in srgb, var(--brand) 14%, transparent));
      border: 1px solid var(--brand-border-soft, color-mix(in srgb, var(--brand) 32%, transparent));
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
      box-shadow: var(--shadow-inset-shine, inset 0 1px 0 rgba(255, 255, 255, 0.08));
    }

    .stat-content { display: flex; flex-direction: column; gap: 0.25rem; }
    
    .stat-label { font-size: 0.7rem; color: var(--text-secondary); opacity: 0.8; }
    
    .stat-value-row { display: flex; align-items: baseline; gap: 0.75rem; }
    
    .stat-value { font-size: 2rem; font-weight: 900; margin: 0; font-family: var(--font-display); }
    
    .stat-trend { font-size: 0.75rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
    .stat-trend.up { background: rgba(0, 210, 138, 0.1); color: var(--success); }
    .stat-trend.down { background: rgba(255, 75, 75, 0.1); color: var(--danger); }

    .accent-line {
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: var(--brand);
    }
  `],
})
export class UiStatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() icon = 'package';
  @Input() trend?: number;
  @Input() accent = false;
}
