import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  getErpTenantSlug,
  getStoredTenantId,
  resolveTenantSlugFromId,
} from '@josanz-erp/identity-data-access';
import {
  resolveVerifactuPlatformDeepLink,
  tenantUsesKeycloakLogin,
} from '@josanz-erp/identity-api';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { UiLoaderComponent } from '@josanz-erp/shared-ui-kit';
import { ErpVerifactuBridgeComponent } from './erp-verifactu-bridge.component';
import {
  erpVerifactuPrefersBridge,
  setErpVerifactuPreferBridge,
} from '../erp-verifactu-bridge-preference';

@Component({
  selector: 'erp-verifactu-entry',
  standalone: true,
  imports: [UiLoaderComponent, ErpVerifactuBridgeComponent],
  template: `
    @if (showBridge()) {
      <erp-verifactu-bridge />
    } @else {
      <div class="vf-entry-redirect">
        <ui-loader
          message="Abriendo plataforma Verifactu con tu sesión Keycloak…"
        ></ui-loader>
        <p class="vf-entry-redirect__hint">
          Si no redirige,
          <button type="button" class="vf-entry-redirect__link" (click)="openBridge()">
            continúa en el ERP
          </button>
        </p>
      </div>
    }
  `,
  styles: [
    `
      .vf-entry-redirect {
        min-height: 50vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
      }
      .vf-entry-redirect__hint {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .vf-entry-redirect__link {
        background: none;
        border: none;
        padding: 0;
        color: var(--primary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: underline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErpVerifactuEntryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(GlobalAuthStore);

  readonly showBridge = signal(false);

  readonly tenantSlug = computed(() => {
    const fromSession = getErpTenantSlug();
    if (fromSession) {
      return fromSession;
    }
    return resolveTenantSlugFromId(getStoredTenantId()) ?? 'demo';
  });

  ngOnInit(): void {
    if (this.shouldUseBridge()) {
      this.showBridge.set(true);
      return;
    }

    const url = resolveVerifactuPlatformDeepLink(
      this.tenantSlug(),
      '/verifactu/overview',
    );

    if (!url || typeof window === 'undefined') {
      this.showBridge.set(true);
      return;
    }

    window.location.replace(url);
  }

  openBridge(): void {
    setErpVerifactuPreferBridge(true);
    this.showBridge.set(true);
  }

  private shouldUseBridge(): boolean {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('stay') === '1' || qp.get('bridge') === '1') {
      return true;
    }
    if (erpVerifactuPrefersBridge()) {
      return true;
    }
    if (!this.auth.isAuthenticated()) {
      return true;
    }
    if (!tenantUsesKeycloakLogin(this.tenantSlug())) {
      return true;
    }
    return false;
  }
}
