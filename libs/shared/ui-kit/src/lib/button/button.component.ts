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
        @if (icon) { <lucide-icon [name]="getIconName()" class="btn-icon"></lucide-icon> }
      }
    </button>
  `,
  styles: [`
    .btn {
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Sizes */
    .btn-sm {
      padding: 8px 16px;
      font-size: 0.8125rem;
    }
    .btn-md {
      padding: 12px 20px;
      font-size: 0.9375rem;
    }
    .btn-lg {
      padding: 14px 28px;
      font-size: 1rem;
    }

    /* Variants */
    .btn-primary {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--theme-secondary, #64748B);
      color: white;
    }
    .btn-secondary:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--theme-primary, #4F46E5);
      color: var(--theme-primary, #4F46E5);
    }
    .btn-outline:hover:not(:disabled) {
      background: var(--theme-primary, #4F46E5);
      color: white;
    }

    .btn-ghost {
      background: transparent;
      color: var(--theme-text, #1E293B);
    }
    .btn-ghost:hover:not(:disabled) {
      background: var(--theme-border, #E2E8F0);
    }

    .btn-danger {
      background: #EF4444;
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-success {
      background: #10B981;
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-warning {
      background: #F59E0B;
      color: white;
    }
    .btn-warning:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-info {
      background: #0EA5E9;
      color: white;
    }
    .btn-info:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-light {
      background: #F1F5F9;
      color: var(--theme-text, #1E293B);
    }
    .btn-light:hover:not(:disabled) {
      background: #E2E8F0;
    }

    .btn-dark {
      background: #1E293B;
      color: white;
    }
    .btn-dark:hover:not(:disabled) {
      background: #0F172A;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
    }
    
    .btn-sm .btn-icon {
      width: 14px;
      height: 14px;
    }
    
    .btn-lg .btn-icon {
      width: 20px;
      height: 20px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white;
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
  @Input() icon: any = '';
  @Output() clicked = new EventEmitter<Event>();

  getIconName(): string {
    if (!this.icon) return '';
    if (typeof this.icon === 'string') return this.icon;
    return (this.icon as any).name || '';
  }
}
