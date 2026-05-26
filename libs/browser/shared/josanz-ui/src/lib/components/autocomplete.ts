import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzAutocompleteOption {
  label: string;
  value: string;
  description?: string;
}

@Component({
  selector: 'josanz-autocomplete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="relative grid w-full gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
          >{{ label }}</span
        >
      }
      <input
        class="h-11 w-full rounded-[var(--josanz-radius-control)] border border-solid px-4 text-sm font-bold outline-none"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="open ? accentColor : 'var(--josanz-stroke-field)'"
        [style.color]="'var(--josanz-text)'"
        [placeholder]="placeholder"
        [value]="query"
        [attr.aria-label]="ariaLabel || label"
        (focus)="open = true"
        (input)="updateQuery($event)"
      />
      @if (open && filteredOptions().length) {
        <ul
          class="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-solid p-2 shadow-xl"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          @for (option of filteredOptions(); track option.value) {
            <li>
              <button
                type="button"
                class="w-full rounded-xl border-0 bg-transparent px-3 py-2 text-left hover:bg-black/[0.03]"
                (click)="selectOption(option)"
              >
                <span
                  class="block text-sm font-black"
                  [style.color]="'var(--josanz-text)'"
                  >{{ option.label }}</span
                >
                @if (option.description) {
                  <span
                    class="mt-0.5 block text-xs"
                    [style.color]="'var(--josanz-text-muted)'"
                    >{{ option.description }}</span
                  >
                }
              </button>
            </li>
          }
        </ul>
      }
    </label>
  `,
})
export class AutocompleteComponent {
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() query = '';
  @Input() options: JosanzAutocompleteOption[] = [];
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() queryChange = new EventEmitter<string>();
  @Output() optionSelect = new EventEmitter<JosanzAutocompleteOption>();

  open = false;

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  filteredOptions(): JosanzAutocompleteOption[] {
    const value = this.query.trim().toLowerCase();
    if (!value) {
      return this.options.slice(0, 6);
    }
    return this.options
      .filter((option) => option.label.toLowerCase().includes(value))
      .slice(0, 6);
  }

  updateQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.open = true;
    this.queryChange.emit(this.query);
  }

  selectOption(option: JosanzAutocompleteOption): void {
    this.query = option.label;
    this.open = false;
    this.queryChange.emit(this.query);
    this.optionSelect.emit(option);
  }
}
