import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AIBotStore, AIInferenceService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'app-document-ai-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dg-settings-page space-y-8">
      <nav class="dg-breadcrumb" aria-label="Ubicación">
        <a routerLink="/documents/list">Documentos</a>
        <span class="text-muted" aria-hidden="true">/</span>
        <span class="dg-breadcrumb__current">Configuración de IA</span>
      </nav>

      <div class="dg-panel dg-hero">
        <div class="dg-hero__icon" aria-hidden="true">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <h1 class="dg-hero__title">Motor de inferencia (IA)</h1>
        <p class="dg-hero__lead">
          Elige el proveedor y, si hace falta, pega tu clave API. Los valores se
          guardan solo en este navegador (localStorage), igual que en el ERP
          principal — así el generador y el asistente flotante comparten la misma
          configuración.
        </p>
      </div>

      <div class="dg-panel space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm font-semibold text-primary">Estado del motor</span>
          @if (ai.needsApiKey() && !ai.providerApiKey().trim()) {
            <span class="dg-status-pill dg-status-pill--warn">Falta clave API</span>
          } @else if (ai.needsApiKey() && ai.providerApiKey().trim()) {
            <span class="dg-status-pill dg-status-pill--ok">Clave configurada</span>
          } @else {
            <span class="dg-status-pill dg-status-pill--neutral">
              {{ ollamaSelected() ? 'Ollama local' : 'Modo sin clave propia' }}
            </span>
          }
        </div>

        <div class="dg-form-stack">
          <div>
            <label for="ai-model" class="dg-form-label">Modelo / proveedor</label>
            <select
              id="ai-model"
              class="w-full dg-field"
              [ngModel]="ai.selectedModelId()"
              (ngModelChange)="ai.setAIModel($event)"
            >
              @for (opt of ai.aiModelOptions(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          @if (ai.needsApiKey()) {
            <div>
              <label for="ai-api-key" class="dg-form-label">Clave API (token)</label>
              <input
                id="ai-api-key"
                type="password"
                autocomplete="off"
                class="w-full dg-field font-mono"
                placeholder="Pega tu clave (p. ej. AIza… para Gemini, sk-… para OpenAI)"
                [ngModel]="ai.providerApiKey()"
                (ngModelChange)="ai.providerApiKey.set($event)"
              />
              <p class="dg-form-hint">
                Gemini: consola de Google AI Studio. OpenAI / OpenRouter / xAI: el
                token de tu cuenta. No se envía al servidor de Josanz; solo se usa
                en el navegador para llamar al proveedor.
              </p>
            </div>
          }

          @if (ollamaSelected()) {
            <div class="dg-hint-box dg-form-stack">
              <p class="text-sm font-semibold text-primary">Ollama (local)</p>
              <div>
                <label for="ollama-url" class="dg-form-label">URL base</label>
                <input
                  id="ollama-url"
                  type="url"
                  class="w-full dg-field"
                  [ngModel]="ai.ollamaConfig().baseUrl"
                  (ngModelChange)="onOllamaBaseUrl($event)"
                />
              </div>
              <div>
                <label for="ollama-model" class="dg-form-label">Nombre del modelo</label>
                <input
                  id="ollama-model"
                  type="text"
                  class="w-full dg-field"
                  [ngModel]="ai.ollamaConfig().model"
                  (ngModelChange)="onOllamaModelName($event)"
                />
              </div>
              <button
                type="button"
                class="dg-btn dg-btn-secondary dg-btn-sm self-start"
                (click)="onRefreshOllama()"
              >
                Comprobar Ollama y listar modelos
              </button>
              @if (ai.ollamaConfig().available) {
                <p class="dg-form-hint text-emerald-600 dark:text-emerald-400">
                  Servidor Ollama detectado.
                </p>
              }
              @if (ai.freeModels().localModels.length > 0) {
                <p class="dg-form-hint">
                  Modelos locales:
                  {{ ai.freeModels().localModels.join(', ') }}
                </p>
              }
            </div>
          }
        </div>

        <div class="flex flex-wrap gap-3 pt-2 border-t border-soft">
          <a routerLink="/documents/create" class="dg-btn dg-btn-primary">
            Ir al editor
          </a>
          <a routerLink="/documents/list" class="dg-btn dg-btn-secondary">
            Volver a documentos
          </a>
        </div>

        <p class="dg-form-hint border-t border-soft pt-4 mb-0">
          Tras guardar, prueba de nuevo «Redacción asistida (IA)» en el editor o
          el chat del asistente.
        </p>
      </div>
    </div>
  `,
})
export class DocumentAiSettingsComponent implements OnInit {
  readonly ai = inject(AIBotStore);
  private readonly inference = inject(AIInferenceService);

  ngOnInit(): void {
    void this.inference.autoSelectProvider();
  }

  ollamaSelected(): boolean {
    return this.ai.selectedModelId().startsWith('ollama:');
  }

  onOllamaBaseUrl(url: string): void {
    this.ai.ollamaConfig.update((c) => ({ ...c, baseUrl: url }));
  }

  onOllamaModelName(name: string): void {
    this.ai.ollamaConfig.update((c) => ({ ...c, model: name }));
  }

  onRefreshOllama(): void {
    void this.ai.checkOllamaAvailability(true);
  }
}
