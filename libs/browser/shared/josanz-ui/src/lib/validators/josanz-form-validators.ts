import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { Validators } from '@angular/forms';

/** Trata cadenas sólo con espacios como vacías (Angular `Validators.required` no lo hace). */
export function josanzNonEmptyTrim(
  control: AbstractControl<string | null | undefined>,
): ValidationErrors | null {
  const raw = control.value;
  if (raw == null) return { required: true };
  const s = String(raw).trim();
  return s.length === 0 ? { required: true } : null;
}

/** Mensaje de error legible para controles de formulario Josanz. */
export function josanzControlErrorMessage(
  control: AbstractControl | null | undefined,
): string {
  if (!control?.errors || !(control.touched || control.dirty)) {
    return '';
  }
  if (control.errors['required']) {
    return 'Este campo es obligatorio';
  }
  if (control.errors['email']) {
    return 'Introduce un email válido';
  }
  return 'Revisa este valor';
}

/** Indica si el control tiene validación obligatoria (nativa o `josanzNonEmptyTrim`). */
export function josanzControlIsRequired(
  control: AbstractControl | null | undefined,
): boolean {
  if (!control) {
    return false;
  }
  if (control.hasValidator(Validators.required)) {
    return true;
  }
  const probe = { ...control, value: '' } as AbstractControl;
  return !!control.validator?.(probe)?.['required'];
}

/** Borde de error para campos invalidados y tocados. */
export function josanzControlHasError(
  control: AbstractControl | null | undefined,
): boolean {
  return !!(control && control.invalid && (control.touched || control.dirty));
}
