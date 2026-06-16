import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiInputComponent,
  UiSelectComponent,
  UIMascotComponent,
  UiCardComponent,
  UiButtonComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  AIBotStore,
  mascotMouthToUi,
  MascotMouthType,
  type AIBot,
} from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-buddy-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UiInputComponent,
    UiSelectComponent,
    UIMascotComponent,
    UiCardComponent,
    UiButtonComponent,
  ],
  template: `
    <section class="content-section profile-hub">
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
        <button
          class="companion-pick-btn"
          [class.active]="companionEditorFeature() === 'buddy'"
          (click)="selectCompanion('buddy')"
          type="button"
        >
          <div class="pick-icon"><lucide-icon name="smile" size="20"></lucide-icon></div>
          <div class="pick-label">
            <span class="pick-name">Buddy</span>
            <span class="pick-desc">Asistente de chat principal</span>
          </div>
        </button>
        <button
          class="companion-pick-btn"
          [class.active]="companionEditorFeature() === 'dashboard'"
          (click)="selectCompanion('dashboard')"
          type="button"
        >
          <div class="pick-icon"><lucide-icon name="layout-dashboard" size="20"></lucide-icon></div>
          <div class="pick-label">
            <span class="pick-name">JAIME</span>
            <span class="pick-desc">Agente del panel de control</span>
          </div>
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
                motion="none"
                class="stage-mascot"
              />
            </div>

            <div class="stage-controls">
              <ui-input
                label="Nombre"
                [ngModel]="aiBotStore.getBotDisplayName(companion.feature)"
                (ngModelChange)="aiBotStore.updateBotName(companion.feature, $event)"
                placeholder="Ej: Buddy, JAIME…"
              ></ui-input>

              <div
                class="rage-toggle mt-4"
                [class.active]="aiBotStore.rageMode()"
                (click)="aiBotStore.setRageMode(!aiBotStore.rageMode())"
                (keydown.enter)="aiBotStore.setRageMode(!aiBotStore.rageMode())"
                (keydown.space)="aiBotStore.setRageMode(!aiBotStore.rageMode()); $event.preventDefault()"
                tabindex="0"
                role="switch"
                [attr.aria-checked]="aiBotStore.rageMode()"
                aria-label="Modo rage"
              >
                <div class="toggle-label">
                  <lucide-icon name="zap" size="14"></lucide-icon>
                  <span>MODO RAGE</span>
                </div>
                <div class="switch-pill"><div class="switch-handle"></div></div>
              </div>
            </div>
          </div>

          <div class="companion-panels" [class.dimmed]="aiBotStore.rageMode()">
            <ui-card variant="glass">
              <h3 class="panel-title">Apariencia</h3>

              <div class="standard-options" [class.dimmed]="aiBotStore.rageMode()">
                <div class="companion-form-grid">
                  <ui-select
                    label="Mascota (accesorio)"
                    [options]="mascotTypeOptions"
                    [ngModel]="companion.mascotType"
                    (ngModelChange)="aiBotStore.updateBotSkin(companion.feature, { mascotType: $event })"
                  ></ui-select>

                  <ui-select
                    label="Personalidad"
                    [options]="personalityOptions"
                    [ngModel]="companion.personality"
                    (ngModelChange)="aiBotStore.updateBotSkin(companion.feature, { personality: $event })"
                  ></ui-select>
                </div>

                <div class="form-group">
                  <span class="form-label">Color principal</span>
                  <div class="color-picker-grid">
                    @for (c of colorPresets; track c.n) {
                      <button
                        type="button"
                        class="color-swatch-item"
                        [class.active]="companion.color === c.m"
                        (click)="applyColorPreset(companion.feature, c.m, c.s)"
                        [attr.aria-label]="'Color ' + c.n"
                      >
                        <div class="color-swatch" [style.background]="c.m"></div>
                      </button>
                    }
                  </div>
                  <div class="companion-custom-primary">
                    <label class="form-label form-label-sub" [attr.for]="'custom-color-' + companion.feature">
                      Cualquier color
                    </label>
                    <input
                      [id]="'custom-color-' + companion.feature"
                      type="color"
                      class="color-input color-input-primary"
                      [value]="companion.color"
                      (input)="setCompanionPrimaryFromPicker(companion.feature, colorHexFromInput($event))"
                      title="Elegir color principal personalizado"
                    />
                    <span class="color-hex-hint">{{ companion.color }}</span>
                  </div>
                </div>

                <div class="form-group companion-secondary-row">
                  <label class="form-label" [attr.for]="'secondary-color-' + companion.feature">
                    Color secundario (sombra)
                  </label>
                  <input
                    [id]="'secondary-color-' + companion.feature"
                    type="color"
                    class="color-input"
                    [value]="companion.secondaryColor"
                    (input)="
                      aiBotStore.updateBotSkin(companion.feature, {
                        secondaryColor: colorHexFromInput($event),
                      })
                    "
                    title="Color secundario"
                  />
                </div>

                <div class="companion-form-grid">
                  <ui-select
                    label="Forma del cuerpo"
                    [options]="bodyShapeOptions"
                    [ngModel]="companion.bodyShape"
                    (ngModelChange)="aiBotStore.updateBotSkin(companion.feature, { bodyShape: $event })"
                  ></ui-select>

                  <ui-select
                    label="Ojos"
                    [options]="eyesOptions"
                    [ngModel]="companion.eyesType"
                    (ngModelChange)="aiBotStore.updateBotSkin(companion.feature, { eyesType: $event })"
                  ></ui-select>
                </div>

                <ui-select
                  label="Boca"
                  [options]="mouthOptions"
                  [ngModel]="companion.mouthType"
                  (ngModelChange)="aiBotStore.updateBotSkin(companion.feature, { mouthType: $event })"
                ></ui-select>
              </div>

              @if (aiBotStore.rageMode()) {
                <div class="rage-options mt-4">
                  <h4 class="rage-text">Configuración tóxica</h4>
                  <ui-select
                    label="Nivel de psicopatía"
                    [options]="rageOptions"
                    [ngModel]="aiBotStore.rageStyle()"
                    (ngModelChange)="aiBotStore.setRageStyle($event)"
                  ></ui-select>
                  <p class="rage-hint">
                    Cuidado: con este modo activo,
                    {{ aiBotStore.getBotDisplayName(companionEditorFeature()) }}
                    no tendrá filtros y puede ser grosero contigo.
                  </p>
                </div>
              }
            </ui-card>

            <ui-card variant="glass" class="buddy-skills-card">
              <h3 class="panel-title">
                Habilidades de confianza · {{ aiBotStore.getBotDisplayName(companion.feature) }}
              </h3>
              @if (companion.feature === 'dashboard') {
                <p class="buddy-skills-lead">
                  Estas activaciones son solo para tu usuario en este navegador.
                </p>
              }
              <div class="skills-config-list">
                @for (skill of companion.skills; track skill) {
                  <div class="skill-config-item">
                    <span class="skill-name">{{ skill }}</span>
                    <div
                      class="toggle-wrapper"
                      [class.active]="companionSkillActive(companion.feature, skill)"
                      (click)="companionToggleSkill(companion.feature, skill)"
                      (keydown.enter)="companionToggleSkill(companion.feature, skill)"
                      (keydown.space)="companionToggleSkill(companion.feature, skill); $event.preventDefault()"
                      tabindex="0"
                      role="switch"
                      [attr.aria-checked]="companionSkillActive(companion.feature, skill)"
                      [attr.aria-label]="'Alternar habilidad ' + skill"
                    >
                      <div class="toggle-handle"></div>
                    </div>
                  </div>
                }
              </div>
            </ui-card>

            @if (companion.feature === 'dashboard') {
              <ui-card variant="glass" class="jaime-user-layer-card">
                <h3 class="panel-title">Tu JAIME (cuenta actual)</h3>
                <p class="user-layer-lead">
                  Reglas e instrucciones extra para tu usuario. Se inyectan en el contexto del asistente del panel.
                </p>

                <div class="form-group">
                  <label class="form-label" for="rules-textarea">Reglas (texto libre)</label>
                  <textarea
                    id="rules-textarea"
                    class="user-agent-textarea"
                    rows="4"
                    [ngModel]="aiBotStore.dashboardUserLayer().rules"
                    (ngModelChange)="aiBotStore.updateUserAgentConfig('dashboard', { rules: $event })"
                    placeholder="Ej.: Prioriza KPIs de facturación; nunca inventes datos de clientes."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label" for="instructions-textarea">Instrucciones de sistema adicionales</label>
                  <textarea
                    id="instructions-textarea"
                    class="user-agent-textarea"
                    rows="4"
                    [ngModel]="aiBotStore.dashboardUserLayer().systemInstructions"
                    (ngModelChange)="aiBotStore.updateUserAgentConfig('dashboard', { systemInstructions: $event })"
                    placeholder="Tono, formato de respuestas, tablas cuando haya números…"
                  ></textarea>
                </div>

                <div class="form-group">
                  <div class="preset-header">
                    <span class="form-label mb-0">Prompts por comportamiento</span>
                    <ui-button variant="outline" size="sm" (clicked)="aiBotStore.addUserAgentPromptPreset('dashboard')">
                      Añadir
                    </ui-button>
                  </div>
                  @for (preset of aiBotStore.dashboardUserLayer().promptPresets; track preset.id) {
                    <div class="prompt-preset-block">
                      <div class="preset-row-head">
                        <input
                          class="preset-title-input"
                          type="text"
                          [ngModel]="preset.title"
                          (ngModelChange)="aiBotStore.updateUserAgentPromptPreset('dashboard', preset.id, { title: $event })"
                        />
                        <button
                          type="button"
                          class="preset-remove"
                          (click)="aiBotStore.removeUserAgentPromptPreset('dashboard', preset.id)"
                          aria-label="Quitar comportamiento"
                        >
                          <lucide-icon name="trash-2" size="16" aria-hidden="true"></lucide-icon>
                        </button>
                      </div>
                      <textarea
                        class="user-agent-textarea preset-body"
                        rows="3"
                        [ngModel]="preset.content"
                        (ngModelChange)="aiBotStore.updateUserAgentPromptPreset('dashboard', preset.id, { content: $event })"
                      ></textarea>
                    </div>
                  }
                </div>
              </ui-card>
            }
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
        margin-bottom: 2rem;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .hero-title {
        font-size: clamp(1.75rem, 3vw, 2.75rem);
        font-weight: 950;
        letter-spacing: -0.05em;
        color: inherit;
        margin: 0;
        line-height: 0.95;
      }
      .hero-title span { color: var(--brand); opacity: 0.9; }
      .hero-subtitle { font-size: 1rem; font-weight: 500; color: var(--text-muted); margin-top: 0.75rem; max-width: 520px; }

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
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
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
        transition: all 0.2s ease;
        min-width: 180px;
      }
      .companion-pick-btn:hover { background: rgba(255, 255, 255, 0.06); }
      .companion-pick-btn.active {
        background: color-mix(in srgb, var(--brand) 12%, var(--surface));
        border-color: var(--brand);
      }

      .pick-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
      }
      .pick-label { display: flex; flex-direction: column; text-align: left; }
      .pick-name { font-weight: 800; font-size: 0.9rem; }
      .pick-desc { font-size: 0.65rem; color: var(--text-muted); }

      .companion-studio {
        display: grid;
        grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
        gap: 1.5rem;
        align-items: start;
      }

      .companion-stage {
        background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 75%);
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
      }

      .stage-card {
        width: 220px;
        height: 220px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 50%;
        overflow: hidden;
        isolation: isolate;
      }
      .stage-card.is-rage-preview {
        border: 2px solid #dc2626;
        box-shadow: 0 0 40px rgba(220, 38, 38, 0.2);
        background: radial-gradient(circle, rgba(220, 38, 38, 0.2), transparent);
      }

      .stage-glow {
        position: absolute;
        inset: 10%;
        border-radius: 50%;
        filter: blur(32px);
        opacity: 0.28;
        pointer-events: none;
      }
      .stage-rings { position: absolute; inset: 0; pointer-events: none; }
      .ring { position: absolute; border: 1px solid var(--brand); border-radius: 50%; opacity: 0.15; }
      .ring-1 { inset: -8px; }
      .ring-2 { inset: -16px; }

      .stage-mascot {
        position: relative;
        z-index: 2;
        width: 150px;
        height: 150px;
        flex-shrink: 0;
      }

      .stage-controls { width: 100%; }

      .companion-panels {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }
      .companion-panels.dimmed .standard-options { opacity: 0.45; pointer-events: none; }

      .panel-title {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .companion-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .form-group { margin-bottom: 1rem; }
      .form-label {
        display: block;
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
      }
      .form-label-sub { margin-top: 0.75rem; }

      .color-picker-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .color-swatch-item {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        padding: 4px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.02);
      }
      .color-swatch-item:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.15); }
      .color-swatch-item.active { border-color: #fff; transform: scale(1.08); }

      .color-swatch {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
      }

      .companion-custom-primary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .color-input {
        width: 48px;
        height: 32px;
        padding: 0;
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }
      .color-input-primary { width: 56px; height: 36px; }

      .color-hex-hint {
        font-size: 0.75rem;
        font-weight: 600;
        font-family: ui-monospace, monospace;
        color: var(--text-muted);
      }

      .companion-secondary-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }

      .rage-toggle {
        background: rgba(15, 23, 42, 0.6);
        border: 1.5px solid rgba(220, 38, 38, 0.3);
        padding: 0.6rem 1.2rem;
        border-radius: 99px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition: 0.2s ease;
        min-width: 160px;
        justify-content: space-between;
      }
      .rage-toggle:hover { border-color: rgba(220, 38, 38, 0.6); background: rgba(220, 38, 38, 0.05); }
      .rage-toggle.active { background: #dc2626; border-color: #f87171; }
      .rage-toggle .toggle-label { display: flex; align-items: center; gap: 0.5rem; }
      .rage-toggle span { font-size: 0.75rem; font-weight: 800; color: #ef4444; letter-spacing: 0.08em; text-transform: uppercase; }
      .rage-toggle.active span { color: #fff; }

      .switch-pill { width: 32px; height: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 99px; position: relative; }
      .rage-toggle.active .switch-pill { background: rgba(0, 0, 0, 0.3); }
      .switch-handle { position: absolute; top: 3px; left: 3px; width: 10px; height: 10px; background: #fff; border-radius: 50%; transition: all 0.3s ease; }
      .rage-toggle.active .switch-handle { left: 19px; }

      .rage-text { margin: 0 0 0.75rem; font-size: 0.9rem; font-weight: 800; color: #ef4444; }
      .rage-hint {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.15);
        border-left: 3px solid #dc2626;
        font-style: italic;
      }

      .skills-config-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .skill-config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.65rem 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      }
      .skill-name { font-size: 0.85rem; font-weight: 600; }
      .buddy-skills-lead, .user-layer-lead {
        margin: -0.25rem 0 1rem;
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.45;
      }

      .toggle-wrapper {
        width: 48px;
        height: 24px;
        background: rgba(15, 23, 42, 0.35);
        border-radius: 99px;
        position: relative;
        cursor: pointer;
        border: 1px solid rgba(148, 163, 184, 0.2);
        flex-shrink: 0;
      }
      .toggle-wrapper.active { background: var(--brand); border-color: transparent; }
      .toggle-handle {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: left 0.2s ease;
      }
      .toggle-wrapper.active .toggle-handle { left: 26px; }

      .user-agent-textarea {
        width: 100%;
        min-height: 88px;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(2, 6, 23, 0.35);
        color: inherit;
        font: inherit;
        resize: vertical;
      }

      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .prompt-preset-block { margin-top: 0.75rem; }
      .preset-row-head { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; }
      .preset-title-input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(2, 6, 23, 0.25);
        color: inherit;
        font-weight: 700;
      }
      .preset-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 8px;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
      }
      .preset-remove:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.35); }

      .mt-4 { margin-top: 1rem; }

      @media (max-width: 960px) {
        .companion-studio { grid-template-columns: 1fr; }
        .companion-form-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class SettingsBuddyTabComponent {
  public readonly aiBotStore = inject(AIBotStore);

  private static readonly COMPANION_EDITOR_STORAGE_KEY = 'settings_companion_editor_feature';

  readonly companionEditorFeature = signal<'buddy' | 'dashboard'>(
    SettingsBuddyTabComponent.readStoredCompanionEditor(),
  );

  readonly pal = computed(() => this.aiBotStore.getBotByFeature(this.companionEditorFeature()));

  readonly mascotTypeOptions = [
    { value: 'inventory', label: 'Cubo Invernadero' },
    { value: 'projects', label: 'Hexágono Proyectos' },
    { value: 'budget', label: 'Cápsula Fiscal' },
    { value: 'clients', label: 'Esfera Social' },
    { value: 'fleet', label: 'Vehículo Drive' },
    { value: 'rentals', label: 'Cubo Alquiler' },
    { value: 'audit', label: 'Domo Auditor' },
    { value: 'dashboard', label: 'Panel de Control' },
    { value: 'universal', label: 'Droide Universal' },
  ];

  readonly personalityOptions = [
    { value: 'tech', label: 'Tecnocrático' },
    { value: 'worker', label: 'Productor' },
    { value: 'happy', label: 'Optimista' },
    { value: 'mystic', label: 'Místico / oculto' },
    { value: 'explorer', label: 'Explorador' },
    { value: 'ninja', label: 'Sigiloso / ninja' },
    { value: 'queen', label: 'Regio / reina' },
  ];

  readonly colorPresets = [
    { m: '#facc15', s: '#ca8a04', n: 'Pato Clásico' },
    { m: '#f43f5e', s: '#9f1239', n: 'Cereza' },
    { m: '#10b981', s: '#059669', n: 'Hulk' },
    { m: '#8b5cf6', s: '#6d28d9', n: 'Místico' },
    { m: '#3b82f6', s: '#1d4ed8', n: 'Aqua' },
    { m: '#1e293b', s: '#0f172a', n: 'Stealth' },
  ];

  readonly bodyShapeOptions = [
    { value: 'round', label: 'Esfera gordita' },
    { value: 'square', label: 'Cubo bloque' },
    { value: 'capsule', label: 'Cápsula' },
    { value: 'tri', label: 'Triángulo' },
    { value: 'mushroom-cap', label: 'Seta (Sombrero clásico)' },
    { value: 'mushroom-full', label: 'Seta completa' },
    { value: 'mushroom-luminescent', label: 'Seta bioluminiscente' },
    { value: 'mushroom-morel', label: 'Seta colmenilla' },
    { value: 'bonsai', label: 'Bonsái zen' },
    { value: 'bonsai-sakura', label: 'Bonsái sakura' },
    { value: 'bonsai-maple', label: 'Bonsái arce' },
  ];

  readonly eyesOptions = [
    { value: 'joy', label: 'Feliz / kawaii' },
    { value: 'dots', label: 'Puntos simples' },
    { value: 'shades', label: 'Gafas de sol' },
    { value: 'glow', label: 'Brillo neón' },
    { value: 'angry', label: 'Cejudo / serio' },
  ];

  readonly mouthOptions = [
    { value: 'smile', label: 'Sonrisa' },
    { value: 'line', label: 'Neutra (línea)' },
    { value: 'o', label: 'Boca en O' },
    { value: 'grin', label: 'Sonrisa ancha' },
    { value: 'none', label: 'Discreta / mínima' },
  ];

  readonly rageOptions: Array<{ value: 'angry' | 'terror' | 'dark'; label: string }> = [
    { value: 'angry', label: 'Enfadado (Rojo)' },
    { value: 'terror', label: 'Terror Psicológico' },
    { value: 'dark', label: 'Vacío Oscuro' },
  ];

  constructor() {
    effect(() => {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(
          SettingsBuddyTabComponent.COMPANION_EDITOR_STORAGE_KEY,
          this.companionEditorFeature(),
        );
      } catch {
        /* ignore */
      }
    });
  }

  selectCompanion(feature: 'buddy' | 'dashboard'): void {
    this.companionEditorFeature.set(feature);
  }

  private static readStoredCompanionEditor(): 'buddy' | 'dashboard' {
    if (typeof localStorage === 'undefined') return 'buddy';
    try {
      const v = localStorage.getItem(SettingsBuddyTabComponent.COMPANION_EDITOR_STORAGE_KEY);
      if (v === 'buddy' || v === 'dashboard') return v;
    } catch {
      /* ignore */
    }
    return 'buddy';
  }

  mascotMouthFor(bot: AIBot | null | undefined): MascotMouthType {
    if (!bot) return 'smile';
    return mascotMouthToUi(bot.mouthType);
  }

  companionSkillActive(feature: string, skill: string): boolean {
    if (feature === 'dashboard') {
      return this.aiBotStore.isUserAgentSkillActive('dashboard', skill);
    }
    const bot = this.aiBotStore.getBotByFeature(feature);
    return bot?.activeSkills.includes(skill) ?? false;
  }

  companionToggleSkill(feature: string, skill: string): void {
    if (feature === 'dashboard') {
      this.aiBotStore.toggleUserAgentSkill('dashboard', skill);
    } else {
      this.aiBotStore.toggleSkill(feature, skill);
    }
  }

  applyColorPreset(feature: string, primary: string, secondary: string): void {
    this.aiBotStore.updateBotSkin(feature, { color: primary, secondaryColor: secondary });
  }

  setCompanionPrimaryFromPicker(feature: string, primaryHex: string): void {
    this.aiBotStore.updateBotSkin(feature, {
      color: primaryHex,
      secondaryColor: SettingsBuddyTabComponent.darkenHex(primaryHex, 0.38),
    });
  }

  colorHexFromInput(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private static darkenHex(hex: string, factor: number): string {
    const normalized = hex.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return '#0f172a';
    }
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    const mix = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - factor))));
    return `#${mix(r).toString(16).padStart(2, '0')}${mix(g).toString(16).padStart(2, '0')}${mix(b).toString(16).padStart(2, '0')}`;
  }
}
