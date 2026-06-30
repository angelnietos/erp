import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  InputComponent,
  JOSANZ_FIGMA_LOGIN,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import {
  AuthStore,
  DEV_TENANT_LOGIN_PASSWORD,
  getPrimaryDevLoginHintForTenant,
  JOSANZ_FIGMA_TENANT_SLUG,
} from '@josanz-erp/identity-data-access';

@Component({
  selector: 'app-josanz-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './josanz-login.component.html',
  styleUrl: './josanz-login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JosanzLoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);
  private readonly theme = inject(JosanzThemeService);

  readonly tenantSlug = JOSANZ_FIGMA_TENANT_SLUG;

  readonly loginCta = JOSANZ_FIGMA_LOGIN.primaryCta;
  readonly loginCtaDisabled = JOSANZ_FIGMA_LOGIN.disabledCta;

  readonly loginForm = this.fb.nonNullable.group({
    email: [
      getPrimaryDevLoginHintForTenant(JOSANZ_FIGMA_TENANT_SLUG)?.email ??
        'admin@alexis.local',
      Validators.required,
    ],
    password: [DEV_TENANT_LOGIN_PASSWORD, Validators.required],
  });

  ngOnInit(): void {
    this.theme.setTheme('luxe-rounded');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    this.store.login({
      email,
      password,
      tenantSlug: JOSANZ_FIGMA_TENANT_SLUG,
    });
  }
}
