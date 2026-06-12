import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore } from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-general-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCardComponent, UiSelectComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Plataforma</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Motor de Experiencia</span>
      </div>
      
      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Ajustes <span>Núcleo</span></h2>
          <p class="hero-subtitle">Parámetros operativos y preferencias globales de interacción</p>
        </div>
      </div>

      <div class="grid-config">
        <ui-card variant="glass">
          <div class="pref-header">
            <lucide-icon name="languages" size="20" class="text-brand"></lucide-icon>
            <h3>Idioma y Localización</h3>
          </div>
          <div class="form-group mt-6">
            <ui-select [options]="languageOptions" [(ngModel)]="languageValue" label="Idioma Global del Sistema"></ui-select>
          </div>
          <p class="config-desc mt-4">Afecta tanto a la interfaz como al razonamiento de los agentes de IA.</p>
        </ui-card>

        <ui-card variant="glass">
          <div class="pref-header">
            <lucide-icon name="zap" size="20" class="text-brand"></lucide-icon>
            <h3>Optimización de Interfaz</h3>
          </div>
          <div class="pref-row mt-6">
            <div class="pref-text">
              <h4>Modo Compacto</h4>
              <p>Priorizar densidad de datos en lugar de aire visual</p>
            </div>
            <div class="toggle-wrapper" [class.active]="aiBotStore.compactMode()" 
                 (click)="aiBotStore.compactMode.set(!aiBotStore.compactMode())" 
                 (keydown.enter)="aiBotStore.compactMode.set(!aiBotStore.compactMode())"
                 (keydown.space)="aiBotStore.compactMode.set(!aiBotStore.compactMode())"
                 tabindex="0" role="switch" 
                 [attr.aria-checked]="aiBotStore.compactMode()" 
                 aria-label="Alternar modo compacto">
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

      .text-brand { color: var(--brand); }

      .config-desc { font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }

      .form-group { margin-top: 1rem; }
    `,
  ],
})
export class SettingsGeneralTabComponent {
  public readonly aiBotStore = inject(AIBotStore);
  
  readonly languageOptions = [
    { value: 'es', label: 'Español (Castellano)' },
    { value: 'en', label: 'English (US)' },
    { value: 'fr', label: 'Français (Beta)' }
  ];

  get languageValue() { return this.aiBotStore.language(); }
  set languageValue(v: string) { this.aiBotStore.language.set(v); }
}