import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiCardComponent, UIMascotComponent, UiBadgeComponent, UiSelectComponent } from '@josanz-erp/shared-ui-kit';
import { AIBotStore, mascotMouthToUi } from '@josanz-erp/shared-data-access';
import { FormsModule } from '@angular/forms';
import { MascotMouthType } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-settings-ai-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCardComponent, UiSelectComponent, UIMascotComponent, UiBadgeComponent],
  template: `
    <section class="content-section animate-slide-up">
      <div class="section-breadcrumb">
        <span>Inteligencia</span>
        <lucide-icon name="chevron-right" size="12"></lucide-icon>
        <span class="current">Núcleo de Inferencia</span>
      </div>
      
      <div class="profile-hero">
        <div class="hero-left">
          <h2 class="hero-title">Motor de <span>IA</span></h2>
          <p class="hero-subtitle">Configura el núcleo de pensamiento y la orquestación de agentes</p>
        </div>
        <div class="hero-right">
          <div class="security-badge" [class.online]="aiBotStore.providerApiKey()">
            <lucide-icon name="cpu" size="16"></lucide-icon>
            <span>{{ aiBotStore.providerApiKey() ? 'NÚCLEO CONECTADO' : 'SIN CREDENCIALES' }}</span>
          </div>
        </div>
      </div>

      <div class="identity-main-card mb-12">
        <div class="identity-form pr-12">
          <div class="grid grid-cols-2 gap-6">
            <ui-select
              [options]="aiBotStore.aiModelOptions()"
              [ngModel]="aiBotStore.selectedModelId()"
              (ngModelChange)="aiBotStore.setAIModel($event)"
              label="Proveedor Base"
            ></ui-select>
            <ui-select
              [options]="botOptions()"
              [ngModel]="aiBotStore.activeBotFeature()"
              (ngModelChange)="aiBotStore.activeBotFeature.set($event)"
              label="Agente Principal"
            ></ui-select>
          </div>

          @if (aiBotStore.needsApiKey()) {
            <div class="luxe-input-group mt-8">
              <label class="luxe-label" for="api-key-input">Token de Acceso Seguro (API KEY)</label>
              <input id="api-key-input" type="password" [ngModel]="aiBotStore.providerApiKey()" (ngModelChange)="aiBotStore.providerApiKey.set($event)" class="luxe-underlined-input" placeholder="AIzaSy... •••••" aria-label="Token de Acceso Seguro (API KEY)">
            </div>
          }
        </div>
        
        <div class="avatar-projection-area">
          <div class="hologram-ring"></div>
          <div class="hologram-glow"></div>
          @if (activeBot(); as bot) {
            <ui-mascot
              [type]="bot.mascotType"
              [color]="bot.color"
              [secondaryColor]="bot.secondaryColor"
              [personality]="bot.personality"
              [bodyShape]="bot.bodyShape"
              [eyesType]="bot.eyesType"
              [mouthType]="mascotMouthFor(bot)"
              class="identity-mascot"
            />
          }
        </div>
      </div>

      <div class="grid-config">
        @for (bot of aiBotStore.bots(); track bot.id) {
          <ui-card variant="glass" class="bot-crystal-card">
            <div class="badge-header">
              <span class="category-tag">{{ bot.feature }}</span>
              @if (aiBotStore.activeBotFeature() === bot.feature) {
                <ui-badge variant="success">CORE</ui-badge>
              }
            </div>

            <div class="bot-view-area py-6 flex items-center justify-center">
              <ui-mascot
                [type]="bot.mascotType"
                [color]="bot.color"
                [secondaryColor]="bot.secondaryColor"
                [personality]="bot.personality"
                [bodyShape]="bot.bodyShape"
                [eyesType]="bot.eyesType"
                [mouthType]="mascotMouthFor(bot)"
              />
            </div>

            <h3 class="text-lg font-bold mb-1">{{ bot.name }}</h3>
            <p class="text-xs text-slate-500 mb-6 line-clamp-2 h-8">{{ bot.description }}</p>

            <div class="pref-row">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado SaaS</span>
              <div class="toggle-wrapper" [class.active]="bot.status === 'active'" 
                   (click)="aiBotStore.toggleBotStatus(bot.feature)" 
                   (keydown.enter)="aiBotStore.toggleBotStatus(bot.feature)"
                   (keydown.space)="aiBotStore.toggleBotStatus(bot.feature)"
                   tabindex="0" role="switch" 
                   [attr.aria-checked]="bot.status === 'active'" 
                   aria-label="Alternar estado SaaS">
                <div class="toggle-handle"></div>
              </div>
            </div>
          </ui-card>
        }
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
      }

      .security-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }

      .security-badge.online {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.2);
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
      }

      .luxe-input-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .luxe-label {
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

      .toggle-wrapper {
        width: 48px;
        height: 24px;
        background: rgba(15, 23, 42, 0.15);
        border-radius: 99px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      .toggle-wrapper.active { background: var(--brand); }

      .toggle-handle {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .toggle-wrapper.active .toggle-handle { left: 26px; }

      .pref-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }

      .grid-config {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        gap: 1.5rem;
      }

      .bot-crystal-card {
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
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
    `,
  ],
})
export class SettingsAiTabComponent {
  public readonly aiBotStore = inject(AIBotStore);

  readonly activeBot = computed(() => 
    this.aiBotStore.getBotByFeature(this.aiBotStore.activeBotFeature())
  );

  readonly botOptions = computed(() =>
    this.aiBotStore
      .bots()
      .map((bot) => ({
        value: bot.feature,
        label: `${this.aiBotStore.getBotDisplayName(bot.feature)} (${bot.feature})`,
      }))
      .sort((a, b) => {
        if (a.value === 'buddy') return -1;
        if (b.value === 'buddy') return 1;
        if (a.value === 'dashboard') return -1;
        if (b.value === 'dashboard') return 1;
        return a.label.localeCompare(b.label);
      }),
  );

  mascotMouthFor(bot: ReturnType<typeof this.aiBotStore.getBotByFeature>): MascotMouthType {
    if (!bot) return 'smile';
    return mascotMouthToUi(bot.mouthType);
  }
}