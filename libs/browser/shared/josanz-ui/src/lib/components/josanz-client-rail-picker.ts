import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { normalizeHexColor } from '../catalog/client-rail-presets';
import {
  josanzControlErrorMessage,
  josanzControlHasError,
  josanzControlIsRequired,
} from '../validators/josanz-form-validators';

@Component({
  selector: 'josanz-client-rail-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="josanz-client-rail-picker" [formGroup]="parentForm">
      <label class="josanz-client-rail-picker__label" [attr.for]="hexInputId">
        {{ fieldLabel }}
        @if (showRequiredMarker) {
        <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
        }
      </label>

      <div
        class="josanz-client-rail-picker__field"
        [class.josanz-client-rail-picker__field--invalid]="hasError"
      >
        <span
          class="josanz-client-rail-picker__preview"
          [style.background-color]="previewColor"
          aria-hidden="true"
        ></span>

        <input
          class="josanz-client-rail-picker__native"
          type="color"
          [value]="nativePickerColor"
          [attr.aria-label]="'Selector de color'"
          (input)="onNativeColorPick($event)"
        />

        <input
          [id]="hexInputId"
          class="josanz-client-rail-picker__hex"
          type="text"
          [formControlName]="controlName"
          placeholder="#2563EB"
          maxlength="7"
          spellcheck="false"
          autocomplete="off"
          [attr.aria-invalid]="hasError"
          (blur)="onHexBlur()"
        />
      </div>

      <p class="josanz-client-rail-picker__hint">{{ fieldHint }}</p>

      @if (errorText) {
      <p class="josanz-client-rail-picker__error" role="alert">{{ errorText }}</p>
      }
    </div>
  `,
})
export class JosanzClientRailPickerComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() controlName = 'colorRail';
  @Input() required = true;
  @Input() fieldLabel = 'Color en listado';
  @Input() fieldHint = 'Elige cualquier color para la barra lateral del listado.';

  readonly hexInputId = `josanz-client-rail-${Math.random().toString(36).slice(2, 9)}`;

  get selectedColor(): string {
    return (this.parentForm.get(this.controlName)?.value as string) ?? '';
  }

  get previewColor(): string {
    return normalizeHexColor(this.selectedColor) ?? '#94A3B8';
  }

  get nativePickerColor(): string {
    return normalizeHexColor(this.selectedColor) ?? '#2563EB';
  }

  get showRequiredMarker(): boolean {
    const control = this.parentForm.get(this.controlName);
    return this.required && josanzControlIsRequired(control);
  }

  get hasError(): boolean {
    return josanzControlHasError(this.parentForm.get(this.controlName));
  }

  get errorText(): string {
    const control = this.parentForm.get(this.controlName);
    if (control?.hasError('pattern')) {
      return 'Introduce un color hexadecimal válido (ej. #2563EB).';
    }
    return josanzControlErrorMessage(control);
  }

  onNativeColorPick(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.patchColor(color);
  }

  onHexBlur(): void {
    const normalized = normalizeHexColor(this.selectedColor);
    if (normalized) {
      this.patchColor(normalized);
    }
  }

  private patchColor(color: string): void {
    this.parentForm.patchValue({ [this.controlName]: color });
    const control = this.parentForm.get(this.controlName);
    control?.markAsDirty();
    control?.markAsTouched();
  }
}
