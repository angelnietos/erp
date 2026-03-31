import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardColor = 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'brand';
export type CardShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'neumorphic' | 'gradient' | 'minimal';
export type CardVariant = string;

@Component({
  selector: 'ui-josanz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="card" 
      [class]="'card-color-' + color"
      [class]="'card-shape-' + shape"
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
    .card {
      /* Base Structural inheritance from DOM mixins dynamically configured by active Theme! */
      border-radius: var(--radius-lg, 12px);
      background: var(--card-bg, var(--surface, #1a1a24));
      border: var(--card-border-width, 1px) solid var(--card-border, var(--border-soft, #333));
      box-shadow: var(--card-shadow, var(--shadow-md)), var(--shadow-inset-shine);
      transition: all var(--transition-base, 0.3s ease);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* COLOR THEMATIC TOKENS */
    .card-color-default { --card-bg: var(--surface); --card-border: var(--border-soft); }
    .card-color-primary { --card-bg: color-mix(in srgb, var(--brand) 15%, transparent); --card-border: color-mix(in srgb, var(--brand) 40%, transparent); }
    .card-color-brand { --card-bg: linear-gradient(135deg, var(--brand) 0%, var(--brand-muted) 100%); --card-border: transparent; color: white; }
    .card-color-danger { --card-bg: rgba(239, 68, 68, 0.1); --card-border: rgba(239, 68, 68, 0.3); }
    .card-color-success { --card-bg: rgba(16, 185, 129, 0.1); --card-border: rgba(16, 185, 129, 0.3); }
    .card-color-warning { --card-bg: rgba(245, 158, 11, 0.1); --card-border: rgba(245, 158, 11, 0.3); }
    .card-color-info { --card-bg: rgba(59, 130, 246, 0.1); --card-border: rgba(59, 130, 246, 0.3); }

    /* STRUCTURAL SHAPES overrides */
    .card-shape-auto {
      /* Automatically morphs with the theme (inheriting variables natively) */
    }
    
    .card-shape-solid {
      --card-bg: var(--bg-secondary);
      --card-border: var(--border-soft);
      --card-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .card-shape-glass {
      --card-bg: color-mix(in srgb, var(--surface) 80%, transparent);
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      --card-border: var(--border-vibrant);
    }
    .card-shape-flat {
      --card-bg: var(--bg-tertiary);
      --card-border-width: 0px;
      --card-shadow: none;
    }
    .card-shape-outline {
      --card-bg: transparent;
      --card-border-width: 2px;
      --card-border: var(--border-soft);
      --card-shadow: none;
    }
    .card-shape-neumorphic {
      --card-bg: var(--bg-primary);
      --card-border-width: 0px;
      --card-shadow: -8px -8px 16px rgba(255,255,255,0.02), 8px 8px 16px rgba(0,0,0,0.6);
      border-radius: 20px;
    }
    .card-shape-minimal {
      --card-bg: transparent;
      --card-border-width: 0px;
      --card-shadow: none;
      border-radius: 0px;
      border-bottom: 1px solid var(--border-soft);
    }
    .card-shape-gradient {
      --card-bg: linear-gradient(135deg, var(--bg-secondary), color-mix(in srgb, var(--brand) 10%, transparent));
      --card-border: color-mix(in srgb, var(--brand) 20%, transparent);
    }

    .card-header {
      padding: 0.85rem 1.25rem;
      border-bottom: var(--card-border-width, 1px) solid var(--card-border, var(--border-soft));
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.015);
    }

    .header-main { display: flex; flex-direction: column; gap: 0.25rem; }

    .card-header h3 {
      font-size: 0.62rem;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin: 0;
    }

    .card-body {
      padding: 1.1rem;
      flex: 1;
    }

    .card-footer {
      padding: 0.8rem 1.1rem;
      background: color-mix(in srgb, var(--bg-primary) 50%, transparent);
      border-top: var(--card-border-width, 1px) solid var(--card-border, var(--border-soft));
    }

    .hover-effect { cursor: pointer; }
    .hover-effect:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      --card-border: var(--brand);
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
