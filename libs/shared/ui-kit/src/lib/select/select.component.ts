import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-josanz-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div class="select-wrapper">
        <select 
          [id]="id" 
          (change)="onSelect($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class.invalid]="error"
        >
          @if (placeholder) {
            <option value="" disabled [selected]="!value">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [selected]="value === option.value">
              {{ option.label }}
            </option>
          }
        </select>
        <div class="chevron"></div>
      </div>
    </div>
  `,
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    label { color: #E2E8F0; font-size: 13px; font-weight: 500; margin-left: 4px; }
    .select-wrapper { position: relative; display: flex; align-items: center; }
    select {
      width: 100%; padding: 12px 36px 12px 14px; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
      color: white; font-size: 14px; transition: all 0.2s ease; outline: none;
      appearance: none; cursor: pointer;
    }
    select:focus { border-color: #4F46E5; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15); }
    select.invalid { border-color: rgba(239, 68, 68, 0.5); }
    .chevron {
      position: absolute; right: 14px; width: 8px; height: 8px;
      border-right: 2px solid #64748B; border-bottom: 2px solid #64748B;
      transform: rotate(45deg); pointer-events: none; margin-top: -4px;
    }
    option { background: #1E293B; color: white; }
  `],
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: { label: string, value: any }[] = [];
  @Input() error = false;

  value: any = '';
  disabled = false;
  onChange = (_value: unknown) => {
    // Standard Angular ControlValueAccessor placeholder
  };
  onTouched = () => {
    // Standard Angular ControlValueAccessor placeholder
  };

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
