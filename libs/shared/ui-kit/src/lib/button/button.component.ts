import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'glass' | 'filled';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-josanz-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      [type]="type" 
      class="btn"
      [class.btn-primary]="variant === 'primary'"
      [class.ui-glass]="variant === 'glass'"
      [class.ui-filled]="variant === 'secondary' || variant === 'filled'"
      [class.ui-ghost]="variant === 'ghost'"
      [class.btn-danger]="variant === 'danger'"
      [class.btn-success]="variant === 'success'"
      [class]="'btn-' + size"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        <ng-content></ng-content>
        @if (getIconName()) { 
          <lucide-icon [name]="getIconName()!" class="btn-icon"></lucide-icon> 
        }
      }
    </button>
  `,
  styles: [`
    .btn {
      position: relative;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      transition: var(--transition-base);
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
      outline: none;
      box-sizing: border-box;
      border: 1px solid transparent;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }

    .btn:active:not(:disabled) { transform: scale(0.94); }

    .btn-sm { padding: 0.6rem 1.25rem; font-size: 0.7rem; gap: 8px; }
    .btn-md { padding: 0.9rem 2rem; font-size: 0.8rem; }
    .btn-lg { padding: 1.2rem 3rem; font-size: 0.95rem; }

    .btn-primary {
      background: var(--brand);
      color: white;
      box-shadow: 0 4px 15px -5px var(--brand-glow);
    }
    .btn-primary:not(:disabled):hover {
      background: var(--brand-muted);
      box-shadow: 0 8px 25px -5px var(--brand-glow);
      transform: translateY(-2px);
    }

    .btn-danger { background: rgba(255, 75, 75, 0.1); color: var(--danger); border-color: rgba(255, 75, 75, 0.2); }
    .btn-danger:hover { background: var(--danger); color: white; }

    .btn-success { background: rgba(0, 210, 138, 0.1); color: var(--success); border-color: rgba(0, 210, 138, 0.2); }
    .btn-success:hover { background: var(--success); color: white; }

    .btn-icon { width: 1.1rem; height: 1.1rem; }

    .spinner {
      width: 1.25rem; height: 1.25rem;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: rotate 0.8s infinite linear;
    }
    @keyframes rotate { to { transform: rotate(360deg); } }
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
