import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type JosanzInlineAlertTone = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'josanz-inline-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-start justify-between gap-4 rounded-2xl border border-solid px-4 py-3"
      [ngStyle]="shellStyles()"
      role="status"
    >
      <div class="min-w-0">
        @if (title) {
          <strong class="block text-sm font-black" [style.color]="toneColor()">{{ title }}</strong>
        }
        @if (message) {
          <p class="m-0 mt-1 text-sm leading-relaxed" [style.color]="'var(--josanz-text)'">{{ message }}</p>
        }
      </div>
      @if (dismissible) {
        <button type="button" class="shrink-0 border-0 bg-transparent text-sm font-black opacity-70" [style.color]="toneColor()" (click)="dismiss.emit()">×</button>
      }
    </div>
  `,
})
export class InlineAlertComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() tone: JosanzInlineAlertTone = 'info';
  @Input() dismissible = false;

  @Output() dismiss = new EventEmitter<void>();

  toneColor(): string {
    if (this.tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (this.tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (this.tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    return 'var(--josanz-primary)';
  }

  shellStyles(): Record<string, string> {
    const color = this.toneColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 10%, var(--josanz-surface))`,
      borderColor: `color-mix(in srgb, ${color} 28%, var(--josanz-border))`,
    };
  }
}
