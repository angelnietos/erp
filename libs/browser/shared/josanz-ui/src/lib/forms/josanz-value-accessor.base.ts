import { ControlValueAccessor } from '@angular/forms';

/** Base mínima para ControlValueAccessor en controles Josanz standalone. */
export abstract class JosanzValueAccessorBase<T> implements ControlValueAccessor {
  protected onChange: (value: T) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  disabled = false;

  abstract writeValue(value: T | null): void;

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected emitChange(value: T): void {
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
