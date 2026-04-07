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
        <lucide-icon [name]="icon" size="20"></lucide-icon>
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
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition:
        transform 0.4s var(--ease-out-expo),
        box-shadow 0.4s var(--ease-out-expo),
        background 0.4s var(--ease-out-expo);
      background: var(--card-bg);
      border: var(--card-border-width, 1px) solid var(--card-border);
      box-shadow: var(--card-shadow), var(--shadow-inset-shine);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg), 0 0 40px -10px var(--brand-glow);
    }

    .stat-icon-wrapper {
      width: 3.25rem;
      height: 3.25rem;
      background: linear-gradient(
        145deg,
        var(--brand-surface),
        rgba(255, 255, 255, 0.04)
      );
      border: 1px solid var(--brand-border-soft);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
      box-shadow: var(--shadow-inset-shine);
      transition: all 0.4s var(--ease-out-expo);
    }

    .stat-card:hover .stat-icon-wrapper {
      transform: scale(1.1) rotate(-8deg);
      background: var(--brand);
      color: #fff;
      box-shadow: 0 0 20px var(--brand-glow);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex: 1;
    }

    .stat-label {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-family: var(--font-display);
    }

    .stat-value-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 900;
      margin: 0;
      font-family: var(--font-display);
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }

    .stat-trend {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 2rem;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .stat-trend.up {
      background: rgba(var(--success-rgb, 0, 242, 173), 0.1);
      color: var(--success);
      border: 1px solid rgba(var(--success-rgb, 0, 242, 173), 0.2);
    }

    .stat-trend.down {
      background: rgba(var(--danger-rgb, 255, 94, 108), 0.1);
      color: var(--danger);
      border: 1px solid rgba(var(--danger-rgb, 255, 94, 108), 0.2);
    }

    .accent-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
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
