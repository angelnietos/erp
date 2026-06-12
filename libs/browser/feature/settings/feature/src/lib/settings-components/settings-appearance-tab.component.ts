import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore, ThemeService } from '@josanz-erp/shared-data-access';
import { PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-settings-appearance-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCardComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Motor Visual</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Atmósfera</span>
      </div>

      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Diseño <span>Luxe</span></h2>
          <p class="hero-subtitle">Renderizado de alta fidelidad, identidad cromática y feedback sensorial inmersivo</p>
        </div>
      </div>

      <div class="grid-config">
        <ui-card variant="glass">
          <div class="pref-header mb-6">
            <lucide-icon name="sparkles" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
            <h3>Motor Crystal</h3>
          </div>

          <div class="pref-row">
            <div class="pref-text">
              <h4 class="text-brand">Luxe Mode V2</h4>
              <p>Glassmorphism, reflejos dinámicos y sombras de alta fidelidad</p>
            </div>
            <div class="toggle-wrapper premium" [class.active]="premiumExperience()" 
                 (click)="togglePremium()" 
                 (keydown.enter)="togglePremium()"
                 (keydown.space)="togglePremium()"
                 tabindex="0" role="switch" 
                 [attr.aria-checked]="premiumExperience()" 
                 aria-label="Alternar Luxe Mode V2">
              <div class="toggle-handle"></div>
            </div>
          </div>

          <div class="pref-row">
            <div class="pref-text">
              <h4>Modo Compacto</h4>
              <p>Mayor densidad de datos, menos espacio en blanco</p>
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

        <ui-card variant="glass">
          <div class="pref-header mb-6">
            <lucide-icon name="palette" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
            <h3>Identidad Cromática</h3>
          </div>
          
          <div class="form-group mb-6">
            <span class="form-label">Color de Marca Institucional</span>
            <div class="color-picker-grid mt-3">
              @for (c of colorPresets; track c.m) {
                <button type="button" class="color-swatch-item" [class.active]="themeService.currentThemeData().primary === c.m" 
                        (click)="themeService.updatePrimaryColor(c.m)"
                        (keydown.enter)="themeService.updatePrimaryColor(c.m)"
                        (keydown.space)="themeService.updatePrimaryColor(c.m)"
                        tabindex="0" role="button" [attr.aria-label]="'Seleccionar color ' + c.n">
                  <div class="color-swatch" [style.background]="c.m"></div>
                </button>
              }
            </div>
          </div>

          <div class="pref-row">
            <div class="pref-text">
              <h4>Modo Oscuro Profundo</h4>
              <p>Negros OLED puros para máximo contraste</p>
            </div>
            <div class="toggle-wrapper active">
              <div class="toggle-handle"></div>
            </div>
          </div>
        </ui-card>

        <ui-card variant="glass">
          <div class="pref-header mb-6">
            <lucide-icon name="volume-2" size="20" class="text-brand" aria-hidden="true"></lucide-icon>
            <h3>Feedback Sensorial</h3>
          </div>
          <div class="pref-row">
            <div class="pref-text">
              <h4>Efectos de Sonido Espacial</h4>
              <p>Feedback acústico al interactuar con superficies cristal</p>
            </div>
            <div class="toggle-wrapper active"><div class="toggle-handle"></div></div>
          </div>
          <div class="pref-row">
            <div class="pref-text">
              <h4>Voz del Asistente</h4>
              <p>Síntesis de voz premium para respuestas de IA</p>
            </div>
            <div class="toggle-wrapper"><div class="toggle-handle"></div></div>
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

      .form-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; }

      .color-picker-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }

      .color-swatch-item {
        width: 44px; height: 44px; border-radius: 14px; padding: 4px; border: 2px solid transparent; cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.02);
      }
      .color-swatch-item:hover { transform: translateY(-5px) rotate(8deg) scale(1.1); background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); }
      .color-swatch-item.active { border-color: #fff; background: rgba(255, 255, 255, 0.08); transform: scale(1.15); box-shadow: 0 0 20px 2px color-mix(in srgb, currentColor 40%, transparent); }

      .color-swatch { width: 100%; height: 100%; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4); position: relative; overflow: hidden; }
      .color-swatch::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%); }

      .text-brand { color: var(--brand); }
    `,
  ],
})
export class SettingsAppearanceTabComponent {
  public readonly aiBotStore = inject(AIBotStore);
  public readonly pluginStore = inject(PluginStore);
  public readonly themeService = inject(ThemeService);

  readonly premiumExperience = computed(() => !this.pluginStore.highPerformanceMode());

  readonly colorPresets = [
    { m: '#facc15', n: 'Gold' },
    { m: '#e60012', n: 'Royal Red' },
    { m: '#10b981', n: 'Emerald' },
    { m: '#8b5cf6', n: 'Violet' },
    { m: '#0ea5e9', n: 'Sky' }
  ];

  togglePremium(): void {
    this.pluginStore.togglePerformance();
  }
}