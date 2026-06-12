import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiInputComponent,
  UiSelectComponent,
  UIMascotComponent,
} from '@josanz-erp/shared-ui-kit';
import { AIBotStore, mascotMouthToUi, MascotMouthType } from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-buddy-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiInputComponent, UiSelectComponent, UIMascotComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Inteligencia</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Compañeros</span>
      </div>

      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Tus <span>Compañeros</span></h2>
          <p class="hero-subtitle">Personaliza la apariencia y habilidades de cada asistente personal</p>
        </div>
        <div class="hero-right">
          <div class="security-badge">
            <lucide-icon name="heart" size="16"></lucide-icon>
            <span>Activo: {{ aiBotStore.getBotDisplayName(aiBotStore.activeBotFeature()) }}</span>
          </div>
        </div>
      </div>

      <div class="companion-pick-row">
        <button class="companion-pick-btn" [class.active]="companionEditorFeature() === 'buddy'" (click)="companionEditorFeature.set('buddy')" type="button">
          <div class="pick-icon"><lucide-icon name="smile" size="20"></lucide-icon></div>
          <div class="pick-label"><span class="pick-name">Buddy</span><span class="pick-desc">Asistente de chat principal</span></div>
        </button>
        <button class="companion-pick-btn" [class.active]="companionEditorFeature() === 'dashboard'" (click)="companionEditorFeature.set('dashboard')" type="button">
          <div class="pick-icon"><lucide-icon name="layout-dashboard" size="20"></lucide-icon></div>
          <div class="pick-label"><span class="pick-name">JAIME</span><span class="pick-desc">Agente del panel de control</span></div>
        </button>
      </div>

      @if (pal(); as companion) {
        <div class="companion-studio">
          <div class="companion-stage">
            <div class="stage-card" [class.is-rage-preview]="aiBotStore.rageMode()">
              <div class="stage-glow" [style.background]="companion.color"></div>
              <div class="stage-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
              </div>
              <ui-mascot
                [type]="companion.mascotType"
                [color]="companion.color"
                [secondaryColor]="companion.secondaryColor"
                [personality]="companion.personality"
                [bodyShape]="companion.bodyShape"
                [eyesType]="companion.eyesType"
                [mouthType]="mascotMouthFor(companion)"
                [rageMode]="aiBotStore.rageMode()"
                [rageStyle]="aiBotStore.rageStyle()"
                class="stage-mascot"
              />
            </div>

            <div class="stage-controls">
              <ui-input label="Nombre" [ngModel]="aiBotStore.getBotDisplayName(companion.feature)" (ngModelChange)="aiBotStore.updateBotName(companion.feature, $event)" placeholder="Ej: Buddy, JAIME…"></ui-input>

              <div class="rage-toggle mt-4" [class.active]="aiBotStore.rageMode()" (click)="aiBotStore.setRageMode(!aiBotStore.rageMode())" (keydown.enter)="aiBotStore.setRageMode(!aiBotStore.rageMode())" (keydown.space)="aiBotStore.setRageMode(!aiBotStore.rageMode())" tabindex="0" role="switch" [attr.aria-checked]="aiBotStore.rageMode()" aria-label="Modo rage">
                <div class="toggle-label"><lucide-icon name="zap" size="14"></lucide-icon><span>MODO RAGE</span></div>
                <div class="switch-pill"><div class="switch-handle"></div></div>
              </div>

              @if (aiBotStore.rageMode()) {
                <div class="rage-options animate-slide-up mt-4">
                  <ui-select label="Nivel de Psicopatía" [options]="rageOptions" [ngModel]="aiBotStore.rageStyle()" (ngModelChange)="aiBotStore.setRageStyle($event)"></ui-select>
                  <p class="rage-hint">Cuidado: con este modo activo, {{ aiBotStore.getBotDisplayName(companionEditorFeature()) }} no tendrá filtros y puede ser grosero contigo.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
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

      .hero-subtitle { font-size: 1rem; font-weight: 500; color: #64748b; margin-top: 1rem; }

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

      .companion-pick-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
      }

      .companion-pick-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        border-radius: 16px;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.03);
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 180px;
      }

      .companion-pick-btn:hover { background: rgba(255, 255, 255, 0.06); }
      .companion-pick-btn.active { background: color-mix(in srgb, var(--brand) 12%, var(--surface)); border-color: var(--brand); }

      .pick-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
      .pick-label { display: flex; flex-direction: column; text-align: left; }
      .pick-name { font-weight: 800; font-size: 0.9rem; color: #fff; }
      .pick-desc { font-size: 0.65rem; color: #94a3b8; }

      .companion-studio { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; }

      .companion-stage {
        background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand) 15%, transparent), transparent 75%);
        border-radius: 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .stage-card {
        width: 240px;
        height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
      }

      .stage-card.is-rage-preview {
        border: 2px solid #dc2626;
        box-shadow: 0 0 40px rgba(220, 38, 38, 0.2);
        background: radial-gradient(circle, rgba(220, 38, 38, 0.2), transparent);
      }

      .stage-glow { width: 100%; height: 100%; border-radius: 50%; filter: blur(40px); opacity: 0.3; }
      .stage-rings { position: absolute; inset: 0; }
      .ring { position: absolute; border: 1px solid var(--brand); border-radius: 50%; opacity: 0.15; }
      .ring-1 { inset: -10px; }
      .ring-2 { inset: -20px; }

      .stage-controls { width: 100%; }

      .rage-toggle {
        background: rgba(15, 23, 42, 0.6);
        border: 1.5px solid rgba(220, 38, 38, 0.3);
        padding: 0.6rem 1.2rem;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: 0.4s ease;
        min-width: 160px;
        justify-content: space-between;
      }

      .rage-toggle:hover { border-color: rgba(220, 38, 38, 0.6); background: rgba(220, 38, 38, 0.05); transform: translateY(-2px); }
      .rage-toggle.active { background: #dc2626; border-color: #f87171; }

      .rage-toggle .toggle-label { display: flex; align-items: center; gap: 0.5rem; }
      .rage-toggle span { font-size: 0.75rem; font-weight: 800; color: #ef4444; letter-spacing: 0.08em; text-transform: uppercase; }
      .rage-toggle.active span { color: #fff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); }

      .switch-pill { width: 32px; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 99px; position: relative; }
      .rage-toggle.active .switch-pill { background: rgba(0, 0, 0, 0.3); }

      .switch-handle { position: absolute; top: 3px; left: 3px; width: 10px; height: 10px; background: #fff; border-radius: 50%; transition: all 0.3s ease; }
      .rage-toggle.active .switch-handle { left: 19px; }

      .rage-hint {
        font-size: 0.75rem; color: #94a3b8; margin-top: 1.5rem; padding: 0.75rem; background: rgba(0, 0, 0, 0.2); border-left: 3px solid #dc2626; font-style: italic;
      }
    `,
  ],
})
export class SettingsBuddyTabComponent {
  public readonly aiBotStore = inject(AIBotStore);

  private static readonly COMPANION_EDITOR_STORAGE_KEY = 'settings_companion_editor_feature';

  readonly companionEditorFeature = signal<'buddy' | 'dashboard'>(
    SettingsBuddyTabComponent.readStoredCompanionEditor()
  );

  private static readStoredCompanionEditor(): 'buddy' | 'dashboard' {
    if (typeof localStorage === 'undefined') return 'buddy';
    try {
      const v = localStorage.getItem(SettingsBuddyTabComponent.COMPANION_EDITOR_STORAGE_KEY);
      if (v === 'buddy' || v === 'dashboard') return v;
    } catch { /* ignore */ }
    return 'buddy';
  }

  readonly pal = computed(() => this.aiBotStore.getBotByFeature(this.companionEditorFeature()));

  readonly rageOptions: Array<{ value: 'angry' | 'terror' | 'dark'; label: string }> = [
    { value: 'angry', label: 'Enfadado (Rojo)' },
    { value: 'terror', label: 'Terror Psicológico' },
    { value: 'dark', label: 'Vacío Oscuro' }
  ];

  mascotMouthFor(bot: ReturnType<typeof this.pal>): MascotMouthType {
    if (!bot) return 'smile';
    return mascotMouthToUi(bot.mouthType);
  }
}