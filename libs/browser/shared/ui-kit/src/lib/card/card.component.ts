import { Component, Input, Output, EventEmitter } from '@angular/core';
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
      [attr.role]="interactive ? 'button' : null"
      [attr.tabindex]="interactive ? '0' : null"
      [attr.aria-label]="interactive && title ? title : null"
      (click)="interactive ? handleCardInteraction($event) : null"
      (keydown.enter)="interactive ? handleCardInteraction($event) : null"
      (keydown.space)="interactive ? handleCardInteraction($event) : null"
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
      /* Structural tokens injected via JS in ThemeService.applyStructuralTokens() */
      border-radius: var(--card-radius, var(--radius-lg, 12px));
      background: var(--card-bg, var(--surface));
      border: var(--card-border-width, 1px) solid var(--card-border, var(--border-soft));
      box-shadow: var(--card-shadow, var(--shadow-sm)), var(--shadow-inset-shine);
      transition:
        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
        border-color 0.35s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      isolation: isolate;
    }

    .card::before {
      content: '';
      position: absolute;
      inset: 0 0 auto 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0),
        color-mix(in srgb, var(--brand) 60%, transparent),
        #ffffff,
        color-mix(in srgb, var(--brand) 60%, transparent),
        rgba(255,255,255,0),
        transparent
      );
      opacity: 0.8;
      pointer-events: none;
      z-index: 1;
    }

    /* shape-auto: picks up all tokens from ThemeService */
    .card-shape-auto {
      border-radius: var(--card-radius, var(--radius-lg, 12px));
      background: var(--card-bg, var(--surface));
      border: var(--card-border-width, 1px) solid var(--card-border, var(--border-soft));
      box-shadow: var(--card-shadow, var(--shadow-md, 0 4px 20px rgba(0,0,0,0.3))), var(--shadow-inset-shine, none);
    }

    /* COLOR THEMATIC TOKENS */
    .card-color-default { --card-bg: var(--surface); --card-border: var(--border-soft); }
    .card-color-primary { --card-bg: color-mix(in srgb, var(--brand) 15%, transparent); --card-border: color-mix(in srgb, var(--brand) 40%, transparent); }
    .card-color-brand { --card-bg: linear-gradient(135deg, var(--brand) 0%, var(--brand-muted) 100%); --card-border: transparent; color: white; }
    .card-color-danger { --card-bg: rgba(239, 68, 68, 0.1); --card-border: rgba(239, 68, 68, 0.3); }
    .card-color-success { --card-bg: rgba(16, 185, 129, 0.1); --card-border: rgba(16, 185, 129, 0.3); }
    .card-color-warning { --card-bg: rgba(245, 158, 11, 0.1); --card-border: rgba(245, 158, 11, 0.3); }
    .card-color-info { --card-bg: rgba(59, 130, 246, 0.1); --card-border: rgba(59, 130, 246, 0.3); }

    /* STRUCTURAL SHAPES overrides - Cleaned up to use global tokens preferred by ThemeService */
    .card-shape-auto {
      border-radius: var(--radius-lg);
      background: var(--card-bg);
      border: var(--card-border-width) solid var(--card-border);
      box-shadow: var(--card-shadow), var(--shadow-inset-shine);
    }
    
    .card-shape-solid {
      --card-bg: var(--bg-tertiary);
      --card-border: var(--brand);
      --card-radius: 0px;
      --card-border-width: 2px;
      --card-shadow: 4px 4px 0px rgba(0,0,0,0.6);
    }

    .card-shape-glass {
      --card-bg: var(--surface);
      backdrop-filter: blur(var(--variant-blur)); -webkit-backdrop-filter: blur(var(--variant-blur));
      --card-border: var(--border-vibrant);
    }

    .card-shape-flat {
      --card-bg: var(--bg-secondary);
      --card-border: var(--text-primary);
      --card-border-width: 3px;
      --card-radius: 0px;
      --card-shadow: none;
    }

    .card-shape-minimal {
      --card-bg: transparent;
      --card-border-width: 0px;
      --card-shadow: none;
      --card-radius: 0px;
      border-bottom: 2px solid var(--border-soft) !important;
    }

    .card-shape-neumorphic {
      --card-bg: var(--bg-primary);
      --card-border-width: 0px;
      --card-shadow: var(--shadow-md);
      --card-radius: 40px;
    }

    .card-header {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: color-mix(in srgb, var(--surface) 70%, var(--brand) 4%);
    }
    .card-body {
      padding: var(--space-3);
      flex: 1;
    }
    .card-footer {
      padding: var(--space-3) var(--space-4);
      background: color-mix(in srgb, var(--surface) 60%, transparent);
      border-top: 1px solid var(--border-soft);
    }

    .header-main { display: flex; flex-direction: column; gap: 0.25rem; }

    .card-header h3 {
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin: 0;
    }

    .card-body {
      padding: var(--space-4);
      flex: 1;
    }

    .card-footer {
      padding: var(--space-4) var(--space-5);
      background: color-mix(in srgb, var(--surface) 60%, transparent);
      border-top: 1px solid var(--border-soft);
    }

    .hover-effect { cursor: pointer; }
    .hover-effect:hover {
      transform: translateY(-8px) scale(1.005);
      box-shadow:
        0 35px 70px rgba(0, 0, 0, 0.45),
        0 0 45px -15px var(--brand-glow, rgba(255, 255, 255, 0.12));
      --card-border: color-mix(in srgb, var(--brand) 65%, var(--border-soft));
    }

    .hover-effect:hover::before {
      opacity: 1;
      height: 3px;
    }

    /* Mobile touch improvements */
    @media (hover: none) and (pointer: coarse) {
      .hover-effect {
        transform: none !important;
        box-shadow: var(--shadow-sm) !important;
      }

      .hover-effect:active {
        transform: scale(0.98);
        transition-duration: 0.1s;
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .card {
        margin-bottom: var(--space-3);
      }

      .card-header {
        padding: var(--space-3) var(--space-4);
      }

      .card-body {
        padding: var(--space-3);
      }

      .card-footer {
        padding: var(--space-3) var(--space-4);
      }

      .hover-effect:focus-visible {
        outline: 3px solid var(--brand);
        outline-offset: 4px;
      }
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() hover = false;
  @Input() footer = false;
  @Input() interactive = false;

  @Output() cardClick = new EventEmitter<Event>();

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

  handleCardInteraction(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.cardClick.emit(event);
  }

}
