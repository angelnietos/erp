import { Injectable, isDevMode, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class AIFormBridgeService {
  private _activeForm = signal<FormGroup | null>(null);
  private _activeDataProxy = signal<Record<string, unknown> | null>(null);
  
  readonly activeForm = this._activeForm.asReadonly();

  /**
   * For Reactive Forms (FormGroup)
   */
  registerForm(form: FormGroup) {
    if (isDevMode()) {
      console.log('📝 AI Form Bridge: Form registered');
    }
    this._activeForm.set(form);
    this._activeDataProxy.set(null);
  }

  /**
   * For Template Forms or simple objects (ngModel)
   */
  registerDataProxy(data: Record<string, unknown> | object) {
    if (isDevMode()) {
      console.log('📝 AI Form Bridge: Data Proxy registered');
    }
    this._activeDataProxy.set(data as Record<string, unknown>);
    this._activeForm.set(null);
  }

  unregisterForm(form: FormGroup) {
    if (this._activeForm() === form) {
      this._activeForm.set(null);
    }
  }

  unregisterDataProxy(data: Record<string, unknown> | object) {
    if (this._activeDataProxy() === data) {
      this._activeDataProxy.set(null);
    }
  }

  /**
   * Directly fills the active form or data proxy with the provided data.
   */
  fillActiveForm(data: Record<string, unknown>) {
    const form = this._activeForm();
    const proxy = this._activeDataProxy();

    if (form) {
      try {
        form.patchValue(data as never);
        form.markAsDirty();
        form.updateValueAndValidity();
        if (isDevMode()) {
          console.log('✅ AI Form Bridge: Form filled (Reactive)', data);
        }
        return true;
      } catch (e) { console.error(e); return false; }
    }

    if (proxy) {
      try {
        Object.keys(data).forEach(key => {
          proxy[key] = data[key];
        });
        if (isDevMode()) {
          console.log('✅ AI Form Bridge: Data Proxy filled (Template)', data);
        }
        return true;
      } catch (e) { console.error(e); return false; }
    }

    if (isDevMode()) {
      console.warn('⚠️ AI Form Bridge: No active form or proxy found.');
    }
    return false;
  }

  /**
   * Returns the current values of the active form.
   * Useful for the AI to "inspect" what's already there.
   */
  getFormValues(): Record<string, unknown> | null {
    const v = this._activeForm()?.value;
    return v ? (v as Record<string, unknown>) : null;
  }
}
