import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-settings-labs-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Organización</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Laboratorio</span>
      </div>

      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Genesis <span>Engine</span></h2>
          <p class="hero-subtitle">Features experimentales de próxima generación bajo protocolo de acceso controlado</p>
        </div>
        <div class="hero-right">
          <div class="security-badge">
            <lucide-icon name="flask-conical" size="16"></lucide-icon>
            <span>ACCESO EARLY ADOPTER</span>
          </div>
        </div>
      </div>

      <div class="grid-config">
        <ui-card variant="glass">
          <div class="badge-header mb-6">
            <span class="category-tag">MOTOR NÚCLEO</span>
            <lucide-icon name="cpu" size="18" class="text-brand"></lucide-icon>
          </div>
          <div class="pref-row">
            <div class="pref-text">
              <h4>Josanz Genesis Engine</h4>
              <p>Motor de razonamiento autónomo profundo con inferencia multi-paso</p>
            </div>
            <div class="toggle-wrapper" 
                 (click)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())" 
                 (keydown.enter)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())"
                 (keydown.space)="aiBotStore.experimentalFeatures.set(!aiBotStore.experimentalFeatures())"
                 [class.active]="aiBotStore.experimentalFeatures()" tabindex="0" role="switch" [attr.aria-checked]="aiBotStore.experimentalFeatures()" aria-label="Habilitar funciones beta">
              <div class="toggle-handle"></div>
            </div>
          </div>
        </ui-card>

        <ui-card variant="glass">
          <div class="badge-header mb-6">
            <span class="category-tag">PROTOCOLO</span>
            <lucide-icon name="shield-check" size="18" class="text-brand"></lucide-icon>
          </div>
          <p class="text-sm text-slate-500 leading-relaxed">
            Las funciones Beta son inestables por definición. Actívalas sólo si aceptas que el comportamiento puede diferir de la versión estable y que los datos generados pueden no persistir entre versiones.
          </p>
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

      .security-badge {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid rgba(245, 158, 11, 0.2);
      }

      .grid-config { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1.5rem; }

      .badge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
      .category-tag { font-size: 0.6rem; font-weight: 900; color: #94a3b8; letter-spacing: 0.15em; text-transform: uppercase; }

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
export class SettingsLabsTabComponent {
  public readonly aiBotStore = inject(AIBotStore);
}