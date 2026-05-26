import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-copy-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-solid bg-transparent px-3 py-2 text-sm font-black"
      [style.borderColor]="
        copied ? 'var(--josanz-success)' : 'var(--josanz-border)'
      "
      [style.color]="copied ? 'var(--josanz-success)' : 'var(--josanz-text)'"
      [attr.aria-label]="ariaLabel || label"
      (click)="copy()"
    >
      <span aria-hidden="true">{{ copied ? 'OK' : '⧉' }}</span>
      {{ copied ? copiedLabel : label }}
    </button>
  `,
})
export class CopyButtonComponent {
  @Input() text = '';
  @Input() label = 'Copiar';
  @Input() copiedLabel = 'Copiado';
  @Input() ariaLabel = '';

  @Output() copiedText = new EventEmitter<string>();

  copied = false;

  async copy(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(this.text);
    }
    this.copied = true;
    this.copiedText.emit(this.text);
    setTimeout(() => {
      this.copied = false;
    }, 1400);
  }
}
