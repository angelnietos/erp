import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  clientRailPresetOptions,
  type JosanzClientRailPreset,
} from '../catalog/client-rail-presets';
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
      <p class="josanz-client-rail-picker__label">
        Color en listado
        @if (showRequiredMarker) {
        <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
        }
      </p>
      <div
        class="josanz-client-rail-picker__grid"
        role="radiogroup"
        [attr.aria-label]="'Color en listado'"
        [attr.aria-invalid]="hasError"
      >
        @for (option of options; track option.color) {
        <button
          type="button"
          role="radio"
          class="josanz-client-rail-picker__option"
          [class.josanz-client-rail-picker__option--active]="selectedColor === option.color"
          [attr.aria-checked]="selectedColor === option.color"
          (click)="selectColor(option)"
        >
          <span
            class="josanz-client-rail-picker__swatch"
            [style.background-color]="option.color"
            aria-hidden="true"
          ></span>
          <span class="josanz-client-rail-picker__name">{{ option.label }}</span>
        </button>
        }
      </div>
      @if (errorText) {
      <p class="josanz-client-rail-picker__error" role="alert">{{ errorText }}</p>
      }
    </div>
  `,
})
export class JosanzClientRailPickerComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input() controlName = 'colorRail';
  @Input() sectorControlName = 'sector';
  @Input() required = true;

  @Input() set initialColor(value: string | null | undefined) {
    this.options = clientRailPresetOptions(value);
  }

  options: JosanzClientRailPreset[] = clientRailPresetOptions();

  get selectedColor(): string {
    return (this.parentForm.get(this.controlName)?.value as string) ?? '';
  }

  get showRequiredMarker(): boolean {
    const control = this.parentForm.get(this.controlName);
    return this.required && josanzControlIsRequired(control);
  }

  get hasError(): boolean {
    return josanzControlHasError(this.parentForm.get(this.controlName));
  }

  get errorText(): string {
    return josanzControlErrorMessage(this.parentForm.get(this.controlName));
  }

  refreshOptions(currentColor?: string | null): void {
    this.options = clientRailPresetOptions(currentColor);
  }

  selectColor(option: JosanzClientRailPreset): void {
    this.parentForm.patchValue({
      [this.controlName]: option.color,
      [this.sectorControlName]: option.sector,
    });
    this.parentForm.get(this.controlName)?.markAsDirty();
    this.parentForm.get(this.controlName)?.markAsTouched();
  }
}
