import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div class="input-wrapper" [class.has-icon]="icon">
        @if (icon) { <i-lucide [name]="icon" class="field-icon"></i-lucide> }
        <input 
          [id]="id" 
          [type]="type" 
          [placeholder]="placeholder" 
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class.invalid]="error"
        >
      </div>
    </div>
  `,
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    label { color: #E2E8F0; font-size: 13px; font-weight: 500; margin-left: 4px; }
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .field-icon { position: absolute; left: 14px; width: 18px; height: 18px; color: #64748B; pointer-events: none; }
    input {
      width: 100%; padding: 12px 14px; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
      color: white; font-size: 14px; transition: all 0.2s ease; outline: none;
    }
    .has-icon input { padding-left: 42px; }
    input:focus { border-color: #4F46E5; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15); }
    input.invalid { border-color: rgba(239, 68, 68, 0.5); }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon?: any;
  @Input() error = false;

  value = '';
  disabled = false;
  onChange = (_value: string) => {
    // Standard Angular ControlValueAccessor placeholder
  };
  onTouched = () => {
    // Standard Angular ControlValueAccessor placeholder
  };

  writeValue(value: string): void { this.value = value; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
