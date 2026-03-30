import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, User, Lock, ArrowRight } from 'lucide-angular';
import { AnimatedBackgroundComponent } from '../animated-background/animated-background.component';

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, UiInputComponent, UiButtonComponent, UiAlertComponent, AnimatedBackgroundComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly icons = { User, Lock, ArrowRight };

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      this.store.login({ email, password });
    }
  }
}
