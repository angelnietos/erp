import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'glass' | 'filled' | 'outline' | 'outline-primary' | 'outline-secondary' | 'outline-danger' | 'soft' | 'link' | 'gradient' | 'app';
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
      [class.btn-secondary]="variant === 'secondary'"
      [class.ui-glass]="variant === 'glass'"
      [class.ui-filled]="variant === 'filled'"
      [class.ui-ghost]="variant === 'ghost'"
      [class.btn-danger]="variant === 'danger'"
      [class.btn-success]="variant === 'success'"
      [class.btn-warning]="variant === 'warning'"
      [class.btn-outline]="variant === 'outline'"
      [class.btn-outline-primary]="variant === 'outline-primary'"
      [class.btn-outline-secondary]="variant === 'outline-secondary'"
      [class.btn-outline-danger]="variant === 'outline-danger'"
      [class.btn-soft]="variant === 'soft'"
      [class.btn-link]="variant === 'link'"
      [class.btn-gradient]="variant === 'gradient'"
      [class.btn-app]="variant === 'app'"
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

    .btn-secondary {
      background: var(--brand-secondary, #6366f1);
      color: white;
      box-shadow: 0 4px 15px -5px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary:not(:disabled):hover {
      background: #4f46e5;
      transform: translateY(-2px);
    }

    .btn-warning {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning, #f59e0b);
      border-color: rgba(245, 158, 11, 0.2);
    }
    .btn-warning:hover {
      background: var(--warning, #f59e0b);
      color: white;
    }

    /* Outline variants */
    .btn-outline {
      background: transparent;
      color: var(--text-primary);
      border-color: var(--border-soft);
    }
    .btn-outline:not(:disabled):hover {
      background: var(--bg-tertiary);
      border-color: var(--text-primary);
    }

    .btn-outline-primary {
      background: transparent;
      color: var(--brand);
      border-color: var(--brand);
    }
    .btn-outline-primary:not(:disabled):hover {
      background: var(--brand);
      color: white;
    }

    .btn-outline-secondary {
      background: transparent;
      color: #6366f1;
      border-color: #6366f1;
    }
    .btn-outline-secondary:not(:disabled):hover {
      background: #6366f1;
      color: white;
    }

    .btn-outline-danger {
      background: transparent;
      color: var(--danger, #ef4444);
      border-color: var(--danger, #ef4444);
    }
    .btn-outline-danger:not(:disabled):hover {
      background: var(--danger, #ef4444);
      color: white;
    }

    /* Soft variant */
    .btn-soft {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      border: none;
    }
    .btn-soft:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Link variant */
    .btn-link {
      background: transparent;
      color: var(--brand);
      border: none;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    .btn-link:not(:disabled):hover {
      color: var(--brand-muted);
    }

    /* Gradient variant */
    .btn-gradient {
      background: linear-gradient(135deg, var(--brand), #8b5cf6);
      color: white;
      border: none;
    }
    .btn-gradient:not(:disabled):hover {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.5);
      transform: translateY(-2px);
    }

    /* App variant - uses current theme's primary color */
    .btn-app {
      background: var(--theme-primary, var(--brand));
      color: white;
      border: none;
    }
    .btn-app:not(:disabled):hover {
      background: var(--brand-muted, var(--theme-primary));
      filter: brightness(1.1);
      transform: translateY(-2px);
    }

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
