import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type JosanzTagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'josanz-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
      [ngStyle]="tagStyles()"
    >
      {{ label }}
      @if (removable) {
        <button type="button" class="border-0 bg-transparent p-0 text-current opacity-70" aria-label="Quitar etiqueta" (click)="remove.emit()">×</button>
      }
    </span>
  `,
})
export class TagComponent {
  @Input() label = 'Etiqueta';
  @Input() tone: JosanzTagTone = 'neutral';
  @Input() customColor?: string;
  @Input() removable = false;

  @Output() remove = new EventEmitter<void>();

  tagStyles(): Record<string, string> {
    const color =
      this.customColor ||
      (this.tone === 'success'
        ? 'var(--josanz-success)'
        : this.tone === 'warning'
          ? 'var(--josanz-warning)'
          : this.tone === 'danger'
            ? 'var(--josanz-danger)'
            : this.tone === 'primary'
              ? 'var(--josanz-primary)'
              : 'var(--josanz-text-muted)');
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      color,
    };
  }
}
