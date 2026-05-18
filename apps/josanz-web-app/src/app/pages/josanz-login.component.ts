import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, InputComponent, JOSANZ_FIGMA_LOGIN } from '@josanz-erp/josanz-ui';
import { JosanzDemoAuthService } from '../auth/josanz-demo-auth.service';

@Component({
  selector: 'app-josanz-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './josanz-login.component.html',
  styleUrl: './josanz-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JosanzLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(JosanzDemoAuthService);
  private readonly router = inject(Router);

  readonly loginCta = JOSANZ_FIGMA_LOGIN.primaryCta;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['admin@josanz.com', Validators.required],
    password: ['demo', Validators.required],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.auth.login();
    void this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
