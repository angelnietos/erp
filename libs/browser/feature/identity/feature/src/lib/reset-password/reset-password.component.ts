import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, DEFAULT_LOGIN_TENANT_SLUG } from '@josanz-erp/identity-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'lib-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    UiInputComponent,
    UiButtonComponent,
    UiAlertComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: '../login/login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly token = signal('');
  readonly tenantSlug = signal(DEFAULT_LOGIN_TENANT_SLUG);

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    const tenant =
      this.route.snapshot.queryParamMap.get('tenant')?.trim().toLowerCase() ??
      DEFAULT_LOGIN_TENANT_SLUG;
    this.token.set(token);
    this.tenantSlug.set(tenant.replace(/[^a-z0-9-]/g, '') || DEFAULT_LOGIN_TENANT_SLUG);
    if (!token) {
      this.error.set('Enlace inválido. Solicita uno nuevo desde «Olvidé mi contraseña».');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.token()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const { newPassword } = this.form.getRawValue();
      await firstValueFrom(this.auth.resetPassword(this.token(), newPassword));
      this.success.set(true);
    } catch (err: unknown) {
      const raw = (err as { error?: { message?: string | string[] } })?.error?.message;
      const msg = Array.isArray(raw) ? raw.join(', ') : raw;
      this.error.set(msg ?? 'No se pudo restablecer la contraseña. El enlace puede haber caducado.');
    } finally {
      this.loading.set(false);
    }
  }

  goLogin(): void {
    void this.router.navigate(['/auth/login'], {
      queryParams: { tenant: this.tenantSlug() },
      replaceUrl: true,
    });
  }
}
