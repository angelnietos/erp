import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
          >{{ label }}</span
        >
      }
      <span
        class="flex items-center gap-3 rounded-2xl border border-solid p-2"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="'var(--josanz-stroke-field)'"
      >
        <input
          class="h-9 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0"
          type="color"
          [value]="value"
          [attr.aria-label]="ariaLabel || label"
          (input)="updateValue($event)"
        />
        <input
          class="min-w-0 flex-1 border-0 bg-transparent text-sm font-black outline-none"
          [style.color]="'var(--josanz-text)'"
          [value]="value"
          (input)="updateValue($event)"
        />
      </span>
      @if (presets.length) {
        <span class="flex flex-wrap gap-2">
          @for (preset of presets; track preset) {
            <button
              type="button"
              class="h-7 w-7 rounded-full border border-solid"
              [style.backgroundColor]="preset"
              [style.borderColor]="
                preset === value ? 'var(--josanz-text)' : 'var(--josanz-border)'
              "
              [attr.aria-label]="'Color ' + preset"
              (click)="selectPreset(preset)"
            ></button>
          }
        </span>
      }
    </label>
  `,
})
export class ColorPickerComponent {
  @Input() label = 'Color';
  @Input() value = '#635BFF';
  @Input() presets: string[] = [
    '#635BFF',
    '#0F766E',
    '#B45309',
    '#BE123C',
    '#0F1E2F',
  ];
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  updateValue(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }

  selectPreset(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
