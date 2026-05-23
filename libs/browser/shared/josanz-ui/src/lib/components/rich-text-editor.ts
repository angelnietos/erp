import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="overflow-hidden rounded-3xl border border-solid"
      [style.backgroundColor]="'var(--josanz-surface)'"
      [style.borderColor]="'var(--josanz-border)'"
    >
      @if (label) {
        <header
          class="border-b border-solid px-4 py-3"
          [style.borderColor]="'var(--josanz-border)'"
        >
          <span
            class="text-[11px] font-bold uppercase tracking-[0.1em]"
            [style.color]="'var(--josanz-label-muted)'"
            >{{ label }}</span
          >
        </header>
      }
      <div
        class="flex flex-wrap gap-2 border-b border-solid p-3"
        [style.borderColor]="'var(--josanz-border)'"
      >
        @for (action of actions; track action.command) {
          <button
            type="button"
            class="rounded-full border border-solid bg-transparent px-3 py-1 text-xs font-black"
            [style.borderColor]="'var(--josanz-border)'"
            [style.color]="'var(--josanz-text)'"
            (click)="format.emit(action.command)"
          >
            {{ action.label }}
          </button>
        }
      </div>
      <div
        class="min-h-[160px] px-4 py-3 text-sm leading-relaxed outline-none"
        contenteditable="true"
        [attr.aria-label]="ariaLabel || label || 'Editor de texto enriquecido'"
        [style.color]="'var(--josanz-text)'"
        [innerHTML]="value"
        (input)="updateValue($event)"
      ></div>
    </section>
  `,
})
export class RichTextEditorComponent {
  @Input() label = 'Editor';
  @Input() value = '';
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() format = new EventEmitter<string>();

  readonly actions = [
    { label: 'B', command: 'bold' },
    { label: 'I', command: 'italic' },
    { label: 'Lista', command: 'insertUnorderedList' },
    { label: 'Link', command: 'createLink' },
  ];

  updateValue(event: Event): void {
    this.value = (event.target as HTMLElement).innerHTML;
    this.valueChange.emit(this.value);
  }
}
