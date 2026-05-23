import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
        role="presentation"
      >
        <section
          class="w-full max-w-3xl rounded-t-[32px] border border-solid p-0 shadow-2xl"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="ariaLabel || title"
        >
          <div class="flex justify-center pt-3">
            <span
              class="h-1.5 w-12 rounded-full"
              [style.backgroundColor]="'var(--josanz-border)'"
            ></span>
          </div>
          <header class="flex items-start justify-between gap-4 p-5">
            <div>
              <h2
                class="m-0 text-xl font-black"
                [style.color]="'var(--josanz-text)'"
              >
                {{ title }}
              </h2>
              @if (description) {
                <p
                  class="m-0 mt-1 text-sm"
                  [style.color]="'var(--josanz-text-muted)'"
                >
                  {{ description }}
                </p>
              }
            </div>
            <button
              type="button"
              class="rounded-full border-0 bg-transparent p-1 text-xl leading-none"
              [style.color]="'var(--josanz-text-muted)'"
              aria-label="Cerrar bottom sheet"
              (click)="close()"
            >
              ×
            </button>
          </header>
          <div class="max-h-[65vh] overflow-auto px-5 pb-5">
            <ng-content></ng-content>
          </div>
        </section>
      </div>
    }
  `,
})
export class BottomSheetComponent {
  @Input() open = false;
  @Input() title = 'Opciones';
  @Input() description = '';
  @Input() ariaLabel = '';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }
}
