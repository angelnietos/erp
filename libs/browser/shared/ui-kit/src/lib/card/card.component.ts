import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardColor = 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'brand';
export type CardShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'neumorphic' | 'gradient' | 'minimal';
export type CardVariant = string;

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [ngClass]="['card-color-' + color, 'card-shape-' + shape]"
      [class.card-auto-overrides]="shape === 'auto'"
      [class.hover-effect]="hover || interactive"
      [class.ui-neon]="hover"
    >
      @if (title) {
        <div class="card-header">
          <div class="header-main">
            <h3 class="text-uppercase">{{ title }}</h3>
            <ng-content select="[header-subtitle]"></ng-content>
          </div>
          <div class="header-actions">
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (footer) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .card {
      border-radius: var(--radius-lg);
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-md);
      transition: all 0.6s var(--transition-spring);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      isolation: isolate;
    }

    /* Nintendo Side Accent for Color Variants */
    .card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0; width: 0;
      background: var(--brand);
      transition: width 0.4s var(--transition-spring);
      z-index: 10;
    }

    .card-color-primary::before, .card-color-brand::before { width: 4px; }

    .card-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(to right, rgba(255,255,255,0.03), transparent);
      position: relative;
      z-index: 1;
    }

    .card-header h3 {
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #fff;
      margin: 0;
      font-family: var(--font-display);
    }

    .card-body {
      padding: 2rem;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .hover-effect:hover {
      transform: translateY(-12px) scale(1.02);
      background: var(--bg-tertiary);
      border-color: var(--brand);
      box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), 0 0 30px var(--brand-ambient);
    }
    
    .hover-effect:hover::before { width: 8px; }

    .card-color-brand {
      background: linear-gradient(135deg, var(--brand), var(--brand-muted));
      border: none;
    }
    .card-color-brand h3 { color: #fff; text-shadow: 0 0 10px rgba(0,0,0,0.3); }

    .card-shape-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(30px) saturate(2);
      border-color: rgba(255, 255, 255, 0.08);
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() hover = false;
  @Input() footer = false;
  @Input() interactive = false;

  @Input() color: CardColor = 'default';
  @Input() shape: CardShape = 'auto';

  // Legacy parser mapping the old ad-hoc variants into the new explicit Dual-Tone architecture
  @Input() set variant(val: string) {
    if (['primary', 'secondary', 'danger', 'success', 'warning', 'brand', 'default'].includes(val)) {
      this.color = val as CardColor;
      this.shape = 'auto'; 
    } else if (['glass', 'solid', 'flat', 'neumorphic', 'minimal', 'outline', 'gradient'].includes(val)) {
      this.shape = val as CardShape;
    } else if (val === 'filled') {
      this.shape = 'flat';
    } else if (val === 'bordered') {
      this.shape = 'auto';
      this.color = 'primary';
    } else {
      this.color = 'default';
      this.shape = 'auto';
    }
  }

}
