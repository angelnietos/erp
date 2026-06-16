import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, DEFAULT_LOGIN_TENANT_SLUG, ERP_TENANT_SLUG_SESSION_KEY } from '@josanz-erp/identity-data-access';
import { UiInputComponent, UiButtonComponent, UiAlertComponent } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Mail, ArrowLeft } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    UiInputComponent,
    UiButtonComponent,
    UiAlertComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../login/login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly icons = { Mail, ArrowLeft };
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly devResetUrl = signal<string | null>(null);
  readonly tenantSlug = signal(DEFAULT_LOGIN_TENANT_SLUG);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const fromQuery = this.route.snapshot.queryParamMap.get('tenant');
    const fromStore =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(ERP_TENANT_SLUG_SESSION_KEY)
        : null;
    const slug = (fromQuery || fromStore || DEFAULT_LOGIN_TENANT_SLUG).trim().toLowerCase();
    this.tenantSlug.set(slug.replace(/[^a-z0-9-]/g, '') || DEFAULT_LOGIN_TENANT_SLUG);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.devResetUrl.set(null);
    try {
      const { email } = this.form.getRawValue();
      const res = await firstValueFrom(
        this.auth.forgotPassword(email, this.tenantSlug()),
      );
      this.success.set(
        'Si existe una cuenta local con ese email, recibirás un enlace para restablecer la contraseña.',
      );
      if (res.devResetUrl) {
        this.devResetUrl.set(res.devResetUrl);
      }
    } catch (err: unknown) {
      const msg =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo procesar la solicitud. Inténtalo de nuevo.';
      this.error.set(typeof msg === 'string' ? msg : 'Error inesperado');
    } finally {
      this.loading.set(false);
    }
  }

  goLogin(): void {
    void this.router.navigate(['/auth/login'], {
      queryParams: { tenant: this.tenantSlug() },
    });
  }
}
