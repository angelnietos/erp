import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'josanz-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      [type]="type" 
      class="btn-primary" 
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else {
        <ng-content></ng-content>
        @if (icon) { <i-lucide [name]="icon" class="btn-icon"></i-lucide> }
      }
    </button>
  `,
  styles: [`
    .btn-primary {
      width: 100%; padding: 14px; background: #4F46E5; border: none; border-radius: 12px;
      color: white; font-size: 15px; font-weight: 600; cursor: pointer;
      display: flex; justify-content: center; align-items: center; gap: 8px;
      transition: all 0.2s ease; margin-top: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: #4338CA; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-icon { width: 18px; height: 18px; }
    .spinner {
      width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: rotate 0.8s infinite linear;
    }
    @keyframes rotate { to { transform: rotate(360deg); } }
  `],
})
export class UiButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: any;
  @Output() onClick = new EventEmitter<Event>();
}
