import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore } from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-security-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCardComponent, UiSelectComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Cuenta</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Seguridad</span>
      </div>
      <div class="section-title">
        <h2>Seguridad de Acceso</h2>
        <p>Gestiona tu contraseña y sesiones activas</p>
      </div>

      <div class="grid-config">
        <ui-card variant="glass" class="prefs-card">
          <h3 class="config-subtitle">
            <lucide-icon name="clock" size="16" aria-hidden="true"></lucide-icon> Sesión
          </h3>
          <div class="form-group">
            <ui-select
              label="Tiempo de espera de sesión"
              [options]="sessionTimeoutOptions"
              [(ngModel)]="sessionTimeoutValue"
            ></ui-select>
          </div>
        </ui-card>

        <ui-card variant="glass" class="prefs-card">
          <h3 class="config-subtitle">
            <lucide-icon name="trash2" size="16" aria-hidden="true"></lucide-icon> Gestión de Datos
          </h3>
          <div class="pref-row">
            <div class="pref-text">
              <h4>Auto-archivo de chats</h4>
              <p>Mueve conversaciones antiguas al historial automáticamente</p>
            </div>
            <div class="toggle-wrapper" 
                 (click)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())" 
                 (keydown.enter)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
                 (keydown.space)="aiBotStore.autoArchive.set(!aiBotStore.autoArchive())"
                 [class.active]="aiBotStore.autoArchive()" 
                 tabindex="0" role="switch" 
                 [attr.aria-checked]="aiBotStore.autoArchive()" 
                 aria-label="Auto-archivo de chats">
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

      .section-title h2 { font-size: 1.5rem; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.02em; }
      .section-title p { font-size: 0.9rem; color: #64748b; margin: 0.5rem 0 0 0; }

      .grid-config { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1.5rem; }

      .config-subtitle { font-size: 1rem; font-weight: 800; color: #fff; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; }
      .config-subtitle lucide-icon { color: var(--brand); }

      .form-group { margin-top: 1rem; }

      .pref-row {
        display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 0; border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
      .pref-text { flex: 1; padding-right: 2rem; }
      .pref-text h4 { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0 0 0.35rem; line-height: 1.3; }
      .pref-text p { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.5; }

      .toggle-wrapper {
        width: 48px; height: 24px; background: rgba(15, 23, 42, 0.15); border-radius: 99px; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(0, 0, 0, 0.05);
      }
      .toggle-wrapper.active { background: var(--brand); }
      .toggle-handle { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
      .toggle-wrapper.active .toggle-handle { left: 26px; }
    `,
  ],
})
export class SettingsSecurityTabComponent {
  public readonly aiBotStore = inject(AIBotStore);

  readonly sessionTimeoutOptions = [
    { value: 15, label: '15 Minutos' },
    { value: 30, label: '30 Minutos' },
    { value: 60, label: '1 Hora' },
    { value: 0, label: 'Nunca (No recomendado)' }
  ];

  get sessionTimeoutValue() { return this.aiBotStore.sessionTimeout(); }
  set sessionTimeoutValue(v: number) { this.aiBotStore.sessionTimeout.set(v); }
}