import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-settings-notifications-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Cuenta</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Comunicaciones</span>
      </div>
      
      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Alertas & <span>Flujos</span></h2>
          <p class="hero-subtitle">Define tus canales de recepción y la intensidad de los avisos</p>
        </div>
      </div>

      <div class="grid-config">
        <ui-card variant="glass">
          <div class="pref-header">
            <lucide-icon name="bell-ring" size="20" class="text-brand"></lucide-icon>
            <h3>Centro de Alertas</h3>
          </div>
          <div class="pref-row mt-6">
            <div class="pref-text">
              <h4>Notificaciones Globales</h4>
              <p>Push en tiempo real y alertas de escritorio</p>
            </div>
            <div class="toggle-wrapper" [class.active]="aiBotStore.notificationsEnabled()" 
                 (click)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())" 
                 (keydown.enter)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())"
                 (keydown.space)="aiBotStore.notificationsEnabled.set(!aiBotStore.notificationsEnabled())"
                 tabindex="0" role="switch" 
                 [attr.aria-checked]="aiBotStore.notificationsEnabled()" 
                 aria-label="Alternar notificaciones globales">
              <div class="toggle-handle"></div>
            </div>
          </div>
        </ui-card>

        <ui-card variant="glass">
          <div class="pref-header">
            <lucide-icon name="volume-2" size="20" class="text-brand"></lucide-icon>
            <h3>Feedback Auditivo</h3>
          </div>
          <div class="pref-row mt-6">
            <div class="pref-text">
              <h4>Efectos de Sonido</h4>
              <p>Confirmaciones acústicas para acciones clave</p>
            </div>
            <div class="toggle-wrapper" [class.active]="aiBotStore.soundEffects()" 
                 (click)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())" 
                 (keydown.enter)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())"
                 (keydown.space)="aiBotStore.soundEffects.set(!aiBotStore.soundEffects())"
                 tabindex="0" role="switch" 
                 [attr.aria-checked]="aiBotStore.soundEffects()" 
                 aria-label="Alternar efectos de sonido">
              <div class="toggle-handle"></div>
            </div>
          </div>
        </ui-card>
      </div>
    </section>
  `,
  styles: [
    `
      .section-breadcrumb { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
      .section-breadcrumb .current { color: var(--brand); }

      .profile-hero { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
      .hero-title { font-size: 2.75rem; font-weight: 950; letter-spacing: -0.05em; color: #0f172a; margin: 0; line-height: 0.9; }
      .hero-title span { color: var(--brand); opacity: 0.8; }
      .hero-subtitle { font-size: 1rem; font-weight: 500; color: #64748b; margin-top: 1rem; }

      .grid-config { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1.5rem; }

      .pref-header { display: flex; align-items: center; gap: 0.75rem; color: #0f172a; }
      .pref-header h3 { font-size: 1rem; font-weight: 800; margin: 0; color: #0f172a; }

      .pref-row { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 0; border-top: 1px solid rgba(0, 0, 0, 0.05); }
      .pref-text { flex: 1; padding-right: 2rem; }
      .pref-text h4 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0 0 0.35rem; line-height: 1.3; }
      .pref-text p { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.5; }

      .toggle-wrapper {
        width: 48px; height: 24px; background: rgba(15, 23, 42, 0.15); border-radius: 99px; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(0, 0, 0, 0.05);
      }
      .toggle-wrapper.active { background: var(--brand); }
      .toggle-handle { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
      .toggle-wrapper.active .toggle-handle { left: 26px; }

      .text-brand { color: var(--brand); }
    `,
  ],
})
export class SettingsNotificationsTabComponent {
  public readonly aiBotStore = inject(AIBotStore);
}