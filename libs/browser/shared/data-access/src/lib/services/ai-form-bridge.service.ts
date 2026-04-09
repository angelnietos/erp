import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Service to bridge AI actions with Angular Reactive Forms.
 * Allows AI bots to "see" and "fill" the active form in the UI.
 */
@Injectable({ providedIn: 'root' })
export class AIFormBridgeService {
  private _activeForm = signal<FormGroup | null>(null);
  readonly activeForm = this._activeForm.asReadonly();

  /**
   * Components should call this in ngOnInit to expose their form to the AI.
   */
  registerForm(form: FormGroup) {
    console.log('📝 AI Form Bridge: Form registered');
    this._activeForm.set(form);
  }

  /**
   * Components should call this in ngOnDestroy.
   */
  unregisterForm(form: FormGroup) {
    if (this._activeForm() === form) {
      console.log('📝 AI Form Bridge: Form unregistered');
      this._activeForm.set(null);
    }
  }

  /**
   * Directly fills the active form with the provided data.
   */
  fillActiveForm(data: Record<string, any>) {
    const form = this._activeForm();
    if (!form) {
      console.warn('⚠️ AI Form Bridge: No active form found to fill.');
      return false;
    }

    try {
      // We use patchValue to support partial data
      form.patchValue(data);
      
      // Ensure Angular detects the changes
      form.markAsDirty();
      form.updateValueAndValidity();
      
      console.log('✅ AI Form Bridge: Form filled successfully', data);
      return true;
    } catch (error) {
      console.error('❌ AI Form Bridge: Error filling form', error);
      return false;
    }
  }

  /**
   * Returns the current values of the active form.
   * Useful for the AI to "inspect" what's already there.
   */
  getFormValues(): Record<string, any> | null {
    return this._activeForm()?.value || null;
  }
}
