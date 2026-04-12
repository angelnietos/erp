import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';

interface AnalysisCheck {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  icon: string;
}

interface AnalysisResult {
  checkId: string;
  status: 'pass' | 'warning' | 'error' | 'pending';
  message: string;
  suggestions: string[];
}

@Component({
  selector: 'app-document-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
        <button
          routerLink="/documents/list"
          class="hover:text-primary transition-colors"
        >
          Documentos
        </button>
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
            Verifica la calidad y completitud de tus propuestas comerciales con
            asistente IA
          </p>
        </div>
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
                            <p class="text-sm text-muted">
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
                  (click)="runAnalysis()"
                  [disabled]="isAnalyzing || enabledChecksCount === 0"
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
                  class="bg-slate-50 rounded-xl p-4 text-center border border-soft"
                >
                  <div class="text-2xl font-bold text-slate-700">
                    {{ pendingCount }}
                  </div>
                  <div class="text-sm text-secondary">Pendientes</div>
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
                        <span class="font-medium">{{
                          getCheckName(result.checkId)
                        }}</span>
                      </div>
                    </div>
                    <p class="mt-2 text-secondary">{{ result.message }}</p>

                    @if (result.suggestions.length > 0) {
                      <div class="mt-3 pl-4 border-l-2 border-blue-300">
                        <p class="text-sm font-medium text-blue-700 mb-2">
                          💡 Sugerencias:
                        </p>
                        <ul class="text-sm text-secondary space-y-1">
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
                      Hola! Estoy aquí para ayudarte a mejorar tu propuesta.
                      Puedes preguntarme cualquier cosa o pedirme que revise
                      secciones concretas.
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="space-y-4 h-96 overflow-y-auto p-4 bg-slate-50 rounded-xl"
              >
                @for (msg of chatMessages; track $index) {
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
                          : 'bg-surface border border-soft rounded-xl px-4 py-2 max-w-md'
                      "
                    >
                      <p>{{ msg.content }}</p>
                    </div>
                  </div>
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
                  (click)="sendMessage()"
                  class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
                  @for (quickAction of quickActions; track $index) {
                    <button
                      (click)="executeQuickAction(quickAction)"
                      class="px-4 py-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm transition-colors"
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
  chatMessages: { type: 'user' | 'assistant'; content: string }[] = [];
  chatInput = new FormControl('');

  quickActions = [
    'Revisar resumen ejecutivo',
    '¿Qué secciones faltan?',
    'Mejorar llamada a la acción',
    'Comprobar precio',
    'Sugerencias de mejora',
  ];

  readonly fb = inject(FormBuilder);
  readonly assistantService = inject(AssistantContextService);

  ngOnInit() {
    this.assistantService.setActiveTab('analysis');

    this.chatMessages = [
      {
        type: 'assistant',
        content:
          '¡Hola! Soy tu asistente para análisis de propuestas. ¿En qué puedo ayudarte hoy?',
      },
    ];
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
    this.isAnalyzing = true;
    this.activeTab = 'results';
    this.analysisResults = [];

    const enabledChecks = this.analysisChecks.filter((c) => c.enabled);

    for (const check of enabledChecks) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = this.simulateCheckResult(check);
      this.analysisResults.push(result);
    }

    this.assistantService.setAnalysisResults(this.analysisResults);
    this.assistantService.addSystemMessage(
      `Análisis completado: ${this.passCount} correctos, ${this.warningCount} advertencias, ${this.errorCount} errores`,
    );
    this.isAnalyzing = false;
  }

  simulateCheckResult(check: AnalysisCheck): AnalysisResult {
    const statuses: ('pass' | 'warning' | 'error')[] = [
      'pass',
      'warning',
      'error',
    ];
    const randomStatus = statuses[Math.floor(Math.random() * 3)];

    const messages: Record<string, string> = {
      title:
        randomStatus === 'pass'
          ? 'El título es claro y descriptivo'
          : 'El título podría ser más específico',
      'executive-summary':
        randomStatus === 'error'
          ? 'No se detectó resumen ejecutivo en la propuesta'
          : 'El resumen ejecutivo está presente pero podría mejorarse',
      objectives: 'Los objetivos están bien definidos',
      scope:
        randomStatus === 'warning'
          ? 'Se recomienda delimitar mejor el alcance del proyecto'
          : 'El alcance está correctamente especificado',
      deliverables:
        randomStatus === 'error'
          ? 'No se listan los entregables del proyecto'
          : 'Entregables claramente definidos',
      timeline:
        randomStatus === 'warning'
          ? 'Cronograma presente pero sin hitos intermedios'
          : 'Cronograma detallado y realista',
      pricing:
        randomStatus === 'warning'
          ? 'Precio indicado pero sin desglose detallado'
          : 'Estructura de precios correcta',
      terms: 'Condiciones comerciales claras',
      'client-focus': 'La propuesta se centra adecuadamente en el cliente',
      differentiator:
        randomStatus === 'warning'
          ? 'No se destacan suficientemente los valores diferenciales'
          : 'Ventajas competitivas claramente expuestas',
      typos:
        randomStatus === 'pass'
          ? 'No se detectaron errores de escritura'
          : 'Se encontraron algunos errores de ortografía',
      'call-action':
        randomStatus === 'error'
          ? 'No existe una llamada clara a la acción al final'
          : 'Llamada a la acción correctamente implementada',
    };

    const suggestions: Record<string, string[]> = {
      title: [
        'Incluye el nombre del cliente en el título',
        'Especifica el tipo de solución propuesta',
      ],
      'executive-summary': [
        'Añade un resumen de máximo 3 párrafos al inicio',
        'Destaca 3 beneficios clave para el cliente',
      ],
      scope: [
        'Especifica explícitamente qué NO está incluido',
        'Divide el alcance en fases si el proyecto es grande',
      ],
      deliverables: [
        'Lista cada entregable con una breve descripción',
        'Indica formato y fecha de entrega para cada elemento',
      ],
      differentiator: [
        'Destaca por qué tu solución es mejor que la competencia',
        'Incluye métricas o resultados de proyectos similares',
      ],
    };

    return {
      checkId: check.id,
      status: randomStatus,
      message: messages[check.id] || 'Análisis completado',
      suggestions: suggestions[check.id] || [],
    };
  }

  sendMessage(): void {
    const message = this.chatInput.value?.trim();
    if (!message) return;

    this.chatMessages.push({ type: 'user', content: message });
    this.chatInput.reset();

    setTimeout(() => {
      this.chatMessages.push({
        type: 'assistant',
        content: this.getAssistantResponse(message),
      });
    }, 1000);
  }

  executeQuickAction(action: string): void {
    this.chatInput.setValue(action);
    this.sendMessage();
  }

  getAssistantResponse(message: string): string {
    const responses: Record<string, string> = {
      'Revisar resumen ejecutivo':
        'Tu resumen ejecutivo debería responder 3 preguntas clave: 1) ¿Qué problema solucionas? 2) ¿Cómo lo solucionas? 3) ¿Por qué tú y no otro? Intenta condensarlo en máximo 3 párrafos.',
      '¿Qué secciones faltan?':
        'Basándome en el análisis, te recomiendo añadir: ✅ Plan de implementación detallado ✅ Equipo responsable del proyecto ✅ Casos de éxito similares ✅ Garantías ofrecidas',
      'Mejorar llamada a la acción':
        'Una buena llamada a la acción debe ser concreta: "Nos gustaría concertar una reunión el próximo martes a las 10h para revisar esta propuesta contigo" en lugar de genérica.',
      'Comprobar precio':
        'Revisa que tu precio incluya: 1) Desglose por conceptos 2) Condiciones de pago 3) Gastos adicionales 4) Plazos de validez de la oferta',
      'Sugerencias de mejora':
        'Las 3 mejoras prioritarias para tu propuesta son: 1) Añadir resumen ejecutivo 2) Mejorar la llamada a la acción 3) Destacar tus valores diferenciales frente a la competencia',
    };

    return (
      responses[message] ||
      'He analizado tu consulta. Para darte una respuesta más precisa, ¿podrías facilitarme el contenido de la propuesta que quieres revisar?'
    );
  }
}
