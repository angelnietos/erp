import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { AssistantContextService } from '../services/assistant-context.service';
import {
  UniversalDocumentService,
  DocumentFormat,
} from '../services/universal-document.service';
import {
  TemplatesRegistryService,
  DocumentTemplate,
} from '../services/templates-registry.service';
import {
  DocumentAiService,
  DocumentAiContext,
} from '../services/document-ai.service';

declare const marked: {
  parse: (content: string, options?: object) => string;
  setOptions?: (options: object) => void;
};

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

@Component({
  styles: [
    `
      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .animate-slide-up {
        animation: slide-up 0.5s ease-out forwards;
      }

      .brand-gradient {
        background: linear-gradient(135deg, var(--brand), var(--brand-surface));
      }

      /* Tarjeta seleccionada: fondo claro (gradiente) → texto siempre oscuro legible */
      .selected-doc-type-light h3 {
        color: #0f172a !important;
      }

      .selected-doc-type-light p {
        color: #334155 !important;
      }

      .selected-doc-type-light svg {
        color: #475569 !important;
      }

      .selected-doc-type-light .check-icon {
        color: #ffffff !important;
      }

      /* Barra inferior: CTA siempre legible sobre gradiente / tema */
      .footer-cta-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 3rem;
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.3;
        color: #ffffff !important;
        border: none;
        cursor: pointer;
        background: linear-gradient(
          135deg,
          var(--brand) 0%,
          color-mix(in srgb, var(--brand) 78%, #0f172a) 100%
        );
        box-shadow: 0 10px 28px color-mix(in srgb, var(--brand) 38%, transparent);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }

      .footer-cta-primary:hover:not(:disabled) {
        filter: brightness(1.06);
        transform: translateY(-1px);
      }

      .footer-cta-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        filter: none;
        box-shadow: none;
      }

      .footer-cta-primary svg {
        color: #ffffff !important;
        stroke: #ffffff !important;
      }

      .action-bar-panel {
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.65);
      }
    `,
  ],
  selector: 'app-document-create-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-8">
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
        <a
          routerLink="/documents/create"
          class="hover:text-primary transition-colors"
          >Tipo y plantilla</a
        >
        <span class="text-muted" aria-hidden="true">/</span>
        <span class="text-primary font-medium">Editor</span>
      </nav>

      @if (selectedType) {
          <div class="bg-surface rounded-2xl shadow-xl border border-soft p-8">
            <div class="mb-8">
              <div class="flex items-center space-x-3 mb-4">
                <div
                  class="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-bg-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-primary">
                    Información del Documento
                  </h2>
                  <p class="text-secondary">
                    Completa los detalles para generar tu
                    {{ selectedType.name.toLowerCase() }}
                  </p>
                </div>
              </div>
            </div>

            <form
              [formGroup]="documentForm"
              (ngSubmit)="generateDocument()"
              class="space-y-8"
            >
              <div class="bg-tertiary rounded-xl p-6 border border-soft">
                <h3
                  class="text-lg font-semibold text-primary mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 012 0z"
                    />
                  </svg>
                  Información General
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label
                      for="clientId"
                      class="block text-sm font-medium text-primary"
                      >Cliente *</label
                    >
                    <select
                      id="clientId"
                      formControlName="clientId"
                      class="w-full px-4 py-3 border border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 bg-secondary"
                    >
                      <option value="">Seleccionar cliente</option>
                      @for (client of clients; track client.id) {
                        <option [value]="client.id">
                          {{ client.name }}
                        </option>
                      }
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label
                      for="date"
                      class="block text-sm font-medium text-primary"
                      >Fecha</label
                    >
                    <input
                      id="date"
                      type="date"
                      formControlName="date"
                      class="w-full px-4 py-3 border border-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 bg-secondary"
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label
                    for="title"
                    class="block text-sm font-medium text-slate-700"
                    >Título del Documento</label
                  >
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    [placeholder]="getTitlePlaceholder()"
                    class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface"
                  />
                </div>

                <div
                  class="rounded-2xl border border-violet-200/90 dark:border-violet-800/60 bg-gradient-to-br from-violet-50/90 via-white to-slate-50/80 dark:from-violet-950/40 dark:via-slate-950 dark:to-slate-900 p-6 space-y-4 shadow-md shadow-slate-900/5 ring-1 ring-violet-100/70 dark:ring-violet-900/40"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3
                        class="text-lg font-semibold text-primary flex items-center gap-2"
                      >
                        <span
                          class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/10 text-violet-700 dark:text-violet-300"
                          aria-hidden="true"
                          >✨</span
                        >
                        Redacción asistida (IA)
                      </h3>
                      <p class="text-sm text-secondary mt-1 max-w-2xl">
                        Describe objetivos, público y datos clave; la IA genera
                        un borrador en Markdown. Revisa y ajusta siempre el
                        resultado antes de enviarlo o firmarlo.
                      </p>
                      <p class="text-xs text-muted mt-2 max-w-2xl">
                        El proveedor y la clave son los mismos que en el resto
                        del ERP (configuración local del navegador).
                      </p>
                      <a
                        routerLink="/documents/settings/ai"
                        class="inline-flex mt-2 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
                      >
                        Configurar clave API y modelo →
                      </a>
                    </div>
                  </div>

                  @if (aiError) {
                    <p
                      class="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-2"
                      role="alert"
                    >
                      {{ aiError }}
                    </p>
                  }

                  <div class="space-y-2">
                    <label
                      for="aiBrief"
                      class="block text-sm font-medium text-slate-700"
                      >Consigna para generar borrador</label
                    >
                    <textarea
                      id="aiBrief"
                      [(ngModel)]="aiBrief"
                      rows="3"
                      placeholder="Ej.: Presupuesto para migración a la nube, 3 fases, cliente sector retail, plazo 6 meses, tono formal."
                      class="w-full px-4 py-3 border border-violet-200 dark:border-violet-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-surface text-sm resize-y min-h-[5rem]"
                      [disabled]="isGenerating || isAiGenerating"
                    ></textarea>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="generateDraftWithAi('replace')"
                      [disabled]="isGenerating || isAiGenerating"
                      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white shadow hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (isAiGenerating) {
                        <svg
                          class="w-4 h-4 animate-spin shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      }
                      Sustituir contenido
                    </button>
                    <button
                      type="button"
                      (click)="generateDraftWithAi('append')"
                      [disabled]="isGenerating || isAiGenerating"
                      class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-violet-300 dark:border-violet-800 bg-surface text-violet-900 dark:text-violet-100 hover:bg-violet-50 dark:hover:bg-violet-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Añadir al final
                    </button>
                  </div>

                  <div class="border-t border-violet-200/70 dark:border-violet-900/40 pt-4 space-y-2">
                    <label
                      for="aiInstruction"
                      class="block text-sm font-medium text-slate-700"
                      >Reformular el documento actual</label
                    >
                    <textarea
                      id="aiInstruction"
                      [(ngModel)]="aiInstruction"
                      rows="2"
                      placeholder="Ej.: Acorta a una página, tono más formal, añade sección de riesgos y mitigación."
                      class="w-full px-4 py-3 border border-violet-200 dark:border-violet-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-surface text-sm resize-y"
                      [disabled]="isGenerating || isAiGenerating"
                    ></textarea>
                    <button
                      type="button"
                      (click)="transformWithAi()"
                      [disabled]="isGenerating || isAiGenerating"
                      class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-doc-ink hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Aplicar instrucción al texto
                    </button>
                  </div>
                </div>

                @if (selectedType.id === 'quote') {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label
                        for="projectName"
                        class="block text-sm font-medium text-slate-700"
                        >Proyecto</label
                      >
                      <input
                        id="projectName"
                        type="text"
                        formControlName="projectName"
                        placeholder="Nombre del proyecto"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface"
                      />
                    </div>
                    <div class="space-y-2">
                      <label
                        for="totalAmount"
                        class="block text-sm font-medium text-slate-700"
                        >Monto Total (€)</label
                      >
                      <input
                        id="totalAmount"
                        type="number"
                        formControlName="totalAmount"
                        placeholder="0.00"
                        step="0.01"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface"
                      />
                    </div>
                  </div>
                }

                <!-- Plantillas Rápidas -->
                <div class="space-y-3">
                  <div class="block text-sm font-medium text-slate-700">
                    Plantillas predefinidas para {{ selectedType.name }}
                  </div>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                    role="group"
                    aria-labelledby="templates-label"
                  >
                    @for (template of templates; track template.id) {
                      <button
                        type="button"
                        (click)="loadTemplate(template)"
                        class="px-4 py-3 text-left bg-white/90 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-800 dark:hover:text-blue-200 rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow"
                      >
                        <div class="font-medium">
                          {{ template.icon }} {{ template.name }}
                        </div>
                        <div class="text-xs text-secondary mt-1">
                          {{ template.description }}
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Barra de Herramientas Markdown -->
                <div
                  class="bg-slate-100 rounded-xl p-2 flex flex-wrap gap-1 border border-soft"
                >
                  <button
                    type="button"
                    (click)="insertMarkdown('**', '**')"
                    title="Negrita (Ctrl+B)"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('*', '*')"
                    title="Cursiva (Ctrl+I)"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all italic"
                  >
                    I
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('# ', '')"
                    title="Encabezado 1"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('## ', '')"
                    title="Encabezado 2"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('### ', '')"
                    title="Encabezado 3"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    H3
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('- ', '')"
                    title="Lista"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    • Lista
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('> ', '')"
                    title="Cita"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    " Cita
                  </button>
                  <button
                    type="button"
                    (click)="insertCode()"
                    title="Código"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all font-mono text-xs"
                  >
                    &lt;&gt;
                  </button>
                  <button
                    type="button"
                    (click)="insertCodeBlock()"
                    title="Bloque de código"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all font-mono text-xs"
                  >
                    {{ '{}' }}
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('[', '](url)')"
                    title="Enlace"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    (click)="copyMarkdownToClipboard()"
                    title="Copiar Markdown al portapapeles"
                    class="px-3 py-1.5 rounded-lg hover:bg-surface transition-all text-sm"
                  >
                    Copiar
                  </button>

                  <div
                    class="ml-auto flex items-center gap-3 text-xs text-muted"
                  >
                    @if (copyMarkdownFeedback) {
                      <span class="text-violet-600 font-medium">Copiado</span>
                    }
                    @if (autoSaved) {
                      <span class="text-green-600 flex items-center gap-1">
                        <span
                          class="w-1.5 h-1.5 bg-green-500 rounded-full"
                        ></span>
                        Guardado automático
                      </span>
                    }
                    <span>{{ wordCount }} palabras</span>
                    <span>{{ characterCount }} caracteres</span>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label
                      for="content"
                      class="block text-sm font-medium text-slate-700"
                    >
                      Contenido Universal (Markdown, Texto, HTML)
                    </label>
                    <div class="flex items-center gap-2 text-xs text-muted">
                      <span class="px-2 py-1 bg-slate-100 rounded"
                        >Atajos: Ctrl+B Ctrl+I Ctrl+S</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Editor Markdown -->
                    <div class="space-y-2">
                      <div
                        class="text-xs font-medium text-muted flex justify-between"
                      >
                        <span>Editor</span>
                        <button
                          type="button"
                          (click)="toggleFullscreen()"
                          class="hover:text-blue-600"
                        >
                          {{
                            fullscreenMode
                              ? 'Salir pantalla completa'
                              : 'Pantalla completa'
                          }}
                        </button>
                      </div>
                      <textarea
                        #editor
                        formControlName="content"
                        [placeholder]="getContentPlaceholder()"
                        rows="18"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-vertical"
                        (input)="updatePreview()"
                        (keydown)="handleKeydown($event)"
                        [class.h-screen]="fullscreenMode"
                      ></textarea>
                    </div>

                    <!-- Vista Previa Live -->
                    <div class="space-y-2">
                      <div class="text-xs font-medium text-muted">
                        Vista Previa
                      </div>
                      <div
                        class="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl min-h-[350px] max-h-[500px] overflow-auto markdown-preview shadow-inner bg-[#f8fafc]"
                        [innerHTML]="previewHtml"
                        [class.h-screen]="fullscreenMode"
                      ></div>
                    </div>
                  </div>
                </div>

                @if (selectedType.id === 'architecture') {
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <label
                        for="architectureDiagram"
                        class="block text-sm font-medium text-slate-700"
                        >Diagrama de Arquitectura (Mermaid)</label
                      >
                      <textarea
                        id="architectureDiagram"
                        formControlName="architectureDiagram"
                        rows="4"
                        placeholder="graph TD&#10;    A[Cliente] --> B[API Gateway]&#10;    B --> C[Servicio de Autenticación]&#10;    B --> D[Servicio de Documentos]&#10;    C --> E[Base de Datos]&#10;    D --> E"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm"
                      ></textarea>
                    </div>
                  </div>
                }
              </div>

              <div class="pt-8 border-t border-soft space-y-4">
                <button
                  type="button"
                  (click)="goBack()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 bg-surface text-doc-ink hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
                >
                  <svg
                    class="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Volver Atrás
                </button>

                <div
                  class="rounded-2xl border border-soft bg-[#f1f5f9] p-4 sm:p-5 action-bar-panel"
                >
                  <div
                    class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
                  >
                    <div class="min-w-0 space-y-3">
                      <p
                        class="text-xs font-semibold uppercase tracking-wider text-doc-muted-on-light"
                      >
                        Importar y exportar
                      </p>
                      <input
                        type="file"
                        #fileInput
                        hidden
                        (change)="importDocument($event)"
                        accept=".md,.txt,.pdf,.docx,.xlsx,.html"
                      />
                      <div class="flex flex-wrap gap-2">
                        <button
                          type="button"
                          (click)="fileInput.click()"
                          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-brand text-white shadow-md hover:opacity-95 transition-opacity"
                        >
                          📥 Importar
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('markdown')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-doc-ink shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          📑 MD
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('pdf')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-doc-ink shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          📄 PDF
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('xlsx')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-doc-ink shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          📊 Excel
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('html')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-doc-ink shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          🌐 HTML
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('txt')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-doc-ink shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          📃 TXT
                        </button>
                      </div>
                    </div>

                    <div
                      class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch lg:justify-end lg:min-w-[min(100%,20rem)]"
                    >
                      <button
                        type="button"
                        (click)="openFloatingAssistant()"
                        class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-slate-300 bg-white text-doc-ink hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <svg
                          class="w-4 h-4 shrink-0 text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
                          />
                        </svg>
                        Abrir ayuda flotante
                      </button>
                      <a
                        routerLink="/documents/analysis"
                        class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-slate-300 bg-white text-doc-ink hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <svg
                          class="w-4 h-4 shrink-0 text-emerald-600"
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
                        Analizar Propuesta
                      </a>
                      <button
                        type="submit"
                        [disabled]="
                          documentForm.invalid || isGenerating || isAiGenerating
                        "
                        class="footer-cta-primary w-full sm:w-auto sm:min-w-[14rem]"
                      >
                        @if (!isGenerating) {
                          <svg
                            class="w-5 h-5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 0 01-2-2V5a2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 0 01.293.707V19a2 0 01-2 2z"
                            />
                          </svg>
                        }
                        @if (isGenerating) {
                          <svg
                            class="w-5 h-5 shrink-0 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        }
                        <span class="text-left leading-snug">
                          {{
                            isGenerating
                              ? 'Generando documento…'
                              : 'Generar documento (PDF / Excel / HTML)'
                          }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        }
    </div>
  `,
})
export class DocumentCreateEditorComponent implements OnInit {
  selectedType: DocumentType | null = null;
  documentForm: FormGroup;
  isGenerating = false;
  /** Plantilla elegida en la URL (solo contexto para IA). */
  private queryTemplateId: string | null = null;
  aiBrief = '';
  aiInstruction = '';
  isAiGenerating = false;
  aiError: string | null = null;
  previewHtml = '';
  wordCount = 0;
  characterCount = 0;
  autoSaved = false;
  /** Feedback breve tras copiar Markdown al portapapeles. */
  copyMarkdownFeedback = false;
  fullscreenMode = false;

  templates: DocumentTemplate[] = [];
  private readonly templatesService = inject(TemplatesRegistryService);

  documentTypes: DocumentType[] = [
    {
      id: 'quote',
      name: 'Presupuesto',
      description: 'Generar presupuesto para proyectos',
    },
    {
      id: 'proposal',
      name: 'Propuesta Comercial',
      description: 'Crear propuestas detalladas para clientes',
    },
    {
      id: 'documentation',
      name: 'Documentación Técnica',
      description: 'Crear documentos técnicos o informativos',
    },
    {
      id: 'architecture',
      name: 'Documentación Arquitectónica',
      description: 'Documentos de arquitectura de sistemas con diagramas',
    },
    {
      id: 'resume',
      name: 'Currículum Vitae',
      description: 'Plantillas estandarizadas de CV para candidatos',
    },
    {
      id: 'interview',
      name: 'Pruebas Técnicas Entrevista',
      description: 'Evaluaciones y scorecards estandarizados',
    },
    {
      id: 'offer',
      name: 'Cartas de Oferta',
      description: 'Cartas oficiales de contratación estandarizadas',
    },
  ];

  clients = [
    { id: '1', name: 'Cliente A' },
    { id: '2', name: 'Cliente B' },
    { id: '3', name: 'BABOONI' },
  ];

  clientOptions = this.clients.map((client) => ({
    label: client.name,
    value: client.id,
  }));

  readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly pdfService = inject(PdfGenerationService);
  readonly assistantService = inject(AssistantContextService);
  readonly universalDocument = inject(UniversalDocumentService);
  private readonly documentAi = inject(DocumentAiService);
  private readonly viewportScroller = inject(ViewportScroller);

  constructor() {
    this.documentForm = this.fb.group({
      clientId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0]],
      projectName: [''],
      totalAmount: [''],
      description: [''],
      title: [''],
      content: [''],
      executiveSummary: [''],
      objectives: [''],
      scope: [''],
      deliverables: [''],
      timeline: [''],
      pricing: [''],
      terms: [''],
      systemOverview: [''],
      architectureDiagram: [''],
      components: [''],
      dataFlow: [''],
      apis: [''],
      technologies: [''],
      deployment: [''],
    });
  }

  /** Lista de plantillas según categoría del tipo de documento (para cambiar plantilla en el editor). */
  private setTemplatesForType(type: DocumentType): void {
    const categoryMap: Record<string, DocumentTemplate['category']> = {
      resume: 'hr',
      interview: 'hr',
      offer: 'hr',
      documentation: 'technical',
      architecture: 'technical',
      quote: 'business',
      proposal: 'business',
    };

    const category = categoryMap[type.id];
    this.templates = category
      ? this.templatesService.getByCategory(category)
      : this.templatesService.all();
  }

  goBack() {
    void this.router.navigate(['/documents/create']);
  }

  openFloatingAssistant(): void {
    this.assistantService.openAssistant();
  }

  private getAiContext(): DocumentAiContext {
    const tpl = this.queryTemplateId
      ? this.templatesService.getById(this.queryTemplateId)
      : null;
    const clientId = this.documentForm.get('clientId')?.value;
    const client = this.clients.find((c) => c.id === clientId);
    return {
      documentTypeId: this.selectedType!.id,
      documentTypeLabel: this.selectedType!.name,
      title: this.documentForm.get('title')?.value ?? undefined,
      clientName: client?.name,
      templateName: tpl?.name,
      templateDescription: tpl?.description,
      existingContent: this.documentForm.get('content')?.value || '',
    };
  }

  copyMarkdownToClipboard(): void {
    const content = this.documentForm.get('content')?.value || '';
    void navigator.clipboard.writeText(content).then(
      () => {
        this.copyMarkdownFeedback = true;
        setTimeout(() => (this.copyMarkdownFeedback = false), 2000);
      },
      () => {
        alert(
          'No se pudo copiar al portapapeles. Comprueba los permisos del navegador.',
        );
      },
    );
  }

  async generateDraftWithAi(mode: 'replace' | 'append'): Promise<void> {
    if (!this.selectedType) return;
    const brief = this.aiBrief.trim();
    if (!brief) {
      this.aiError = 'Describe qué debe contener el documento.';
      return;
    }
    this.isAiGenerating = true;
    this.aiError = null;
    try {
      const ctx = this.getAiContext();
      const md = await this.documentAi.generateDraft(brief, ctx);
      const current = this.documentForm.get('content')?.value || '';
      const next =
        mode === 'append'
          ? current
            ? `${current}\n\n---\n\n${md}`
            : md
          : md;
      this.documentForm.patchValue({ content: next });
      this.updatePreview();
      this.assistantService.setDocumentContent(next, this.selectedType.id);
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error ? e.message : 'Error al generar con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  async transformWithAi(): Promise<void> {
    const instruction = this.aiInstruction.trim();
    if (!instruction || !this.selectedType) {
      this.aiError =
        'Escribe una instrucción (por ejemplo: más formal, acortar, añadir tabla de costes).';
      return;
    }
    const existing = this.documentForm.get('content')?.value || '';
    if (!existing.trim()) {
      this.aiError = 'Primero escribe o genera contenido en el editor.';
      return;
    }
    this.isAiGenerating = true;
    this.aiError = null;
    try {
      const ctx = this.getAiContext();
      const md = await this.documentAi.transformContent(instruction, ctx);
      this.documentForm.patchValue({ content: md });
      this.updatePreview();
      this.assistantService.setDocumentContent(md, this.selectedType.id);
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error ? e.message : 'Error al reformular con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  getTitlePlaceholder(): string {
    switch (this.selectedType?.id) {
      case 'quote':
        return 'Ej: Presupuesto Desarrollo Web Corporativo';
      case 'proposal':
        return 'Ej: Propuesta de Implementación ERP';
      case 'documentation':
        return 'Ej: Manual de Usuario - Sistema ERP';
      case 'architecture':
        return 'Ej: Arquitectura del Sistema ERP';
      case 'resume':
        return 'Ej: Currículum - Juan García López';
      case 'interview':
        return 'Ej: Evaluación Técnica - Candidato Senior Developer';
      case 'offer':
        return 'Ej: Carta Oferta - Puesto Senior Full Stack';
      default:
        return 'Título del documento';
    }
  }

  getContentPlaceholder(): string {
    switch (this.selectedType?.id) {
      case 'quote':
        return 'Descripción detallada del presupuesto, alcance de trabajo, condiciones...';
      case 'proposal':
        return 'Contenido de la propuesta comercial, beneficios, solución propuesta...';
      case 'documentation':
        return 'Contenido detallado de la documentación técnica...';
      case 'architecture':
        return 'Descripción de la arquitectura del sistema, componentes, tecnologías...';
      case 'resume':
        return 'Datos personales, experiencia laboral, formación y habilidades del candidato';
      case 'interview':
        return 'Evaluación técnica, preguntas, ejercicios y scorecard estandarizado';
      case 'offer':
        return 'Condiciones contractuales, salario, beneficios y fecha de incorporación';
      default:
        return 'Contenido del documento...';
    }
  }

  ngOnInit() {
    this.assistantService.setActiveTab('create');

    const typeId = this.route.snapshot.queryParamMap.get('type');
    const templateId = this.route.snapshot.queryParamMap.get('template');
    this.queryTemplateId = templateId;

    this.selectedType =
      this.documentTypes.find((t) => t.id === (typeId ?? '')) ?? null;

    if (!this.selectedType) {
      void this.router.navigate(['/documents/create']);
      return;
    }

    this.setTemplatesForType(this.selectedType);

    queueMicrotask(() => this.viewportScroller.scrollToPosition([0, 0]));

    if (templateId) {
      const tpl = this.templatesService.getById(templateId);
      if (tpl) {
        this.documentForm.patchValue({ content: tpl.content });
      }
    }

    this.documentForm.valueChanges.subscribe((values) => {
      this.assistantService.setFormData(values);
      if (values.content) {
        this.assistantService.setDocumentContent(
          values.content,
          this.selectedType?.id,
        );
      }
    });

    setInterval(() => {
      this.autoSaved = true;
      setTimeout(() => (this.autoSaved = false), 2000);
    }, 30000);

    this.updatePreview();
  }

  updatePreview() {
    const content = this.documentForm.get('content')?.value || '';
    const mdOpts = { gfm: true, breaks: true };
    try {
      marked.setOptions?.(mdOpts);
      this.previewHtml = marked.parse(content, mdOpts);
    } catch {
      this.previewHtml = content;
    }

    this.wordCount = content
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    this.characterCount = content.length;
  }

  insertMarkdown(before: string, after: string) {
    const textarea = document.querySelector(
      'textarea[formControlName="content"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = this.documentForm.get('content')?.value || '';
    const selectedText = content.substring(start, end);

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    this.documentForm.patchValue({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
      this.updatePreview();
    }, 0);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.insertMarkdown('**', '**');
    }
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      this.insertMarkdown('*', '*');
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      this.autoSaved = true;
      setTimeout(() => (this.autoSaved = false), 2000);
    }
  }

  loadTemplate(template: DocumentTemplate) {
    this.documentForm.patchValue({ content: template.content });
    this.updatePreview();
  }

  insertCode() {
    this.insertMarkdown('`', '`');
  }

  insertCodeBlock() {
    this.insertMarkdown('```\n', '\n```');
  }

  toggleFullscreen() {
    this.fullscreenMode = !this.fullscreenMode;
  }

  async exportDocument(format: string) {
    const content = this.documentForm.get('content')?.value || '';
    const title = this.documentForm.get('title')?.value || 'documento';
    const formValue = this.documentForm.value;
    const client = this.clients.find((c) => c.id === formValue.clientId);

    if (format === 'pdf') {
      try {
        const dateStr = formValue.date
          ? String(formValue.date)
          : new Date().toISOString().split('T')[0];
        const pdfBlob = await this.pdfService.generateMarkdownPdf({
          content: content,
          title: title,
          date: dateStr,
          client: client?.name || 'Josanz ERP',
          subtitle: client?.name || 'Josanz ERP',
        });
        this.universalDocument.download(pdfBlob, `${title}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(
          'No se pudo generar el PDF. Revisa el contenido e inténtalo de nuevo.',
        );
      }
      return;
    }

    const blocks = content.split('\n\n').map((text: string) => ({
      id: crypto.randomUUID(),
      type: text.startsWith('# ') ? 'heading' : 'text',
      content: text,
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    }));

    const formatMap: Record<string, DocumentFormat> = {
      markdown: DocumentFormat.MARKDOWN,
      xlsx: DocumentFormat.XLSX,
      html: DocumentFormat.HTML,
      txt: DocumentFormat.PLAINTEXT,
    };

    try {
      const blob = await this.universalDocument.export(blocks, {
        format: formatMap[format],
      });
      this.universalDocument.download(blob, `${title}.${format}`);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
    }
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  async importDocument(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const result = await this.universalDocument.import(file);

    if (result.success) {
      const content = result.blocks.map((b) => b.content).join('\n\n');
      this.documentForm.get('content')?.setValue(content);
    }

    result.warnings.forEach((warning) => {
      console.warn(warning);
    });

    this.fileInput.nativeElement.value = '';
  }

  async generateDocument() {
    if (this.documentForm.valid) {
      this.isGenerating = true;
      try {
        const formValue = this.documentForm.value;
        const client = this.clients.find((c) => c.id === formValue.clientId);

        const documentData = {
          ...formValue,
          client: client?.name || 'Cliente',
          type: this.selectedType?.id,
        };

        let pdfBytes: Blob;
        switch (this.selectedType?.id) {
          case 'quote':
            pdfBytes = await this.pdfService.generateQuotePdf(documentData);
            break;
          case 'proposal':
            pdfBytes = await this.pdfService.generateProposalPdf(documentData);
            break;
          case 'documentation':
          case 'architecture':
          default:
            pdfBytes =
              await this.pdfService.generateDocumentationPdf(documentData);
        }

        const pdfArray = new Uint8Array(await pdfBytes.arrayBuffer());

        const documentId = Date.now().toString();
        localStorage.setItem(
          `document_${documentId}`,
          JSON.stringify({
            ...documentData,
            pdfBytes: Array.from(pdfArray),
          }),
        );

        this.router.navigate(['/documents/preview', documentId]);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        this.isGenerating = false;
      }
    }
  }
}
