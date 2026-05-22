import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** Trata cadenas sólo con espacios como vacías (Angular `Validators.required` no lo hace). */
export function josanzNonEmptyTrim(
  control: AbstractControl<string | null | undefined>,
): ValidationErrors | null {
  const raw = control.value;
  if (raw == null) return { required: true };
  const s = String(raw).trim();
  return s.length === 0 ? { required: true } : null;
}
