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
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      position: relative;
    }

    .card-default {
      background: var(--bg-secondary);
    }

    .card-filled {
      background: var(--bg-tertiary);
    }

    .card-outlined {
      background: transparent;
      border: 1px solid var(--border-vibrant);
    }

    .card-ghost {
      background: transparent;
      border: none;
    }

    .card-elevated {
      background: var(--bg-secondary);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .card-dark {
      background: #000;
      border: 1px solid #222;
    }

    .card-gradient {
      background: linear-gradient(135deg, #1e1b4b, #000);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-glass {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-bordered {
      border-left: 4px solid var(--brand);
    }

    .card-minimal {
      background: transparent;
      border: 1px solid var(--border-soft);
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #fff;
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid var(--border-soft);
    }

    .hover-effect:hover {
      border-color: var(--brand);
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
    }
    
    .hover-effect::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--brand);
      transform: scaleX(0);
      transition: transform 0.3s ease;
      transform-origin: left;
    }
    
    .hover-effect:hover::after {
      transform: scaleX(1);
    }
  `],
})
export class UiCardComponent {
  @Input() title?: string;
  @Input() variant: CardVariant = 'default';
  @Input() hover = false;
  
  hasFooter() { return true; }
}
