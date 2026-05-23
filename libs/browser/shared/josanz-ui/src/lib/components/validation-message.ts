import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type JosanzValidationTone = 'error' | 'warning' | 'success' | 'info';

@Component({
  selector: 'josanz-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <p
        class="m-0 flex items-start gap-2 rounded-2xl px-3 py-2 text-sm font-bold"
        [ngStyle]="messageStyles()"
        [attr.role]="tone === 'error' ? 'alert' : 'status'"
      >
        <span aria-hidden="true">{{ icon() }}</span>
        <span>{{ message }}</span>
      </p>
    }
  `,
})
export class ValidationMessageComponent {
  @Input() message = '';
  @Input() tone: JosanzValidationTone = 'error';

  messageStyles(): Record<string, string> {
    const color = this.color();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 10%, var(--josanz-surface))`,
      color,
    };
  }

  icon(): string {
    if (this.tone === 'success') {
      return 'OK';
    }
    if (this.tone === 'warning') {
      return '!';
    }
    if (this.tone === 'info') {
      return 'i';
    }
    return '!';
  }

  private color(): string {
    if (this.tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (this.tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (this.tone === 'info') {
      return 'var(--josanz-primary)';
    }
    return 'var(--josanz-danger)';
  }
}
