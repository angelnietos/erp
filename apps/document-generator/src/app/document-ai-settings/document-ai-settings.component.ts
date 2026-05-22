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
    <div class="max-w-2xl mx-auto space-y-8">
      <nav
        class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondary"
        aria-label="Migas de pan"
      >
        <a
          routerLink="/documents/list"
          class="hover:text-primary transition-colors"
          >Documentos</a
        >
        <span class="text-muted" aria-hidden="true">/</span>
        <span class="text-primary font-medium">Configuración de IA</span>
      </nav>

      <div>
        <h1 class="text-2xl font-bold text-primary">Motor de inferencia (IA)</h1>
        <p class="text-secondary mt-2 text-sm leading-relaxed">
          Elige el proveedor y, si hace falta, pega tu clave API. Los valores se
          guardan solo en este navegador (localStorage), igual que en el ERP
          principal — así el generador de documentos y el asistente flotante
          usan la misma configuración.
        </p>
      </div>

      <div
        class="rounded-2xl border border-soft bg-surface shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm font-medium text-primary">Estado</span>
          @if (ai.needsApiKey() && !ai.providerApiKey().trim()) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs font-semibold px-3 py-1"
            >
              Falta clave API
            </span>
          } @else if (ai.needsApiKey() && ai.providerApiKey().trim()) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 text-xs font-semibold px-3 py-1"
            >
              Clave configurada
            </span>
          } @else {
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1"
            >
              {{ ollamaSelected() ? 'Ollama local' : 'Modo sin clave propia' }}
            </span>
          }
        </div>

        <div class="space-y-2">
          <label
            for="ai-model"
            class="block text-sm font-medium text-primary"
            >Modelo / proveedor</label
          >
          <select
            id="ai-model"
            class="w-full px-4 py-3 rounded-xl border border-soft bg-secondary text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            [ngModel]="ai.selectedModelId()"
            (ngModelChange)="ai.setAIModel($event)"
          >
            @for (opt of ai.aiModelOptions(); track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        @if (ai.needsApiKey()) {
          <div class="space-y-2">
            <label
              for="ai-api-key"
              class="block text-sm font-medium text-primary"
              >Clave API (token)</label
            >
            <input
              id="ai-api-key"
              type="password"
              autocomplete="off"
              class="w-full px-4 py-3 rounded-xl border border-soft bg-secondary text-primary text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Pega tu clave (p. ej. AIza… para Gemini, sk-… para OpenAI)"
              [ngModel]="ai.providerApiKey()"
              (ngModelChange)="ai.providerApiKey.set($event)"
            />
            <p class="text-xs text-muted leading-relaxed">
              Gemini: consola de Google AI Studio. OpenAI / OpenRouter / xAI: el
              token de tu cuenta. No se envía al servidor de Josanz; solo se usa
              en el navegador para llamar al proveedor.
            </p>
          </div>
        }

        @if (ollamaSelected()) {
          <div
            class="rounded-xl border border-violet-200/80 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/20 p-4 space-y-4"
          >
            <p class="text-sm font-semibold text-primary">Ollama (local)</p>
            <div class="space-y-2">
              <label for="ollama-url" class="block text-xs font-medium text-secondary"
                >URL base</label
              >
              <input
                id="ollama-url"
                type="url"
                class="w-full px-3 py-2 rounded-lg border border-soft bg-surface text-sm"
                [ngModel]="ai.ollamaConfig().baseUrl"
                (ngModelChange)="onOllamaBaseUrl($event)"
              />
            </div>
            <div class="space-y-2">
              <label for="ollama-model" class="block text-xs font-medium text-secondary"
                >Nombre del modelo</label
              >
              <input
                id="ollama-model"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-soft bg-surface text-sm"
                [ngModel]="ai.ollamaConfig().model"
                (ngModelChange)="onOllamaModelName($event)"
              />
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-violet-300 bg-white dark:bg-slate-900 text-violet-900 dark:text-violet-100 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
              (click)="onRefreshOllama()"
            >
              Comprobar Ollama y listar modelos
            </button>
            @if (ai.ollamaConfig().available) {
              <p class="text-xs text-emerald-700 dark:text-emerald-400">
                Servidor Ollama detectado.
              </p>
            }
            @if (ai.freeModels().localModels.length > 0) {
              <p class="text-xs text-muted">
                Modelos locales:
                {{ ai.freeModels().localModels.join(', ') }}
              </p>
            }
          </div>
        }

        <p class="text-xs text-muted border-t border-soft pt-4">
          Tras guardar, vuelve al editor y prueba de nuevo «Redacción asistida
          (IA)» o el chat del asistente.
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
