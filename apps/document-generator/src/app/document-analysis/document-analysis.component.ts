import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  AssistantContextService,
  DocumentAnalysisCheckResult,
} from '../services/assistant-context.service';
import {
  DocumentPersistenceService,
  DocumentListItem,
} from '../services/document-persistence.service';
import { ProposalAnalysisService } from '../services/proposal-analysis.service';

interface AnalysisCheck {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  icon: string;
}

type AnalysisResult = DocumentAnalysisCheckResult;

@Component({
  selector: 'app-document-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  styles: [
    `
      .tab-active {
        border-bottom: 2px solid #2563eb;
        color: #2563eb;
        font-weight: 600;
      }

      .status-pass {
        background-color: #dcfce7;
        color: #166534;
      }

      .status-warning {
        background-color: #fef3c7;
        color: #92400e;
      }

      .status-error {
        background-color: #fee2e2;
        color: #991b1b;
      }

      .status-pending {
        background-color: #f1f5f9;
        color: #475569;
      }

      .ai-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 1rem;
        padding: 1rem;
      }
    `,
  ],
  template: `
    <div class="space-y-8">
      <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-secondary">
        <a
          routerLink="/documents/list"
          class="hover:text-primary transition-colors"
        >
          Documentos
        </a>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="text-primary font-medium">Análisis de Propuestas</span>
      </nav>

      <!-- Header -->
      <div
        class="bg-surface rounded-2xl shadow-xl border border-soft/50 p-8"
      >
        <div class="text-center max-w-2xl mx-auto">
          <div
            class="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3"
          >
            Analizador de Propuestas
          </h1>
          <p class="text-secondary text-lg">
            Carga un documento del historial (IndexedDB) o pega texto; el análisis
            usa tu motor de IA configurado (sin datos simulados).
          </p>
        </div>
      </div>

      <!-- Fuente del documento -->
      <div
        class="bg-surface rounded-2xl shadow-xl border border-soft/50 p-6 md:p-8"
      >
        <h2 class="text-lg font-bold text-primary mb-4">
          Documento a analizar
        </h2>
        <div class="grid gap-4 md:grid-cols-2 md:gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-doc-ink" for="doc-select"
              >Historial en este navegador</label
            >
            <select
              id="doc-select"
              class="w-full px-4 py-3 rounded-xl border border-soft bg-secondary text-doc-ink focus:ring-2 focus:ring-blue-500 focus:outline-none"
              [value]="selectedDocId"
              (change)="onSelectSavedDocument($any($event.target).value)"
            >
              <option value="">— Selecciona un documento guardado —</option>
              @for (d of savedDocuments; track d.id) {
                <option [value]="d.id">
                  {{ d.title || 'Sin título' }} · {{ getTypeLabel(d.type) }}
                  @if (d.isDraft) {
                    (borrador)
                  }
                </option>
              }
            </select>
            @if (savedDocuments.length === 0 && !listLoadError) {
              <p class="text-sm text-doc-muted-on-light">
                No hay documentos guardados.
                <a
                  routerLink="/documents/create"
                  class="text-blue-600 hover:underline font-medium"
                  >Crear uno</a
                >
                y usa «Guardar borrador» o genera el PDF para que aparezca en el
                historial.
              </p>
            }
            @if (listLoadError) {
              <p class="text-sm text-amber-700" role="alert">{{ listLoadError }}</p>
            }
          </div>
          <div
            class="rounded-xl border border-soft bg-slate-50/80 dark:bg-slate-900/30 p-4 text-sm"
          >
            @if (selectedSummary) {
              <p class="font-medium text-doc-ink">{{ selectedSummary.title }}</p>
              <p class="text-doc-muted-on-light mt-1">
                {{ selectedSummary.client }} ·
                {{ selectedSummary.date | date: 'medium' }}
              </p>
            } @else {
              <p class="text-doc-muted-on-light">
                Elige un documento o usa el área de texto abajo.
              </p>
            }
            <p class="mt-3 text-doc-ink">
              <span class="font-semibold">{{ effectiveTextLength }}</span>
              caracteres en el texto de análisis
            </p>
            <a
              routerLink="/documents/settings/ai"
              class="inline-block mt-2 text-blue-600 hover:underline text-sm"
              >Configuración IA</a
            >
          </div>
        </div>

        <details class="mt-6 group">
          <summary
            class="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800 list-none flex items-center gap-2"
          >
            <span
              class="inline-block transition-transform group-open:rotate-90"
              aria-hidden="true"
              >▸</span
            >
            Pegar o editar texto manualmente (opcional)
          </summary>
          <p class="text-xs text-doc-muted-on-light mt-2 mb-2">
            Si rellenas esto, tendrá prioridad sobre el documento cargado del
            historial.
          </p>
          <textarea
            [(ngModel)]="manualText"
            (ngModelChange)="onManualTextChange()"
            rows="8"
            placeholder="Pega aquí Markdown o texto de la propuesta…"
            class="w-full px-4 py-3 rounded-xl border border-soft bg-secondary text-doc-ink font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </details>

        @if (analysisBanner) {
          <p
            class="mt-4 text-sm rounded-lg px-4 py-3 bg-amber-50 text-amber-900 border border-amber-200"
            role="status"
          >
            {{ analysisBanner }}
          </p>
        }
      </div>

      <!-- Tabs Navigation -->
      <div class="bg-surface rounded-2xl shadow-xl border border-soft/50">
        <div class="border-b border-soft">
          <div class="flex space-x-8 px-8">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab = tab.id"
                class="py-4 px-2 text-sm font-medium transition-colors"
                [class.tab-active]="activeTab === tab.id"
                [class.text-muted]="activeTab !== tab.id"
              >
                {{ tab.name }}
              </button>
            }
          </div>
        </div>

        <!-- Tab Content -->
        <div class="p-8">
          <!-- Checks Selection Tab -->
          @if (activeTab === 'checks') {
            <div class="space-y-6">
              <h2 class="text-xl font-bold text-primary mb-4">
                Selecciona qué quieres revisar
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (category of getCategories(); track category) {
                  <div class="border border-soft rounded-xl p-4">
                    <h3 class="font-semibold text-slate-800 mb-3">
                      {{ category }}
                    </h3>
                    <div class="space-y-2">
                      @for (
                        check of getChecksByCategory(category);
                        track check.id
                      ) {
                        <label
                          class="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            [checked]="check.enabled"
                            (change)="toggleCheck(check.id)"
                            class="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div class="flex-1">
                            <div class="flex items-center">
                              <span class="mr-2">{{ check.icon }}</span>
                              <span class="font-medium text-slate-800">{{
                                check.name
                              }}</span>
                            </div>
                            <p class="text-sm text-doc-muted-on-light">
                              {{ check.description }}
                            </p>
                          </div>
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>

              <div class="pt-4 border-t border-soft">
                <button
                  type="button"
                  (click)="runAnalysis()"
                  [disabled]="
                    isAnalyzing || enabledChecksCount === 0 || effectiveTextLength === 0
                  "
                  class="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 transition-all"
                >
                  @if (isAnalyzing) {
                    <svg
                      class="inline w-5 h-5 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581"
                      />
                    </svg>
                    Analizando...
                  } @else {
                    <svg
                      class="inline w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Ejecutar Análisis Completo ({{ enabledChecksCount }}
                    comprobaciones)
                  }
                </button>
              </div>
            </div>
          }

          <!-- Results Tab -->
          @if (activeTab === 'results') {
            <div class="space-y-6">
              @if (analysisRunError) {
                <div
                  class="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm"
                  role="alert"
                >
                  {{ analysisRunError }}
                </div>
              }
              <div class="grid grid-cols-4 gap-4 mb-6">
                <div
                  class="bg-green-50 rounded-xl p-4 text-center border border-green-200"
                >
                  <div class="text-2xl font-bold text-green-700">
                    {{ passCount }}
                  </div>
                  <div class="text-sm text-green-600">Correctos</div>
                </div>
                <div
                  class="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200"
                >
                  <div class="text-2xl font-bold text-yellow-700">
                    {{ warningCount }}
                  </div>
                  <div class="text-sm text-yellow-600">Advertencias</div>
                </div>
                <div
                  class="bg-red-50 rounded-xl p-4 text-center border border-red-200"
                >
                  <div class="text-2xl font-bold text-red-700">
                    {{ errorCount }}
                  </div>
                  <div class="text-sm text-red-600">Errores</div>
                </div>
                <div
                  class="bg-slate-50 rounded-xl p-4 text-center border border-slate-200"
                >
                  <div class="text-2xl font-bold text-doc-ink">
                    {{ pendingCount }}
                  </div>
                  <div class="text-sm text-doc-muted-on-light">Pendientes</div>
                </div>
              </div>

              <div class="space-y-3">
                @for (result of analysisResults; track result.checkId) {
                  <div class="border border-soft rounded-xl p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <span
                          class="px-3 py-1 rounded-full text-xs font-medium"
                          [class.status-pass]="result.status === 'pass'"
                          [class.status-warning]="result.status === 'warning'"
                          [class.status-error]="result.status === 'error'"
                          [class.status-pending]="result.status === 'pending'"
                        >
                          {{ result.status.toUpperCase() }}
                        </span>
                        <span class="font-medium text-doc-ink">{{
                          getCheckName(result.checkId)
                        }}</span>
                      </div>
                    </div>
                    <p class="mt-2 text-doc-muted-on-light">{{ result.message }}</p>

                    @if (result.suggestions.length > 0) {
                      <div class="mt-3 pl-4 border-l-2 border-blue-300">
                        <p class="text-sm font-medium text-blue-700 mb-2">
                          💡 Sugerencias:
                        </p>
                        <ul class="text-sm text-doc-muted-on-light space-y-1">
                          @for (
                            suggestion of result.suggestions;
                            track $index
                          ) {
                            <li>• {{ suggestion }}</li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Assistant Tab -->
          @if (activeTab === 'assistant') {
            <div class="space-y-6">
              <div class="ai-message mb-6">
                <div class="flex items-start space-x-3">
                  <div
                    class="w-10 h-10 bg-surface/20 rounded-full flex items-center justify-center"
                  >
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold">Asistente de Calidad</p>
                    <p class="text-sm opacity-90">
                      ¡Hola! Estoy aquí para ayudarte a mejorar tu propuesta.
                      Puedes preguntarme cualquier cosa o pedirme que revise
                      secciones concretas.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="space-y-4 h-96 overflow-y-auto p-4 bg-slate-50 rounded-xl"
              >
                @for (msg of chatMessages; track msg.id) {
                  <div
                    [class]="
                      msg.type === 'user'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    "
                  >
                    <div
                      [class]="
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white rounded-xl px-4 py-2 max-w-md'
                          : 'doc-chat-bubble-bot rounded-xl px-4 py-2 max-w-md'
                      "
                    >
                      <p>{{ msg.content }}</p>
                    </div>
                  </div>
                }
                @if (isChatSending) {
                  <p class="text-sm text-doc-muted-on-light px-1" role="status">
                    Generando respuesta con IA…
                  </p>
                }
              </div>

              <div class="flex space-x-3">
                <input
                  type="text"
                  [formControl]="chatInput"
                  (keydown.enter)="sendMessage()"
                  placeholder="Pregunta al asistente sobre tu propuesta..."
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  (click)="sendMessage()"
                  [disabled]="isChatSending || effectiveTextLength === 0"
                  class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>

              <div class="pt-4 border-t border-soft">
                <p class="text-sm text-muted mb-3">Acciones rápidas:</p>
                <div class="flex flex-wrap gap-2">
                  @for (quickAction of quickActions; track quickAction) {
                    <button
                      type="button"
                      (click)="executeQuickAction(quickAction)"
                      [disabled]="isChatSending || effectiveTextLength === 0"
                      class="px-4 py-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {{ quickAction }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DocumentAnalysisComponent implements OnInit {
  activeTab = 'checks';
  isAnalyzing = false;

  tabs = [
    { id: 'checks', name: 'Comprobaciones' },
    { id: 'results', name: 'Resultados' },
    { id: 'assistant', name: 'Asistente IA' },
  ];

  analysisChecks: AnalysisCheck[] = [
    {
      id: 'title',
      name: 'Título claro',
      description: 'Verifica que el título sea descriptivo y profesional',
      category: 'Estructura',
      enabled: true,
      icon: '📝',
    },
    {
      id: 'executive-summary',
      name: 'Resumen ejecutivo',
      description: 'Comprueba existencia y calidad del resumen ejecutivo',
      category: 'Contenido',
      enabled: true,
      icon: '📋',
    },
    {
      id: 'objectives',
      name: 'Objetivos claros',
      description: 'Valida que los objetivos sean específicos y medibles',
      category: 'Contenido',
      enabled: true,
      icon: '🎯',
    },
    {
      id: 'scope',
      name: 'Alcance definido',
      description: 'Revisa que el alcance esté claramente delimitado',
      category: 'Contenido',
      enabled: true,
      icon: '🔍',
    },
    {
      id: 'deliverables',
      name: 'Entregables listados',
      description: 'Verifica que se especifiquen todos los entregables',
      category: 'Estructura',
      enabled: true,
      icon: '📦',
    },
    {
      id: 'timeline',
      name: 'Cronograma realista',
      description: 'Comprueba que exista un plan temporal viable',
      category: 'Planificación',
      enabled: true,
      icon: '📅',
    },
    {
      id: 'pricing',
      name: 'Precio detallado',
      description: 'Valida que el precio esté desglosado correctamente',
      category: 'Económico',
      enabled: true,
      icon: '💰',
    },
    {
      id: 'terms',
      name: 'Condiciones claras',
      description: 'Revisa términos y condiciones de pago y entrega',
      category: 'Legal',
      enabled: true,
      icon: '📜',
    },
    {
      id: 'client-focus',
      name: 'Enfoque cliente',
      description:
        'Verifica que la propuesta se centre en las necesidades del cliente',
      category: 'Calidad',
      enabled: true,
      icon: '👤',
    },
    {
      id: 'differentiator',
      name: 'Valor diferencial',
      description: 'Comprueba que se destaquen ventajas competitivas',
      category: 'Calidad',
      enabled: true,
      icon: '⭐',
    },
    {
      id: 'typos',
      name: 'Ortografía y gramática',
      description: 'Busca errores de escritura en el documento',
      category: 'Calidad',
      enabled: true,
      icon: '✅',
    },
    {
      id: 'call-action',
      name: 'Llamada a la acción',
      description: 'Verifica que exista una clara siguiente acción',
      category: 'Estrategia',
      enabled: true,
      icon: '🚀',
    },
    {
      id: 'risk-mitigation',
      name: 'Mitigación de riesgos',
      description: 'Comprueba que se contemplen posibles riesgos',
      category: 'Planificación',
      enabled: false,
      icon: '⚠️',
    },
    {
      id: 'team-intro',
      name: 'Presentación del equipo',
      description: 'Valida que se presente el equipo responsable',
      category: 'Estructura',
      enabled: false,
      icon: '👥',
    },
    {
      id: 'testimonials',
      name: 'Referencias y casos',
      description: 'Sugiere incluir testimonios o casos de éxito',
      category: 'Credibilidad',
      enabled: false,
      icon: '🏆',
    },
  ];

  analysisResults: AnalysisResult[] = [];
  analysisRunError: string | null = null;
  chatMessages: {
    id: string;
    type: 'user' | 'assistant';
    content: string;
  }[] = [];
  chatInput = new FormControl('');
  isChatSending = false;

  savedDocuments: DocumentListItem[] = [];
  selectedDocId = '';
  selectedSummary: DocumentListItem | null = null;
  /** Texto derivado del payload en IndexedDB (sin edición manual). */
  builtText = '';
  /** Si tiene contenido, sustituye a `builtText` para el análisis. */
  manualText = '';
  listLoadError: string | null = null;
  /** Aviso cuando solo hay PDF guardado sin campos de texto. */
  analysisBanner: string | null = null;

  quickActions = [
    'Revisar resumen ejecutivo',
    '¿Qué secciones faltan?',
    'Mejorar llamada a la acción',
    'Comprobar precio',
    'Sugerencias de mejora',
  ];

  readonly assistantService = inject(AssistantContextService);
  private readonly persistence = inject(DocumentPersistenceService);
  private readonly proposalAnalysis = inject(ProposalAnalysisService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.assistantService.setActiveTab('analysis');

    this.chatMessages = [
      {
        id: 'analysis-chat-welcome',
        type: 'assistant',
        content:
          'Carga un documento del historial o pega texto. Las respuestas usan el mismo motor de IA que el editor.',
      },
    ];

    void this.loadSavedList();
  }

  get effectiveText(): string {
    const m = this.manualText.trim();
    if (m.length > 0) {
      return this.manualText;
    }
    return this.builtText;
  }

  get effectiveTextLength(): number {
    return this.effectiveText.trim().length;
  }

  private async loadSavedList(): Promise<void> {
    this.listLoadError = null;
    try {
      await this.persistence.whenReady();
      this.savedDocuments = await this.persistence.listSummaries();
      const docId = this.route.snapshot.queryParamMap.get('doc');
      if (docId && this.savedDocuments.some((d) => d.id === docId)) {
        await this.applySelectedDocument(docId);
      }
    } catch (e: unknown) {
      this.listLoadError =
        e instanceof Error
          ? e.message
          : 'No se pudo leer el historial local (IndexedDB).';
      this.savedDocuments = [];
    }
  }

  async onSelectSavedDocument(id: string): Promise<void> {
    if (!id) {
      this.selectedDocId = '';
      this.selectedSummary = null;
      this.builtText = '';
      this.analysisBanner = null;
      this.syncAssistantDocument();
      return;
    }
    await this.applySelectedDocument(id);
  }

  private async applySelectedDocument(id: string): Promise<void> {
    this.selectedDocId = id;
    this.manualText = '';
    this.analysisBanner = null;
    this.analysisRunError = null;
    this.selectedSummary = this.savedDocuments.find((d) => d.id === id) ?? null;
    try {
      await this.persistence.whenReady();
      const payload = await this.persistence.getPayload(id);
      if (!payload) {
        this.builtText = '';
        this.analysisBanner = 'No se encontró el contenido del documento.';
        this.syncAssistantDocument();
        return;
      }
      this.builtText = this.proposalAnalysis.buildTextFromPayload(payload);
      if (this.builtText.trim().length < 80) {
        this.analysisBanner =
          'Este registro tiene poco texto editable (p. ej. solo PDF generado). Edita el borrador en el editor o pega el contenido abajo.';
      }
    } catch (e: unknown) {
      this.builtText = '';
      this.analysisBanner =
        e instanceof Error ? e.message : 'Error al cargar el documento.';
    }
    this.syncAssistantDocument();
  }

  onManualTextChange(): void {
    this.syncAssistantDocument();
  }

  private syncAssistantDocument(): void {
    const t = this.effectiveText;
    const typ =
      this.selectedSummary?.type ||
      (this.route.snapshot.queryParamMap.get('type') ?? undefined);
    this.assistantService.setDocumentContent(t, typ ?? undefined);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'quote':
        return 'Presupuesto';
      case 'proposal':
        return 'Propuesta';
      case 'documentation':
        return 'Documentación';
      case 'architecture':
        return 'Arquitectura';
      case 'resume':
        return 'CV';
      case 'interview':
        return 'Entrevista';
      case 'offer':
        return 'Oferta';
      default:
        return type;
    }
  }

  private buildAnalysisSummaryForChat(): string {
    if (this.analysisResults.length === 0) {
      return '';
    }
    const parts = this.analysisResults.map(
      (r) =>
        `- ${this.getCheckName(r.checkId)}: ${r.status} — ${r.message}`,
    );
    return parts.join('\n');
  }

  get enabledChecksCount(): number {
    return this.analysisChecks.filter((c) => c.enabled).length;
  }

  get passCount(): number {
    return this.analysisResults.filter((r) => r.status === 'pass').length;
  }

  get warningCount(): number {
    return this.analysisResults.filter((r) => r.status === 'warning').length;
  }

  get errorCount(): number {
    return this.analysisResults.filter((r) => r.status === 'error').length;
  }

  get pendingCount(): number {
    return this.analysisResults.filter((r) => r.status === 'pending').length;
  }

  getCategories(): string[] {
    return [...new Set(this.analysisChecks.map((c) => c.category))];
  }

  getChecksByCategory(category: string): AnalysisCheck[] {
    return this.analysisChecks.filter((c) => c.category === category);
  }

  getCheckName(checkId: string): string {
    return this.analysisChecks.find((c) => c.id === checkId)?.name || checkId;
  }

  toggleCheck(checkId: string): void {
    const check = this.analysisChecks.find((c) => c.id === checkId);
    if (check) {
      check.enabled = !check.enabled;
    }
  }

  async runAnalysis(): Promise<void> {
    const text = this.effectiveText.trim();
    if (!text) {
      this.analysisRunError =
        'No hay texto para analizar: elige un documento del historial o pega contenido.';
      this.activeTab = 'results';
      this.analysisResults = [];
      return;
    }

    const enabledChecks = this.analysisChecks.filter((c) => c.enabled);
    this.isAnalyzing = true;
    this.activeTab = 'results';
    this.analysisResults = [];
    this.analysisRunError = null;

    try {
      const criteria = enabledChecks.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      }));
      const items = await this.proposalAnalysis.analyzeCriteria(text, criteria);
      this.analysisResults = items.map((r) => ({
        checkId: r.checkId,
        status: r.status,
        message: r.message,
        suggestions: r.suggestions,
      }));

      this.assistantService.setAnalysisResults(this.analysisResults);
      this.assistantService.addSystemMessage(
        `Análisis IA completado: ${this.passCount} correctos, ${this.warningCount} advertencias, ${this.errorCount} errores`,
      );
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Error desconocido al analizar.';
      this.analysisRunError = msg;
      this.analysisResults = [];
      this.assistantService.addSystemMessage(`Error en análisis: ${msg}`);
    } finally {
      this.isAnalyzing = false;
    }
  }

  async sendMessage(): Promise<void> {
    const message = this.chatInput.value?.trim();
    if (!message || this.isChatSending) {
      return;
    }
    if (this.effectiveTextLength === 0) {
      this.chatMessages.push({
        id: crypto.randomUUID(),
        type: 'assistant',
        content:
          'Primero carga un documento del historial o pega el texto del documento.',
      });
      return;
    }

    this.chatMessages.push({
      id: crypto.randomUUID(),
      type: 'user',
      content: message,
    });
    this.chatInput.reset();
    this.isChatSending = true;

    try {
      const summary = this.buildAnalysisSummaryForChat();
      const reply = await this.proposalAnalysis.chatAboutDocument(
        message,
        this.effectiveText,
        summary,
      );
      this.chatMessages.push({
        id: crypto.randomUUID(),
        type: 'assistant',
        content: reply.trim(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.chatMessages.push({
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `No se pudo obtener respuesta del modelo: ${msg}`,
      });
    } finally {
      this.isChatSending = false;
    }
  }

  executeQuickAction(action: string): void {
    this.chatInput.setValue(action);
    void this.sendMessage();
  }
}
