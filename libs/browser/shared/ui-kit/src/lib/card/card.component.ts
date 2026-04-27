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
      background: var(--surface);
      border: 1px solid var(--border-vibrant);
      box-shadow: var(--shadow-md), var(--shadow-inset-shine);
      transition: all 0.5s var(--ease-out-expo);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      isolation: isolate;
    }

    /* Cinematic Noise Texture Layer */
    .card::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 0;
      mix-blend-mode: overlay;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
      position: relative;
      z-index: 1;
    }

    .card-header h3 {
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 0;
    }

    .card-body {
      padding: 1.5rem;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .hover-effect { cursor: pointer; }
    .hover-effect:hover {
      transform: translateY(-10px) scale(1.01);
      box-shadow: var(--shadow-lg), 0 0 40px var(--brand-ambient);
      border-color: rgba(255, 255, 255, 0.3);
    }

    /* COLOR THEMATIC TOKENS */
    .card-color-primary { --border-vibrant: color-mix(in srgb, var(--brand) 40%, transparent); }
    .card-color-brand { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-muted) 100%); border: none; }

    /* SHAPES */
    .card-shape-glass {
      background: var(--surface);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .card-shape-solid {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
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
