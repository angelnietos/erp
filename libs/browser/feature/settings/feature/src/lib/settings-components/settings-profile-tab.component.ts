import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UIMascotComponent,
} from '@josanz-erp/shared-ui-kit';
import { AuthStore } from '@josanz-erp/identity-data-access';

@Component({
  selector: 'lib-settings-profile-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent, UIMascotComponent],
  template: `
    <section class="content-section animate-slide-up profile-hub">
      <div class="section-breadcrumb">
        <span>Cuenta</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Identidad Digital</span>
      </div>

      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Ajustes de <span>Perfil</span></h2>
          <p class="hero-subtitle">Gestión de identidad soberana y presencia en la plataforma</p>
        </div>
        <div class="hero-right">
          <div class="security-badge">
            <lucide-icon name="shield-check" size="16"></lucide-icon>
            <span>Seguridad Bio-Digital: OK</span>
          </div>
        </div>
      </div>

      <div class="identity-grid">
        <div class="identity-main-card">
          <div class="avatar-projection-area">
            <div class="hologram-ring"></div>
            <div class="hologram-glow"></div>
            <ui-mascot
              type="universal"
              color="#8b5cf6"
              personality="happy"
              class="identity-mascot"
            />
            <button class="edit-avatar-btn" title="Actualizar Visualización">
              <lucide-icon name="camera" size="18"></lucide-icon>
            </button>
          </div>

          <div class="identity-form">
            <div class="luxe-input-group">
              <label class="luxe-label" for="profile-name">Identificador Nominal</label>
              <input id="profile-name" type="text" [value]="userName()" class="luxe-underlined-input" readonly aria-label="Identificador Nominal">
            </div>
            <div class="luxe-input-group">
              <label class="luxe-label" for="profile-email">Canal de Comunicación</label>
              <input id="profile-email" type="email" [value]="userEmail()" class="luxe-underlined-input" readonly aria-label="Canal de Comunicación">
            </div>
            <div class="luxe-input-group">
              <label class="luxe-label" for="profile-role">Descriptor de Rol</label>
              <input id="profile-role" type="text" [value]="userRole()" class="luxe-underlined-input" readonly aria-label="Descriptor de Rol">
            </div>
          </div>
        </div>

        <div class="identity-sidebar-cards">
          <ui-card variant="glass" class="id-badge-card">
            <div class="badge-header">
              <span class="category-tag">PLATFORM CORE ID</span>
              <lucide-icon name="fingerprint" size="20" class="text-brand"></lucide-icon>
            </div>
            <div class="id-code">{{ userId() }}</div>
            <div class="last-access-row">
              <span class="label">ÚLTIMO ACCESO REGISTRADO</span>
              <span class="value">Hace instantes • Sesión Encriptada</span>
            </div>
          </ui-card>

          <ui-card variant="glass" class="role-status-card">
            <div class="role-info">
              <div class="role-icon">
                @if (canSeeRolesAdmin()) {
                  <lucide-icon name="crown" size="28"></lucide-icon>
                } @else {
                  <lucide-icon name="user" size="28"></lucide-icon>
                }
              </div>
              <div class="role-text">
                <h3>{{ userRole() }}</h3>
                <p>Nivel de acceso autorizado</p>
              </div>
            </div>
            <div class="active-pulse mt-6">
              <div class="pulse-dot"></div>
              <span>CONEXIÓN SEGURA ACTIVA</span>
            </div>
          </ui-card>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .section-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .section-breadcrumb .current { color: var(--brand); }

      .profile-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 4rem;
      }

      .hero-title {
        font-size: 2.75rem;
        font-weight: 950;
        letter-spacing: -0.05em;
        color: #0f172a;
        margin: 0;
        line-height: 0.9;
      }

      .hero-title span { color: var(--brand); opacity: 0.8; }

      .hero-subtitle {
        font-size: 1rem;
        font-weight: 500;
        color: #64748b;
        margin-top: 1rem;
        max-width: 480px;
      }

      .security-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .identity-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 2.5rem;
      }

      .identity-main-card {
        background: rgba(255, 255, 255, 0.35) !important;
        backdrop-filter: blur(50px);
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 32px !important;
        padding: 2.5rem 3rem;
        display: flex;
        gap: 3rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .avatar-projection-area {
        width: 180px;
        height: 180px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .hologram-ring {
        position: absolute;
        inset: -15px;
        border: 1.5px solid var(--brand);
        border-radius: 50%;
        opacity: 0.12;
        animation: spin-slow 30s linear infinite;
      }

      .hologram-glow {
        position: absolute;
        width: 160px;
        height: 160px;
        background: var(--brand);
        filter: blur(60px);
        opacity: 0.18;
        border-radius: 50%;
      }

      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .identity-mascot {
        z-index: 2;
        filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25));
        transform: scale(1.05) translateY(-8px);
        animation: mascotAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes mascotAppear {
        from { opacity: 0; transform: scale(0.85) translateY(10px); }
        to { opacity: 1; transform: scale(1.05) translateY(-8px); }
      }

      .edit-avatar-btn {
        position: absolute;
        bottom: 15px;
        right: 15px;
        width: 44px;
        height: 44px;
        background: #fff;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        z-index: 5;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .edit-avatar-btn:hover {
        transform: scale(1.15) rotate(15deg);
        background: var(--brand);
        color: #fff;
      }

      .identity-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .luxe-input-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        position: relative;
      }

      .luxe-input-group label {
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .luxe-underlined-input {
        background: transparent;
        border: none;
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
        padding: 0.75rem 0;
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        transition: all 0.4s ease;
      }

      .identity-sidebar-cards {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .id-badge-card {
        padding: 2.5rem !important;
        background: rgba(255, 255, 255, 0.2) !important;
      }

      .badge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .category-tag {
        font-size: 0.6rem;
        font-weight: 900;
        color: #94a3b8;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .id-code {
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.9rem;
        color: #475569;
        background: rgba(15, 23, 42, 0.04);
        padding: 1.25rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        word-break: break-all;
        border: 1px solid rgba(0, 0, 0, 0.03);
      }

      .last-access-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .last-access-row .label {
        font-size: 0.6rem;
        font-weight: 800;
        color: #94a3b8;
      }

      .last-access-row .value {
        font-size: 0.8rem;
        font-weight: 600;
        color: #1e293b;
      }

      .role-status-card {
        background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 85%, black 15%)) !important;
        color: #fff !important;
        border: none !important;
        box-shadow: 0 20px 40px rgba(var(--brand-rgb), 0.2) !important;
      }

      .role-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .role-icon {
        width: 54px;
        height: 54px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .role-text h3 {
        color: #fff !important;
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.25rem 0;
        letter-spacing: -0.02em;
      }

      .role-text p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.85rem;
        margin: 0;
        font-weight: 500;
      }

      .active-pulse {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.65rem;
        font-weight: 900;
        background: rgba(0, 0, 0, 0.25);
        width: fit-content;
        padding: 0.5rem 1rem;
        border-radius: 99px;
        letter-spacing: 0.05em;
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        box-shadow: 0 0 12px #4ade80;
        animation: pulse-ring 2s infinite cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.6); opacity: 0.6; }
        100% { transform: scale(1); opacity: 1; }
      }

      .text-brand { color: var(--brand); }
    `,
  ],
})
export class SettingsProfileTabComponent {
  protected readonly _authStore = inject(AuthStore);

  readonly userName = computed(() => {
    const u = this._authStore.user();
    return (u?.firstName + ' ' + u?.lastName) || '';
  });

  readonly userEmail = computed(() => this._authStore.user()?.email || '');

  readonly userRole = computed(() => this._authStore.user()?.roles?.[0] || 'Miembro Plataforma');

  readonly userId = computed(() => this._authStore.user()?.id || '');

  readonly canSeeRolesAdmin = computed(() => {
    const p = this._authStore.user()?.permissions ?? [];
    return p.includes('*') || p.includes('roles.manage');
  });
}