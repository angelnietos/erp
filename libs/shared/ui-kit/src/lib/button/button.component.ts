import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-josanz-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      [type]="type" 
      class="btn"
      [class]="'btn-' + variant + ' btn-' + size"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        <ng-content></ng-content>
        @if (icon && getIconName()) { <lucide-icon [name]="getIconName()" class="btn-icon"></lucide-icon> }
      }
    </button>
  `,
  styles: [`
    .btn {
      position: relative;
      border: none;
      border-radius: 8px; /* Slightly sharper for a more 'pro' game look */
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      font-family: var(--font-display, inherit);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      overflow: hidden;
      white-space: nowrap;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      transition: 0.5s;
    }

    .btn:hover::before {
      left: 100%;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .btn:active:not(:disabled) {
      transform: scale(0.96);
    }

    /* Sizes */
    .btn-sm {
      padding: 10px 18px;
      font-size: 0.75rem;
    }
    .btn-md {
      padding: 14px 24px;
      font-size: 0.875rem;
    }
    .btn-lg {
      padding: 18px 36px;
      font-size: 1rem;
    }

    /* Variants */
    .btn-primary {
      background: var(--brand);
      color: white;
      box-shadow: 0 4px 15px -5px var(--brand-glow);
    }
    .btn-primary:hover:not(:disabled) {
      background: #ff4d4d;
      box-shadow: 0 8px 25px -5px var(--brand-glow);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-vibrant);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--surface-hover);
      border-color: var(--text-secondary);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--brand);
      color: var(--brand);
    }
    .btn-outline:hover:not(:disabled) {
      background: var(--brand);
      color: white;
      box-shadow: 0 0 20px var(--brand-glow);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }
    .btn-ghost:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .btn-danger {
      background: var(--danger);
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      filter: brightness(1.2);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    }

    .btn-success {
      background: var(--success);
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      filter: brightness(1.2);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    }

    .btn-warning {
      background: var(--warning);
      color: white;
    }

    .btn-info {
      background: var(--info);
      color: white;
    }

    .btn-light {
      background: rgba(255, 255, 255, 0.9);
      color: var(--bg-primary);
    }

    .btn-dark {
      background: #000;
      color: white;
      border: 1px solid #333;
    }

    .btn-icon {
      width: 1.2em;
      height: 1.2em;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: rotate 0.8s infinite linear;
    }
    
    @keyframes rotate { 
      to { transform: rotate(360deg); } 
    }
  `],
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon: string | { name: string } = '';
  @Output() clicked = new EventEmitter<Event>();

  getIconName(): string | undefined {
    if (!this.icon) return undefined;
    if (typeof this.icon === 'string') return this.icon;
    return this.icon.name || undefined;
  }
}
