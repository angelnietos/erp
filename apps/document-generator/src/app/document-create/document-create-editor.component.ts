import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  isDevMode,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, interval } from 'rxjs';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { DocumentPersistenceService } from '../services/document-persistence.service';
import { AssistantContextService } from '../services/assistant-context.service';
import type { AssistantDocumentCommand } from '../services/assistant-context.service';
import {
  UniversalDocumentService,
  DocumentFormat,
} from '../services/universal-document.service';
import {
  TemplatesRegistryService,
  DocumentTemplate,
  PdfStyle,
} from '../services/templates-registry.service';
import {
  DocumentAiService,
  DocumentAiContext,
} from '../services/document-ai.service';
import type { MarkedGlobal } from '../types/cdn-script-globals';
import {
  buildPreviewBackgroundOverrideCss,
  buildDocumentPreviewCss,
  buildPreviewPaneStyle,
  enrichDocumentHtmlForStyling,
  normalizeUserCss,
  prioritizeUserCss,
  resolvePdfGenerationCss,
  scopeCssToMarkdownPreview,
} from '../utils/document-preview-css';
import { CoverEditorComponent, type CoverConfig } from './cover-editor.component';
import { SignatureEditorComponent, type SignatureConfig } from './signature-editor.component';
import { HeaderFooterEditorComponent, type HeaderFooterConfig } from './header-footer-editor.component';
import { TableBuilderComponent, type TableConfig } from './table-builder.component';
import { ImageInsertComponent, type ImageConfig } from './image-insert.component';
import { SlashCommandsComponent, type SlashCommand } from './slash-commands.component';

declare const marked: MarkedGlobal;

type ContentEditorMode = 'markdown' | 'html' | 'plain';

type EditorBlockTemplateId =
  | 'paragraph'
  | 'section'
  | 'key-value'
  | 'simple-table'
  | 'timeline'
  | 'budget'
  | 'risks'
  | 'approvals'
  | 'callout'
  | 'signatures';

type SelectedTextFormatId =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bold'
  | 'italic'
  | 'quote'
  | 'list'
  | 'numbered-list'
  | 'inline-code'
  | 'callout';

interface EditorBlockTemplate {
  id: EditorBlockTemplateId;
  label: string;
  markdown: string;
  html: string;
}

interface SelectedTextFormat {
  id: SelectedTextFormatId;
  label: string;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

@Component({
  styles: [
    `
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.35); }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      .animate-float  { animation: float 3s ease-in-out infinite; }
      .animate-slide-up { animation: slide-up 0.45s cubic-bezier(.22,.68,0,1.2) both; }
      .brand-gradient { background: linear-gradient(135deg, var(--brand), var(--brand-surface)); }

      /* ─── CTA Primary ────────────────────────────────────── */
      .footer-cta-primary {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 0.5rem; min-height: 3rem; padding: 0.75rem 1.25rem;
        border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem;
        color: #fff !important; border: none; cursor: pointer;
        background: linear-gradient(135deg, var(--brand) 0%, color-mix(in srgb, var(--brand) 78%, #0f172a) 100%);
        box-shadow: 0 10px 28px color-mix(in srgb, var(--brand) 38%, transparent);
        transition: transform .2s, box-shadow .2s, filter .2s;
      }
      .footer-cta-primary:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px); }
      .footer-cta-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }
      .footer-cta-primary svg { color:#fff !important; stroke:#fff !important; }

      /* ─── Save Draft ─────────────────────────────────────── */
      .footer-save-draft {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 0.45rem; min-height: 3rem; padding: 0.75rem 1.1rem;
        border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem;
        color: var(--text-primary) !important; background: var(--bg-secondary);
        border: 1px solid var(--border-soft); cursor: pointer;
        transition: background .15s, border-color .15s, box-shadow .15s;
      }
      .footer-save-draft:hover:not(:disabled) { background: var(--surface-hover); border-color: var(--border-vibrant); }
      .footer-save-draft:disabled { opacity:.5; cursor:not-allowed; }

      /* ─── Editor Layout ──────────────────────────────────── */
      .document-editor-split {
        display: grid;
        grid-template-columns: 15rem 1fr 1fr;
        gap: 1rem;
        align-items: start;
      }

      /* ─── Sidebar Premium ────────────────────────────────── */
      .document-editor-sidebar {
        background: var(--bg-secondary, #f8fafc);
        border: 1px solid var(--border-soft, #e2e8f0);
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 300px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0,0,0,.05);
      }

      /* Section headers inside sidebar */
      .sidebar-section-title {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.75rem 0.3rem;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: var(--text-muted, #94a3b8);
        user-select: none;
      }

      /* Format buttons grid (B I H1 H2 H3 etc) */
      .sidebar-format-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 3px;
        padding: 0.25rem 0.5rem 0.5rem;
      }

      .sidebar-format-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 0.4rem 0.2rem;
        border-radius: 8px;
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        transition: background .12s, border-color .12s, color .12s;
        white-space: nowrap;
      }
      .sidebar-format-btn:hover {
        background: var(--surface-hover, #f1f5f9);
        border-color: var(--border-soft, #e2e8f0);
        color: var(--brand, #2563eb);
      }
      .sidebar-format-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

      /* Wide action buttons (full-width) */
      .sidebar-action-btn {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.48rem 0.75rem;
        background: transparent;
        border: none;
        border-radius: 0;
        cursor: pointer;
        font-size: 0.78rem;
        color: var(--text-primary, #1e293b);
        transition: background .12s;
        text-align: left;
        width: 100%;
      }
      .sidebar-action-btn:hover {
        background: var(--surface-hover, #f1f5f9);
      }
      .sidebar-action-btn svg { width:15px; height:15px; flex-shrink:0; color:var(--text-muted, #64748b); }
      .sidebar-action-btn:hover svg { color:var(--brand, #2563eb); }

      /* PDF Tool card buttons */
      .sidebar-tool-btn {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.5rem 0.75rem;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 0.78rem;
        color: var(--text-primary, #1e293b);
        transition: background .12s;
        text-align: left;
        width: 100%;
        position: relative;
      }
      .sidebar-tool-btn:hover { background: var(--surface-hover, #f1f5f9); }
      .sidebar-tool-btn.active {
        background: linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%);
        color: #1d4ed8;
      }
      .sidebar-tool-btn.active .tool-icon { color: #2563eb; }

      .tool-icon {
        font-size: 1rem;
        flex-shrink: 0;
        width: 22px;
        text-align: center;
      }

      /* Active dot indicator */
      .active-dot {
        display: inline-block;
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #22c55e;
        margin-left: auto;
        flex-shrink: 0;
        animation: pulse-dot 1.8s ease-in-out infinite;
      }

      .sidebar-divider {
        height: 1px;
        background: var(--border-soft, #e2e8f0);
        margin: 0.1rem 0;
      }

      /* ─── Editor Column Bar (inline toolbar) ─────────────── */
      .document-editor-column__bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.75rem;
        background: var(--bg-secondary, #f8fafc);
        border: 1px solid var(--border-soft, #e2e8f0);
        border-radius: 10px 10px 0 0;
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--text-muted, #64748b);
        flex-wrap: wrap;
        min-height: 2.6rem;
      }

      /* Inline format toolbar inside the bar */
      .editor-inline-toolbar {
        display: flex;
        align-items: center;
        gap: 2px;
        background: var(--bg-surface, #fff);
        border: 1px solid var(--border-soft, #e2e8f0);
        border-radius: 8px;
        padding: 2px;
      }
      .editor-inline-toolbar button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px; height: 28px;
        border-radius: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        color: var(--text-secondary, #475569);
        font-size: 0.75rem;
        font-weight: 700;
        transition: background .1s, color .1s;
      }
      .editor-inline-toolbar button:hover {
        background: var(--surface-hover, #f1f5f9);
        color: var(--brand, #2563eb);
      }
      .editor-inline-toolbar button svg { width: 13px; height: 13px; }
      .editor-inline-toolbar .tb-sep {
        width: 1px; height: 16px;
        background: var(--border-soft, #e2e8f0);
        margin: 0 2px;
      }

      /* Mode toggle pills */
      .mode-toggle {
        display: inline-flex;
        border-radius: 8px;
        border: 1px solid var(--border-soft, #e2e8f0);
        background: var(--bg-secondary, #f8fafc);
        padding: 2px;
        margin-left: auto;
      }
      .mode-toggle button {
        padding: 3px 10px;
        border-radius: 6px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
        transition: background .12s, color .12s;
      }
      .mode-toggle button.active {
        background: var(--bg-surface, #fff);
        color: var(--brand, #2563eb);
        box-shadow: 0 1px 3px rgba(0,0,0,.08);
      }

      /* Fullscreen toggle */
      .fullscreen-btn {
        display: flex; align-items: center; gap: 0.3rem;
        padding: 3px 8px; border-radius: 6px; border: none;
        background: transparent; cursor: pointer;
        font-size: 0.72rem; color: var(--text-muted, #64748b);
        transition: color .12s;
      }
      .fullscreen-btn:hover { color: var(--brand, #2563eb); }
      .fullscreen-btn svg { width: 12px; height: 12px; }

      /* Word count badge */
      .editor-stats {
        font-size: 0.68rem;
        color: var(--text-muted, #94a3b8);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      /* ─── Preview badge ──────────────────────────────────── */
      .document-editor-column--preview .document-editor-column__bar {
        background: linear-gradient(90deg, #ecfdf5 0%, #f8fafc 100%);
        border-color: #bbf7d0;
        color: #166534;
      }

      /* A4 paper shadow on preview */
      .document-preview-pane {
        box-shadow: 0 4px 24px rgba(0,0,0,.09), 0 1px 3px rgba(0,0,0,.06);
      }

      /* ─── Stats in sidebar ───────────────────────────────── */
      .sidebar-stats {
        padding: 0.4rem 0.75rem;
        font-size: 0.68rem;
        color: var(--text-muted, #94a3b8);
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .sidebar-stats .saved-badge {
        color: #16a34a;
        font-weight: 600;
        animation: fade-in .3s ease;
      }
    `,
  ],
  selector: 'app-document-create-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CoverEditorComponent, SignatureEditorComponent, HeaderFooterEditorComponent, TableBuilderComponent, ImageInsertComponent],
  template: `
    <!-- eslint-disable @angular-eslint/template/prefer-control-flow -->
    <div class="document-create-page space-y-6">
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
          <div class="document-create-shell bg-surface rounded-2xl shadow-xl border border-soft">
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
                    class="block text-sm font-medium text-secondary"
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
                  class="rounded-2xl border border-violet-200/90 dark:border-violet-800/60 bg-gradient-to-br from-violet-50/90 via-white to-slate-50/80 dark:from-violet-950/40 dark:via-slate-900 dark:to-slate-950 p-6 space-y-4 shadow-md shadow-slate-900/5 ring-1 ring-violet-100/70 dark:ring-violet-900/40"
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
                      class="block text-sm font-medium text-secondary"
                      >Consigna para generar borrador</label
                    >
<textarea
                       id="aiBrief"
                       formControlName="aiBrief"
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
                      class="block text-sm font-medium text-secondary"
                      >Reformular el documento actual</label
                    >
<textarea
                       id="aiInstruction"
                       formControlName="aiInstruction"
                       rows="2"
                       placeholder="Ej.: Acorta a una página, tono más formal, añade sección de riesgos y mitigación."
                       class="w-full px-4 py-3 border border-violet-200 dark:border-violet-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-surface text-sm resize-y"
                       [disabled]="isGenerating || isAiGenerating"
                     ></textarea>
                    <button
                      type="button"
                      (click)="transformWithAi()"
                      [disabled]="isGenerating || isAiGenerating"
                      class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        class="block text-sm font-medium text-secondary"
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
                        class="block text-sm font-medium text-secondary"
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
                  <div class="block text-sm font-medium text-secondary">
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

                <!-- Toolbar relocated to left sidebar in editor split -->

<div class="document-editor-panel">
                    <div class="document-editor-panel__header">
                      <div>
                      <label
                        for="content"
                        class="block text-sm font-semibold text-primary"
                        >Contenido Universal (Markdown, Texto, HTML)</label
                      >
                        <p class="text-xs text-muted mt-1">
                          Escribe a la izquierda y revisa el resultado final a la derecha.
                        </p>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-muted">
                        <span class="px-2 py-1 bg-slate-100 rounded"
                          >Atajos: Ctrl+B Ctrl+I Ctrl+S</span
                        >
                      </div>
                    </div>
 
                    <!-- Custom CSS Input -->
                    <div class="document-css-panel">
                      <label
                        for="customCss"
                        class="block text-sm font-medium text-secondary flex items-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h14a2 2 0 002-2v-7a2 2 0 00-2-2h-5l-2-2-2 2H7a2 2 0 00-2 2v7a2 2 0 002 2z"></path>
                        </svg>
                        Estilos CSS personalizados (opcional)
                      </label>
                      <button
                        type="button"
                        (click)="insertDefaultCssTemplate()"
                        class="ml-auto text-xs px-3 py-1.5 bg-[#7a0000] hover:bg-[#5b0000] text-white rounded-lg transition-colors shadow-sm"
                      >
                        Usar plantilla corporativa
                      </button>
                      <textarea
                        id="customCss"
                        [(ngModel)]="customCss"
                        [ngModelOptions]="{ standalone: true }"
                        rows="8"
                        placeholder="h1 { color: #2563eb; }&#10;.doc-title { letter-spacing: -0.04em; }&#10;.doc-table { border-radius: 16px; overflow: hidden; }&#10;&#10;/* En HTML se aplica como CSS normal. En Markdown se acota automáticamente a la vista previa. */"
class="document-css-panel__textarea w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-y"
                         (input)="applyCustomCss()"
                       ></textarea>
                      <p class="text-xs text-muted">Puedes escribir propiedades sueltas o reglas completas. Se aplican sobre los estilos base del documento.</p>
                    </div>

                    <!-- PDF Style Selector -->
                    @if (pdfStyles.length > 0) {
                      <div class="document-css-panel">
                        <label for="pdfStyleSelector" class="block text-sm font-medium text-secondary mb-2">
                          Estilo del PDF
                        </label>
                        <select
                          id="pdfStyleSelector"
                          [(ngModel)]="selectedPdfStyle"
                          (ngModelChange)="applyCustomCss()"
                          [ngModelOptions]="{ standalone: true }"
                          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface text-sm"
                        >
                          @for (style of pdfStyles; track style.id) {
                            <option [value]="style.id">{{ style.name }}</option>
                          }
                        </select>
                        <p class="text-xs text-muted mt-1">
                          El estilo se aplica al generar el PDF final.
                        </p>
                        <div class="mt-3">
                          <label for="pdfBackgroundMode" class="block text-sm font-medium text-secondary mb-2">Fondo del PDF</label>
                          <div class="flex gap-2 items-center">
                            <select id="pdfBackgroundMode" [(ngModel)]="pdfBackgroundMode" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="px-3 py-2 rounded border bg-white">
                              <option value="theme">Usar tema</option>
                              <option value="color">Color sólido</option>
                              <option value="corporate">Imagen corporativa</option>
                            </select>
                            <input id="pdfBackgroundColor" *ngIf="pdfBackgroundMode === 'color'" type="color" [(ngModel)]="pdfBackgroundColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="w-10 h-10 p-0 border rounded" />
                            <input id="pdfBackgroundImageUrl" *ngIf="pdfBackgroundMode === 'corporate'" type="text" placeholder="URL imagen (https://...)" [(ngModel)]="pdfBackgroundImageUrl" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="flex-1 px-3 py-2 rounded border bg-white" />
                          </div>
                          <p class="text-xs text-muted mt-2">Selecciona cómo se renderizará el fondo del PDF.</p>
                          @if (pdfBackgroundMode !== 'theme') {
                            <div class="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <label class="text-xs font-medium text-secondary">
                                Papel
                                <input type="color" [(ngModel)]="documentPaperColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="mt-1 w-full h-9 p-0 rounded border" />
                              </label>
                              <label class="text-xs font-medium text-secondary">
                                Texto
                                <input type="color" [(ngModel)]="documentTextColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="mt-1 w-full h-9 p-0 rounded border" />
                              </label>
                              <label class="text-xs font-medium text-secondary">
                                Secundario
                                <input type="color" [(ngModel)]="documentMutedColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="mt-1 w-full h-9 p-0 rounded border" />
                              </label>
                              <label class="text-xs font-medium text-secondary">
                                Acento
                                <input type="color" [(ngModel)]="documentAccentColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="mt-1 w-full h-9 p-0 rounded border" />
                              </label>
                              <label class="text-xs font-medium text-secondary">
                                Bordes
                                <input type="color" [(ngModel)]="documentBorderColor" (ngModelChange)="onPdfBackgroundChange()" [ngModelOptions]="{ standalone: true }" class="mt-1 w-full h-9 p-0 rounded border" />
                              </label>
                            </div>
                            <p class="text-xs text-muted mt-2">Al no usar tema, la preview y el PDF usan estos colores del documento, no los de la interfaz.</p>
                          }
                        </div>
                      </div>
                    }

                    <div class="editor-container" [class.fullscreen]="fullscreenMode">
                      @if (fullscreenMode) {
                        <div class="editor-tabs">
                          <button
                            type="button"
                            class="editor-tab-button"
                            [class.active]="fullscreenTab === 'editor'"
                            (click)="fullscreenTab = 'editor'"
                          >
                            Editor
                          </button>
                          <button
                            type="button"
                            class="editor-tab-button"
                            [class.active]="fullscreenTab === 'preview'"
                            (click)="fullscreenTab = 'preview'"
                          >
                            Vista Previa
                          </button>
                        </div>
                      }
 
                      @if (!fullscreenMode) {
                        <div class="document-editor-split">
                            <div class="document-editor-sidebar" role="toolbar" aria-label="Herramientas de edición">

                            <!-- ── FORMATO ─────────────────────────────── -->
                            <div class="sidebar-section-title">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              Formato
                            </div>
                            <div class="sidebar-format-grid">
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('**','**')" title="Negrita (Ctrl+B)">
                                <strong style="font-size:13px">B</strong>
                                <span>Neg.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('*','*')" title="Cursiva (Ctrl+I)">
                                <em style="font-size:13px">I</em>
                                <span>Cur.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('~~','~~')" title="Tachado">
                                <span style="font-size:12px;text-decoration:line-through">S</span>
                                <span>Tach.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertCode()" title="Código inline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                                <span>Cód.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('# ','')" title="Título H1">
                                <span style="font-size:11px;font-weight:800">H1</span>
                                <span>Tít.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('## ','')" title="Subtítulo H2">
                                <span style="font-size:11px;font-weight:700">H2</span>
                                <span>Sub.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('### ','')" title="Encabezado H3">
                                <span style="font-size:11px;font-weight:600">H3</span>
                                <span>Enc.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('> ','')" title="Cita">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10.5h.01M12 10.5h.01M16 10.5h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                <span>Cita</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('- ','')" title="Lista">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                                <span>Lista</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('1. ','')" title="Lista numerada">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                <span>Núm.</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertMarkdown('[','](url)')" title="Enlace">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                                <span>Link</span>
                              </button>
                              <button class="sidebar-format-btn" type="button" (click)="insertCodeBlock()" title="Bloque de código">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3"/></svg>
                                <span>Blq.</span>
                              </button>
                            </div>

                            <div class="sidebar-divider"></div>

                            <!-- ── COLOR DE TEXTO ──────────────────────── -->
                            <div class="sidebar-section-title">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h14a2 2 0 002-2v-4a2 2 0 00-2-2H7m0 6V9"/></svg>
                              Color
                            </div>
                            <div style="display:flex;align-items:center;gap:6px;padding:0 0.75rem 0.5rem">
                              <input id="textColorPicker" type="color"
                                [(ngModel)]="selectedTextColor" [ngModelOptions]="{standalone:true}"
                                style="width:36px;height:30px;border-radius:6px;border:1px solid #e2e8f0;padding:2px;cursor:pointer"
                                aria-label="Color de texto"/>
                              <button class="sidebar-action-btn" style="flex:1;padding:0.3rem 0.5rem;border-radius:8px;border:1px solid #e2e8f0;font-size:0.73rem;background:#fff"
                                type="button" (click)="applyTextColor()" [disabled]="contentEditorMode==='plain'" title="Aplicar color al texto seleccionado">
                                Aplicar color
                              </button>
                            </div>

                            <div class="sidebar-divider"></div>

                            <!-- ── BLOQUES Y ACCIONES ──────────────────── -->
                            <div class="sidebar-section-title">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                              Insertar
                            </div>
                            <div style="padding:0 0.5rem 0.4rem">
                              <select id="editorBlockTemplate"
                                style="width:100%;padding:0.35rem 0.5rem;border-radius:8px;border:1px solid #e2e8f0;font-size:0.75rem;background:#fff;color:#374151"
                                (change)="insertEditorBlockFromSelect($event)" title="Insertar bloque predefinido">
                                <option value="">+ Insertar bloque...</option>
                                @for (block of editorBlockTemplates; track block.id) {
                                  <option [value]="block.id">{{ block.label }}</option>
                                }
                              </select>
                            </div>

                            <button class="sidebar-action-btn" type="button" (click)="copyMarkdownToClipboard()" title="Copiar contenido al portapapeles">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2"/><path stroke-linecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                              <span>Copiar contenido</span>
                              @if (copyMarkdownFeedback) { <span style="color:#7c3aed;font-size:0.65rem;margin-left:auto">✓ Copiado</span> }
                            </button>

                            <button class="sidebar-action-btn" type="button"
                              (click)="convertMarkdownToVisualHtmlWithAi()"
                              [disabled]="contentEditorMode !== 'markdown' || isAiGenerating"
                              title="Convertir el Markdown actual en HTML visual usando IA">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
                              <span>✨ Convertir a HTML visual</span>
                            </button>

                            <div class="sidebar-divider"></div>

                            <!-- ── ESTILO RÁPIDO ───────────────────────── -->
                            <div class="sidebar-section-title">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><circle cx="12" cy="12" r="3"/><path stroke-linecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                              Estilo
                            </div>
                            <div style="padding:0 0.5rem 0.4rem">
                              <select id="stylePresetSelect"
                                style="width:100%;padding:0.35rem 0.5rem;border-radius:8px;border:1px solid #e2e8f0;font-size:0.75rem;background:#fff;color:#374151"
                                [(ngModel)]="selectedQuickStylePreset" [ngModelOptions]="{standalone:true}" (ngModelChange)="applyStylePreset($event)">
                                <option value="">Estilo predefinido...</option>
                                <option value="default">Predeterminado</option>
                                <option value="corporate">Corporativo</option>
                                <option value="compact">Compacto</option>
                                <option value="large">Texto grande</option>
                              </select>
                                @if (showImageInsert) {
                                  <span class="ml-auto text-xs text-blue-600">Activo</span>
                                }
                              </button>
                              <p class="text-[11px] text-muted leading-snug mt-2">
                                Escribe "/" en el editor para comandos rápidos
                              </p>
                            </div>
                          </div>
                          <!-- Editor Markdown -->
                          <div class="document-editor-column">
                            <div class="document-editor-column__bar">
                              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
                                <span>{{ editorModeLabel }}</span>
                                <div class="inline-flex rounded-lg border border-soft bg-secondary p-1 text-xs font-semibold">
                                  <button
                                    type="button"
                                    class="px-2.5 py-1 rounded-md transition-colors"
                                    [class.bg-surface]="contentEditorMode === 'markdown'"
                                    [class.text-brand]="contentEditorMode === 'markdown'"
                                    (click)="setContentEditorMode('markdown')"
                                  >
                                    Markdown
                                  </button>
                                  <button
                                    type="button"
                                    class="px-2.5 py-1 rounded-md transition-colors"
                                    [class.bg-surface]="contentEditorMode === 'html'"
                                    [class.text-brand]="contentEditorMode === 'html'"
                                    (click)="setContentEditorMode('html')"
                                  >
                                    HTML
                                  </button>
                                  <button
                                    type="button"
                                    class="px-2.5 py-1 rounded-md transition-colors"
                                    [class.bg-surface]="contentEditorMode === 'plain'"
                                    [class.text-brand]="contentEditorMode === 'plain'"
                                    (click)="setContentEditorMode('plain')"
                                  >
                                    Texto
                                  </button>
                                </div>
                              </div>
                              <button type="button" (click)="toggleFullscreen()" class="hover:text-brand transition-colors">
                                Pantalla completa
                              </button>
                            </div>
                            <textarea
                              #editor
                              formControlName="content"
                              [placeholder]="editorPlaceholder"
                              rows="24"
                              class="document-editor-textarea w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-surface font-mono text-sm resize-vertical"
                              (input)="updatePreview()"
                              (keydown)="handleKeydown($event)"
                            ></textarea>
                          </div>
 
                          <!-- Vista Previa Live -->
                          <div class="document-editor-column document-editor-column--preview">
                            <div class="document-editor-column__bar">
                              <span>Vista Previa</span>
                              <span class="font-mono">{{ wordCount }} palabras • {{ characterCount }} caracteres</span>
                            </div>
                            @if (contentEditorMode === 'html') {
                              <iframe
                                title="Vista previa HTML"
                                class="document-preview-pane w-full min-h-[70vh] border border-[#e2e8f0] rounded-xl bg-white shadow-inner"
                                [srcdoc]="htmlPreviewSrcdoc"
                              ></iframe>
                            } @else {
                              <div class="document-preview-pane w-full px-5 py-4 border border-[#e2e8f0] rounded-xl overflow-auto markdown-preview shadow-inner" [class.document-preview-pane--isolated]="pdfBackgroundMode !== 'theme'" [ngStyle]="previewPaneStyle" [innerHTML]="previewHtml"></div>
                            }
                          </div>
                        </div>
                      }
 
                      @if (fullscreenMode) {
                        <div class="document-fullscreen-body">
                          <!-- Editor Markdown (Fullscreen) -->
                          @if (fullscreenTab === 'editor') {
                            <div class="document-editor-column fullscreen-editor">
                              <div class="document-editor-column__bar">
                                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <span>{{ editorModeLabel }}</span>
                                  <div class="inline-flex rounded-lg border border-soft bg-secondary p-1 text-xs font-semibold">
                                    <button type="button" class="px-2.5 py-1 rounded-md" [class.bg-surface]="contentEditorMode === 'markdown'" [class.text-brand]="contentEditorMode === 'markdown'" (click)="setContentEditorMode('markdown')">Markdown</button>
                                    <button type="button" class="px-2.5 py-1 rounded-md" [class.bg-surface]="contentEditorMode === 'html'" [class.text-brand]="contentEditorMode === 'html'" (click)="setContentEditorMode('html')">HTML</button>
                                    <button type="button" class="px-2.5 py-1 rounded-md" [class.bg-surface]="contentEditorMode === 'plain'" [class.text-brand]="contentEditorMode === 'plain'" (click)="setContentEditorMode('plain')">Texto</button>
                                  </div>
                                </div>
                                <button type="button" (click)="toggleFullscreen()" class="hover:text-brand transition-colors">Salir pantalla completa</button>
                              </div>
                              <textarea
                                #editor
                                formControlName="content"
                                [placeholder]="editorPlaceholder"
                                class="document-editor-textarea w-full flex-1 bg-surface font-mono text-sm resize-none border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                (input)="updatePreview()"
                                (keydown)="handleKeydown($event)"
                              ></textarea>
                            </div>
                          }
 
                          <!-- Vista Previa (Fullscreen) -->
                          @if (fullscreenTab === 'preview') {
                            <div class="document-editor-column fullscreen-preview">
                              <div class="document-editor-column__bar">
                                Vista Previa
                                <span class="ml-auto text-xs font-mono bg-tertiary px-2 py-0.5 rounded">{{ wordCount }} palabras • {{ characterCount }} caracteres</span>
                              </div>
                              @if (contentEditorMode === 'html') {
                                <iframe
                                  title="Vista previa HTML"
                                  class="document-preview-pane w-full flex-1 min-h-0 border border-[#e2e8f0] rounded-xl bg-white shadow-inner"
                                  [srcdoc]="htmlPreviewSrcdoc"
                                ></iframe>
                              } @else {
                                <div class="document-preview-pane w-full flex-1 min-h-0 border border-[#e2e8f0] rounded-xl overflow-auto markdown-preview shadow-inner" [class.document-preview-pane--isolated]="pdfBackgroundMode !== 'theme'" [ngStyle]="previewPaneStyle" [innerHTML]="previewHtml"></div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>

                @if (selectedType.id === 'architecture') {
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <label
                        for="architectureDiagram"
                        class="block text-sm font-medium text-secondary"
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
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
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
                  class="rounded-2xl border border-soft bg-surface p-4 sm:p-5"
                >
                  <div
                    class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
                  >
                    <div class="min-w-0 space-y-3">
                      <p
                        class="text-xs font-semibold uppercase tracking-wider text-secondary"
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
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
                        >
                          📑 MD
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('pdf')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
                        >
                          📄 PDF
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('xlsx')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
                        >
                          📊 Excel
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('html')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
                        >
                          🌐 HTML
                        </button>
                        <button
                          type="button"
                          (click)="exportDocument('txt')"
                          class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
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
                        class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
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
                      <button
                        type="button"
                        (click)="saveDraft()"
                        [disabled]="!selectedType || isSavingDraft || isGenerating"
                        class="footer-save-draft w-full sm:w-auto"
                        title="Guarda el contenido en el historial de este navegador (IndexedDB)"
                      >
                        @if (isSavingDraft) {
                          <svg
                            class="w-4 h-4 shrink-0 animate-spin text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        } @else {
                          <svg
                            class="w-4 h-4 shrink-0 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l3 3m0 0l3-3m-3 3V4"
                            />
                          </svg>
                        }
                        Guardar borrador
                      </button>
                      <a
                        routerLink="/documents/analysis"
                        class="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border border-soft bg-secondary text-primary hover:bg-surface-hover transition-colors shadow-sm"
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
                        <span class="text-left leading-snug drop-shadow-sm">
                          {{
                            isGenerating
                              ? 'Generando documento…'
                              : 'Generar documento (PDF)'
                          }}
                        </span>
                      </button>
                    </div>
                    @if (draftSaveMessage) {
                      <p
                        class="text-xs text-emerald-700 dark:text-emerald-400 mt-2 text-right"
                        role="status"
                      >
                        {{ draftSaveMessage }}
                      </p>
                    }
                    @if (documentGenerateError) {
                      <p
                        class="text-xs text-red-700 dark:text-red-400 mt-2 text-right"
                        role="alert"
                      >
                        {{ documentGenerateError }}
                      </p>
                    }
                  </div>
                </div>
              </div>
            </form>

            <!-- Centered High-End Glassmorphism Modal Wrapper -->
            <div 
              class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300"
              [class.opacity-0]="!hasActiveModal()"
              [class.pointer-events-none]="!hasActiveModal()"
            >
              <div 
                class="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform"
                [class.scale-95]="!hasActiveModal()"
                [class.scale-100]="hasActiveModal()"
              >
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 class="text-base font-bold text-slate-800">
                      @if (showCoverEditor) { Portada del Documento }
                      @else if (showSignatureEditor) { Bloque de Firmas }
                      @else if (showHeaderFooterEditor) { Encabezado y Pie de Página }
                      @else if (showTableBuilder) { Constructor de Tablas }
                      @else if (showImageInsert) { Insertar Imagen }
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5">
                      @if (showCoverEditor) { Personaliza la primera página de tu PDF con logo, títulos y fondos }
                      @else if (showSignatureEditor) { Configura firmas para los responsables al final del documento }
                      @else if (showHeaderFooterEditor) { Define la paginación y cabeceras de cada página }
                      @else if (showTableBuilder) { Diseña y estructura tablas de datos visualmente }
                      @else if (showImageInsert) { Sube y edita el diseño de imágenes en tu documento }
                    </p>
                  </div>
                  <button type="button" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600" (click)="closeAllModals()">
                    <span class="text-lg">✕</span>
                  </button>
                </div>

                <!-- Modal Body (Scrollable) -->
                <div class="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                  <!-- Cover Editor -->
                  <div [class.hidden]="!showCoverEditor">
                    <app-cover-editor
                      #coverEditorRef
                      class="block"
                      [initialConfig]="coverConfig"
                      (configChanged)="onCoverConfigChanged($event)"
                    ></app-cover-editor>
                    <div class="mt-4 flex justify-end gap-3">
                      <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors" (click)="closeAllModals()">
                        Cerrar
                      </button>
                      <button type="button" class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors" (click)="insertCoverIntoDocument(); closeAllModals()">
                        Insertar en Documento
                      </button>
                    </div>
                  </div>

                  <!-- Signature Editor -->
                  <div [class.hidden]="!showSignatureEditor">
                    <app-signature-editor
                      #signatureEditorRef
                      [initialConfig]="signatureConfig"
                      (configChanged)="onSignatureConfigChanged($event)"
                    ></app-signature-editor>
                    <div class="mt-4 flex justify-end gap-3">
                      <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors" (click)="closeAllModals()">
                        Cerrar
                      </button>
                      <button type="button" class="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors" (click)="insertSignatureIntoDocument(); closeAllModals()">
                        Insertar en Documento
                      </button>
                    </div>
                  </div>

                  <!-- Header/Footer Editor -->
                  <div [class.hidden]="!showHeaderFooterEditor">
                    <app-header-footer-editor
                      #headerFooterEditorRef
                      [initialConfig]="headerFooterConfig"
                      (configChanged)="onHeaderFooterConfigChanged($event)"
                    ></app-header-footer-editor>
                    <div class="mt-4 flex justify-end">
                      <button type="button" class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors" (click)="closeAllModals()">
                        Aceptar
                      </button>
                    </div>
                  </div>

                  <!-- Table Builder -->
                  <div [class.hidden]="!showTableBuilder">
                    <app-table-builder
                      #tableBuilderRef
                    ></app-table-builder>
                    <div class="mt-4 flex justify-end gap-3">
                      <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors" (click)="closeAllModals()">
                        Cancelar
                      </button>
                      <button type="button" class="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors" (click)="insertTableFromBuilder(); closeAllModals()">
                        Insertar Tabla
                      </button>
                    </div>
                  </div>

                  <!-- Image Insert -->
                  <div [class.hidden]="!showImageInsert">
                    <app-image-insert
                      #imageInsertRef
                    ></app-image-insert>
                    <div class="mt-4 flex justify-end gap-3">
                      <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors" (click)="closeAllModals()">
                        Cancelar
                      </button>
                      <button type="button" class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors" (click)="insertImageFromUpload(); closeAllModals()">
                        Insertar Imagen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
  isAiGenerating = false;
  aiError: string | null = null;
  previewHtml: SafeHtml = '';
  htmlPreviewSrcdoc: SafeHtml = '';
  private previewHtmlMarkup = '';
  wordCount = 0;
  characterCount = 0;
  autoSaved = false;
  /** Id del borrador en IndexedDB (reutilizado al volver a guardar). */
  savedDraftId: string | null = null;
  draftSaveMessage = '';
  /** Mensaje si falla Generar documento (PDF final). */
  documentGenerateError = '';
  isSavingDraft = false;
  /** Feedback breve tras copiar Markdown al portapapeles. */
  copyMarkdownFeedback = false;
  fullscreenMode = false;
  fullscreenTab: 'editor' | 'preview' = 'editor';
  contentEditorMode: ContentEditorMode = 'markdown';
  customCss = '';
  selectedPdfStyle = 'default';
  selectedQuickStylePreset = '';
  selectedTextColor = '#7a0000';
  selectedTextFormat: SelectedTextFormatId = 'paragraph';
  pdfStyles: PdfStyle[] = [];
  // PDF background options
  pdfBackgroundMode: 'theme' | 'color' | 'corporate' = 'theme';
  pdfBackgroundColor = '#ffffff';
  pdfBackgroundImageUrl = '';
  documentPaperColor = '#ffffff';
  documentTextColor = '#1f2937';
  documentMutedColor = '#475569';
  documentAccentColor = '#2563eb';
  documentBorderColor = '#e2e8f0';

  showCoverEditor = false;
  showSignatureEditor = false;
  showHeaderFooterEditor = false;
  showTableBuilder = false;
  showImageInsert = false;
  showSlashCommands = false;
  slashMenuPosition = { x: 0, y: 0 };
  activeSidebarTab: 'styles' | 'blocks' | 'advanced' = 'blocks';

  coverConfig: Partial<CoverConfig> = {};
  signatureConfig: Partial<SignatureConfig> = {};
  headerFooterConfig: Partial<HeaderFooterConfig> = {};

  @ViewChild(CoverEditorComponent) coverEditor!: CoverEditorComponent;
  @ViewChild(SignatureEditorComponent) signatureEditor!: SignatureEditorComponent;
  @ViewChild(HeaderFooterEditorComponent) headerFooterEditor!: HeaderFooterEditorComponent;
  @ViewChild(TableBuilderComponent) tableBuilder!: TableBuilderComponent;
  @ViewChild(ImageInsertComponent) imageInsert!: ImageInsertComponent;
  @ViewChild(SlashCommandsComponent) slashCommands!: SlashCommandsComponent;
  readonly selectedTextFormats: SelectedTextFormat[] = [
    { id: 'paragraph', label: 'Párrafo normal' },
    { id: 'h1', label: 'Título H1' },
    { id: 'h2', label: 'Título H2' },
    { id: 'h3', label: 'Título H3' },
    { id: 'bold', label: 'Negrita' },
    { id: 'italic', label: 'Cursiva' },
    { id: 'quote', label: 'Cita' },
    { id: 'list', label: 'Lista' },
    { id: 'numbered-list', label: 'Lista numerada' },
    { id: 'inline-code', label: 'Código' },
    { id: 'callout', label: 'Nota destacada' },
  ];
  readonly editorBlockTemplates: EditorBlockTemplate[] = [
    {
      id: 'paragraph',
      label: 'Párrafo',
      markdown: `\n\n[Escribe aquí un párrafo descriptivo con el contexto, objetivo o explicación principal.]\n`,
      html: `<p>[Escribe aquí un párrafo descriptivo con el contexto, objetivo o explicación principal.]</p>`,
    },
    {
      id: 'section',
      label: 'Sección completa',
      markdown: `\n\n## [Título de la sección]\n\n**Objetivo:** [Describe el objetivo]\n\n**Detalle:** [Explica los puntos principales]\n\n**Resultado esperado:** [Indica el resultado]\n`,
      html: `<section class="section card">
  <h2>[Título de la sección]</h2>
  <p><strong>Objetivo:</strong> [Describe el objetivo]</p>
  <p><strong>Detalle:</strong> [Explica los puntos principales]</p>
  <p><strong>Resultado esperado:</strong> [Indica el resultado]</p>
</section>`,
    },
    {
      id: 'key-value',
      label: 'Datos clave',
      markdown: `\n\n| Campo | Valor |\n|---|---|\n| Proyecto | [Nombre del proyecto] |\n| Cliente | [Nombre del cliente] |\n| Fecha | [Fecha] |\n| Responsable | [Nombre] |\n`,
      html: `<table class="doc-table metadata-grid">
  <tbody>
    <tr><th>Proyecto</th><td>[Nombre del proyecto]</td></tr>
    <tr><th>Cliente</th><td>[Nombre del cliente]</td></tr>
    <tr><th>Fecha</th><td>[Fecha]</td></tr>
    <tr><th>Responsable</th><td>[Nombre]</td></tr>
  </tbody>
</table>`,
    },
    {
      id: 'simple-table',
      label: 'Tabla simple',
      markdown: `\n\n| Columna 1 | Columna 2 | Columna 3 |\n|---|---|---|\n| [Dato] | [Dato] | [Dato] |\n| [Dato] | [Dato] | [Dato] |\n`,
      html: `<table class="doc-table">
  <thead><tr><th>Columna 1</th><th>Columna 2</th><th>Columna 3</th></tr></thead>
  <tbody>
    <tr><td>[Dato]</td><td>[Dato]</td><td>[Dato]</td></tr>
    <tr><td>[Dato]</td><td>[Dato]</td><td>[Dato]</td></tr>
  </tbody>
</table>`,
    },
    {
      id: 'timeline',
      label: 'Cronograma / hitos',
      markdown: `\n\n## Cronograma e hitos\n\n| Hito | Descripción | Fecha estimada | Dependencias |\n|---|---|---|---|\n| Hito 1 | Inicio del proyecto | [Fecha] | - |\n| Hito 2 | Diseño aprobado | [Fecha] | Hito 1 |\n| Hito 3 | Entrega final | [Fecha] | Hito 2 |\n`,
      html: `<section class="section">
  <h2>Cronograma e hitos</h2>
  <table class="doc-table timeline-table">
    <thead><tr><th>Hito</th><th>Descripción</th><th>Fecha estimada</th><th>Dependencias</th></tr></thead>
    <tbody>
      <tr><td>Hito 1</td><td>Inicio del proyecto</td><td>[Fecha]</td><td>-</td></tr>
      <tr><td>Hito 2</td><td>Diseño aprobado</td><td>[Fecha]</td><td>Hito 1</td></tr>
      <tr><td>Hito 3</td><td>Entrega final</td><td>[Fecha]</td><td>Hito 2</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'budget',
      label: 'Presupuesto',
      markdown: `\n\n## Presupuesto estimado\n\n| Concepto | Horas | Coste unitario | Importe |\n|---|---:|---:|---:|\n| Análisis y diseño | [h] | [EUR/h] | [EUR] |\n| Desarrollo | [h] | [EUR/h] | [EUR] |\n| Pruebas | [h] | [EUR/h] | [EUR] |\n| **Total** |  |  | **[EUR]** |\n`,
      html: `<section class="section">
  <h2>Presupuesto estimado</h2>
  <table class="doc-table budget-table">
    <thead><tr><th>Concepto</th><th>Horas</th><th>Coste unitario</th><th>Importe</th></tr></thead>
    <tbody>
      <tr><td>Análisis y diseño</td><td>[h]</td><td>[EUR/h]</td><td>[EUR]</td></tr>
      <tr><td>Desarrollo</td><td>[h]</td><td>[EUR/h]</td><td>[EUR]</td></tr>
      <tr><td>Pruebas</td><td>[h]</td><td>[EUR/h]</td><td>[EUR]</td></tr>
      <tr><td><strong>Total</strong></td><td></td><td></td><td><strong>[EUR]</strong></td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'risks',
      label: 'Riesgos',
      markdown: `\n\n## Riesgos y mitigación\n\n| Riesgo | Impacto | Probabilidad | Mitigación |\n|---|---|---|---|\n| [Riesgo] | Alto/Medio/Bajo | Alta/Media/Baja | [Acción preventiva] |\n| [Riesgo] | Alto/Medio/Bajo | Alta/Media/Baja | [Acción preventiva] |\n`,
      html: `<section class="section">
  <h2>Riesgos y mitigación</h2>
  <table class="doc-table risk-table">
    <thead><tr><th>Riesgo</th><th>Impacto</th><th>Probabilidad</th><th>Mitigación</th></tr></thead>
    <tbody>
      <tr><td>[Riesgo]</td><td>Alto/Medio/Bajo</td><td>Alta/Media/Baja</td><td>[Acción preventiva]</td></tr>
      <tr><td>[Riesgo]</td><td>Alto/Medio/Bajo</td><td>Alta/Media/Baja</td><td>[Acción preventiva]</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'approvals',
      label: 'Aprobaciones',
      markdown: `\n\n## Aprobaciones\n\n| Rol | Nombre | Responsabilidad |\n|---|---|---|\n| Cliente | [Nombre] | Aprobación funcional |\n| QA | [Nombre] | Pruebas y calidad |\n| Proveedor | [Nombre] | Entrega técnica |\n`,
      html: `<section class="section">
  <h2>Aprobaciones</h2>
  <table class="doc-table approvals-table">
    <thead><tr><th>Rol</th><th>Nombre</th><th>Responsabilidad</th></tr></thead>
    <tbody>
      <tr><td>Cliente</td><td>[Nombre]</td><td>Aprobación funcional</td></tr>
      <tr><td>QA</td><td>[Nombre]</td><td>Pruebas y calidad</td></tr>
      <tr><td>Proveedor</td><td>[Nombre]</td><td>Entrega técnica</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'callout',
      label: 'Nota destacada',
      markdown: `\n\n> **Nota:** [Incluye aquí una advertencia, decisión importante o recomendación.]\n`,
      html: `<aside class="callout">
  <strong>Nota:</strong> [Incluye aquí una advertencia, decisión importante o recomendación.]
</aside>`,
    },
    {
      id: 'signatures',
      label: 'Firmas',
      markdown: `\n\n## Firmas\n\n| Aprobado por | Nombre | Fecha |\n|---|---|---|\n| Cliente | [Nombre] | [Fecha] |\n| Proveedor | [Nombre] | [Fecha] |\n`,
      html: `<section class="section signature-grid">
  <h2>Firmas</h2>
  <div class="signature-card">
    <strong>[Nombre Cliente]</strong>
    <span>Fecha: [Fecha]</span>
  </div>
  <div class="signature-card">
    <strong>[Nombre Proveedor]</strong>
    <span>Fecha: [Fecha]</span>
  </div>
</section>`,
    },
  ];

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
  private readonly destroyRef = inject(DestroyRef);
  readonly pdfService = inject(PdfGenerationService);
  private readonly documentPersistence = inject(DocumentPersistenceService);
  readonly assistantService = inject(AssistantContextService);
  readonly universalDocument = inject(UniversalDocumentService);
  private readonly documentAi = inject(DocumentAiService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly sanitizer = inject(DomSanitizer);

  private formHooksBound = false;

  get editorModeLabel(): string {
    switch (this.contentEditorMode) {
      case 'html':
        return 'Editor HTML';
      case 'plain':
        return 'Editor Texto';
      default:
        return 'Editor Markdown';
    }
  }

  get editorPlaceholder(): string {
    switch (this.contentEditorMode) {
      case 'html':
        return '<h1>Título</h1>\n<p>Escribe HTML libre con estilos inline, tablas, secciones, etc.</p>';
      case 'plain':
        return 'Escribe texto normal. Las líneas en blanco separan párrafos.';
      default:
        return this.getContentPlaceholder();
    }
  }

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
      aiBrief: [''],
      aiInstruction: [''],
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
    const st = this.selectedType;
    return {
      documentTypeId: st?.id ?? '',
      documentTypeLabel: st?.name ?? '',
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
    const brief = this.documentForm.get('aiBrief')?.value?.trim();
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
      this.syncAssistantFromFormNow();
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error ? e.message : 'Error al generar con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  async transformWithAi(): Promise<void> {
    const instruction = this.documentForm.get('aiInstruction')?.value?.trim();
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
      this.syncAssistantFromFormNow();
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error ? e.message : 'Error al reformular con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  async convertMarkdownToVisualHtmlWithAi(): Promise<void> {
    const content = String(this.documentForm.get('content')?.value ?? '').trim();
    if (this.contentEditorMode !== 'markdown') {
      this.aiError = 'Esta acción solo está disponible desde el modo Markdown.';
      return;
    }
    if (!content) {
      this.aiError = 'Primero escribe o genera contenido Markdown en el editor.';
      return;
    }

    this.isAiGenerating = true;
    this.aiError = null;
    try {
      const html = await this.documentAi.convertMarkdownToVisualHtml(
        this.getAiContext(),
      );
      this.customCss = '';
      this.documentForm.patchValue({ content: html });
      this.setContentEditorMode('html');
      this.applyCustomCss();
      this.updatePreview();
      this.syncAssistantFromFormNow();
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error
          ? e.message
          : 'Error al convertir Markdown a HTML visual con IA.';
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
    this.applyCustomCss();
    this.pdfStyles = this.templatesService.getPdfStyles();
    this.bindFormHooksOnce();
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.loadFromRoute();
      });
  }

  private bindFormHooksOnce(): void {
    if (this.formHooksBound) {
      return;
    }
    this.formHooksBound = true;
    this.documentForm.valueChanges
      .pipe(
        debounceTime(200),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((values) => {
        this.applyAssistantSyncFromValues(
          values as Record<string, unknown>,
        );
      });

    this.assistantService.documentCommands$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((command) => this.applyAssistantDocumentCommand(command));

    interval(30_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.autoSaved = true;
        setTimeout(() => {
          this.autoSaved = false;
        }, 2000);
      });
  }

  /** Contexto del asistente a partir de valores de formulario (compartido con el debounce). */
  private applyAssistantSyncFromValues(
    values: Record<string, unknown>,
  ): void {
    this.assistantService.setFormData(values);
    const content = values['content'];
    if (typeof content === 'string') {
      this.assistantService.setDocumentContent(
        content,
        this.selectedType?.id,
      );
    }
    this.assistantService.setFormData({
      ...values,
      customCss: this.customCss,
      contentEditorMode: this.contentEditorMode,
      pdfStyleId: this.selectedPdfStyle,
      quickStylePreset: this.selectedQuickStylePreset,
    });
  }

  private applyAssistantDocumentCommand(command: AssistantDocumentCommand): void {
    const currentContent = String(this.documentForm.get('content')?.value ?? '');
    switch (command.type) {
      case 'append-content': {
        const next = currentContent.trim()
          ? `${currentContent}\n\n${command.value}`
          : command.value;
        this.documentForm.patchValue({ content: next });
        break;
      }
      case 'replace-content':
        this.documentForm.patchValue({ content: command.value });
        break;
      case 'append-css':
        this.customCss = [this.customCss, command.value]
          .filter((part) => part.trim())
          .join('\n\n');
        this.applyCustomCss();
        break;
      case 'replace-css':
        this.customCss = command.value;
        this.applyCustomCss();
        break;
      case 'set-editor-mode':
        this.setContentEditorMode(command.value);
        break;
    }
    this.updatePreview();
    this.syncAssistantFromFormNow();
  }

  /** Tras cargas/importaciones: mismo criterio que valueChanges sin esperar al debounce. */
  private syncAssistantFromFormNow(): void {
    this.applyAssistantSyncFromValues(
      this.documentForm.getRawValue() as Record<string, unknown>,
    );
  }

  private async loadFromRoute(): Promise<void> {
    const documentId =
      this.route.snapshot.paramMap.get('documentId') ??
      this.route.snapshot.queryParamMap.get('draft') ??
      null;
    const typeId = this.route.snapshot.queryParamMap.get('type');
    const templateId = this.route.snapshot.queryParamMap.get('template');
    this.queryTemplateId = templateId;

    if (documentId) {
      await this.documentPersistence.whenReady();
      const payload = await this.documentPersistence.getPayload(documentId);
      if (!payload || typeof payload !== 'object') {
        void this.router.navigate(['/documents/list']);
        return;
      }
      const p = payload as Record<string, unknown>;
      const typeFromDoc = typeof p['type'] === 'string' ? p['type'] : '';
      this.selectedType =
        this.documentTypes.find((t) => t.id === typeFromDoc) ?? null;
      if (!this.selectedType) {
        void this.router.navigate(['/documents/create']);
        return;
      }
      this.setTemplatesForType(this.selectedType);
      this.applyPayloadToForm(documentId, payload);
    } else {
      this.selectedType =
        this.documentTypes.find((t) => t.id === (typeId ?? '')) ?? null;
      if (!this.selectedType) {
        void this.router.navigate(['/documents/create']);
        return;
      }
      this.setTemplatesForType(this.selectedType);
      this.savedDraftId = null;
      if (templateId) {
        const tpl = this.templatesService.getById(templateId);
        if (tpl) {
          this.documentForm.patchValue({ content: tpl.content });
          this.syncAssistantFromFormNow();
        }
      }
    }

    queueMicrotask(() => this.viewportScroller.scrollToPosition([0, 0]));
    this.updatePreview();
  }

  private applyPayloadToForm(draftId: string, payload: unknown): void {
    if (!payload || typeof payload !== 'object') {
      return;
    }
    const p = payload as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    const formKeys = [
      'clientId',
      'date',
      'projectName',
      'totalAmount',
      'description',
      'title',
      'content',
      'executiveSummary',
      'objectives',
      'scope',
      'deliverables',
      'timeline',
      'pricing',
      'terms',
      'systemOverview',
      'architectureDiagram',
      'components',
      'dataFlow',
      'apis',
      'technologies',
      'deployment',
    ] as const;
    for (const k of formKeys) {
      if (p[k] !== undefined) {
        patch[k] = p[k];
      }
    }
    if (!patch['clientId'] && typeof p['client'] === 'string') {
      const cid = this.clients.find((c) => c.name === p['client'])?.id;
      if (cid) {
        patch['clientId'] = cid;
      }
    }
    this.savedDraftId = draftId;
    this.selectedQuickStylePreset = '';
    this.customCss = '';
    const hasPresetInCss =
      typeof p['customCss'] === 'string' &&
      /\/\* document-style-preset:start \*\//.test(p['customCss']);
    if (typeof p['customCss'] === 'string') {
      this.customCss = p['customCss'];
    }
    if (
      typeof p['quickStylePreset'] === 'string' &&
      p['quickStylePreset'] &&
      !hasPresetInCss
    ) {
      this.selectedQuickStylePreset = p['quickStylePreset'];
    }
    if (!hasPresetInCss) {
      this.customCss = this.removeManagedStylePreset(this.customCss);
    }
    if (
      p['contentEditorMode'] === 'markdown' ||
      p['contentEditorMode'] === 'html' ||
      p['contentEditorMode'] === 'plain'
    ) {
      this.contentEditorMode = p['contentEditorMode'];
    }
    if (typeof p['pdfStyleId'] === 'string') {
      this.selectedPdfStyle = p['pdfStyleId'];
    }
    if (
      p['pdfBackgroundMode'] === 'theme' ||
      p['pdfBackgroundMode'] === 'color' ||
      p['pdfBackgroundMode'] === 'corporate'
    ) {
      this.pdfBackgroundMode = p['pdfBackgroundMode'];
    }
    if (typeof p['pdfBackgroundColor'] === 'string') {
      this.pdfBackgroundColor = p['pdfBackgroundColor'];
    }
    if (typeof p['pdfBackgroundImageUrl'] === 'string') {
      this.pdfBackgroundImageUrl = p['pdfBackgroundImageUrl'];
    }
    if (typeof p['documentPaperColor'] === 'string') {
      this.documentPaperColor = p['documentPaperColor'];
    }
    if (typeof p['documentTextColor'] === 'string') {
      this.documentTextColor = p['documentTextColor'];
    }
    if (typeof p['documentMutedColor'] === 'string') {
      this.documentMutedColor = p['documentMutedColor'];
    }
    if (typeof p['documentAccentColor'] === 'string') {
      this.documentAccentColor = p['documentAccentColor'];
    }
    if (typeof p['documentBorderColor'] === 'string') {
      this.documentBorderColor = p['documentBorderColor'];
    }
    if (p['coverConfig'] && typeof p['coverConfig'] === 'object') {
      this.coverConfig = p['coverConfig'] as Partial<CoverConfig>;
    }
    if (p['signatureConfig'] && typeof p['signatureConfig'] === 'object') {
      this.signatureConfig = p['signatureConfig'] as Partial<SignatureConfig>;
    }
    if (p['headerFooterConfig'] && typeof p['headerFooterConfig'] === 'object') {
      this.headerFooterConfig = p['headerFooterConfig'] as Partial<HeaderFooterConfig>;
    }
    this.applyCustomCss();
    this.documentForm.patchValue(patch);
    this.syncAssistantFromFormNow();
  }

  setContentEditorMode(mode: ContentEditorMode): void {
    if (this.contentEditorMode === mode) {
      return;
    }
    this.contentEditorMode = mode;
    this.updatePreview();
    this.syncAssistantFromFormNow();
  }

  updatePreview() {
    const content = this.documentForm.get('content')?.value || '';
    const mdOpts = { gfm: true, breaks: true };
    try {
      if (this.contentEditorMode === 'html') {
        this.previewHtmlMarkup = this.prepareHtmlContentForRendering(content);
        this.htmlPreviewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(
          this.buildHtmlPreviewSrcdoc(this.previewHtmlMarkup),
        );
      } else if (this.contentEditorMode === 'plain') {
        this.htmlPreviewSrcdoc = '';
        this.previewHtmlMarkup = enrichDocumentHtmlForStyling(
          this.plainTextToHtml(content),
        );
      } else {
        this.htmlPreviewSrcdoc = '';
        marked.setOptions?.(mdOpts);
        const parsed = marked.parse(content, mdOpts);
        this.previewHtmlMarkup =
          typeof parsed === 'string' ? parsed : String(parsed);
        this.previewHtmlMarkup = this.applyCorporateCoverVisibility(
          this.previewHtmlMarkup,
        );
        this.previewHtmlMarkup = enrichDocumentHtmlForStyling(
          this.previewHtmlMarkup,
        );
      }
    } catch {
      this.previewHtmlMarkup =
        this.contentEditorMode === 'plain'
          ? enrichDocumentHtmlForStyling(this.plainTextToHtml(content))
          : this.prepareHtmlContentForRendering(content);
      if (this.contentEditorMode === 'html') {
        this.htmlPreviewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(
          this.buildHtmlPreviewSrcdoc(this.previewHtmlMarkup),
        );
      }
    }
    let fullPreviewMarkup = this.previewHtmlMarkup;
    if (this.coverConfig?.enabled) {
      const coverHtml = this.coverEditor
        ? this.coverEditor.exportToHtml()
        : this.exportCoverConfigToHtml(this.coverConfig);
      fullPreviewMarkup = coverHtml + '\n' + fullPreviewMarkup;
    }
    if (this.headerFooterConfig?.enabled) {
      const headerHtml = this.exportHeaderFooterConfigToHtml(this.headerFooterConfig, 'header');
      const footerHtml = this.exportHeaderFooterConfigToHtml(this.headerFooterConfig, 'footer');
      fullPreviewMarkup = headerHtml + '\n' + fullPreviewMarkup + '\n' + footerHtml;
    }
    if (this.signatureConfig?.enabled) {
      const signatureHtml = this.signatureEditor
        ? this.signatureEditor.exportToHtml()
        : this.exportSignatureConfigToHtml(this.signatureConfig);
      fullPreviewMarkup = fullPreviewMarkup + '\n' + signatureHtml;
    }
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(fullPreviewMarkup);

    this.wordCount = content
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    this.characterCount = content.length;
  }

  private plainTextToHtml(content: string): string {
    const paragraphs = content
      .split(/\n{2,}/)
      .map((paragraph: string) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return '';
    }

    return paragraphs
      .map(
        (paragraph: string) =>
          `<p style="white-space: pre-wrap;">${this.escapeHtml(paragraph)}</p>`,
      )
      .join('\n');
  }

  private prepareHtmlContentForRendering(content: string): string {
    return this.stripWrappingHtmlFence(content);
  }

  private selectedPdfStyleRawCss(): string {
    return (
      this.pdfStyles.find((style) => style.id === this.selectedPdfStyle)?.css ??
      ''
    );
  }

  private htmlModeCss(): string {
    const css = [
      this.selectedPdfStyleRawCss(),
      this.stylePresetCss(this.selectedQuickStylePreset),
      this.htmlDocumentColorCss(),
      prioritizeUserCss(this.cleanUserCustomCss()),
    ]
      .filter((part) => part.trim())
      .join('\n\n');
    return this.adaptMarkdownScopedCssForHtml(css);
  }

  private htmlDocumentColorCss(): string {
    const settings = this.documentBackgroundSettings();
    const canvas = settings.pdfBackgroundColor || settings.documentPaperColor;
    const paper = settings.documentPaperColor;
    const text = settings.documentTextColor;
    const muted = settings.documentMutedColor;
    const accent = settings.documentAccentColor;
    const border = settings.documentBorderColor;
    const backgroundCss =
      this.pdfBackgroundMode === 'corporate' && this.pdfBackgroundImageUrl.trim()
        ? `
html {
  background-color: ${canvas} !important;
}
body {
  background-color: ${paper} !important;
  background-image: url("${this.pdfBackgroundImageUrl.trim().replace(/"/g, '%22')}") !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}`
        : `
html {
  background: ${canvas} !important;
}
body {
  background: ${paper} !important;
}`;

    return `
${backgroundCss}

:root {
  --markdown-bg: ${paper} !important;
  --markdown-color: ${text} !important;
  --brand-primary: ${accent} !important;
  --brand-accent: ${accent} !important;
  --markdown-border: ${border} !important;
  --bg: ${paper} !important;
  --text: ${text} !important;
  --text-soft: ${muted} !important;
  --border: ${border} !important;
}

body {
  color: ${text};
}

body *:not([style*='color:']) {
  color: ${text};
}

p:not([style*='color:']),
li:not([style*='color:']),
td:not([style*='color:']) {
  color: ${muted};
}

h1:not([style*='color:']),
h2:not([style*='color:']),
h3:not([style*='color:']),
h4:not([style*='color:']),
h5:not([style*='color:']),
h6:not([style*='color:']),
strong:not([style*='color:']) {
  color: ${text};
}

a:not([style*='color:']) {
  color: ${accent};
}

h1, h2, blockquote, hr, th, td {
  border-color: ${border};
}

h1::before,
h2::before,
h2::after {
  background: ${accent};
}
`;
  }

  private adaptMarkdownScopedCssForHtml(css: string): string {
    return css
      .replace(/\.markdown-preview\s*>\s*/g, '')
      .replace(/\.markdown-preview\s+/g, '')
      .replace(/\.markdown-preview(?=\s*[{,])/g, 'body');
  }

  private wrapLooseHtmlCss(css: string): string {
    const trimmed = css.trim();
    if (!trimmed) return '';
    if (trimmed.includes('{')) return trimmed;
    return `body {\n${trimmed.replace(/[{}]/g, '').trim()}\n}`;
  }

  private buildHtmlPreviewSrcdoc(html: string): string {
    const css = this.wrapLooseHtmlCss(this.htmlModeCss());
    let contentHtml = html;
    if (this.coverConfig?.enabled) {
      const coverHtml = this.coverEditor
        ? this.coverEditor.exportToHtml()
        : this.exportCoverConfigToHtml(this.coverConfig);
      contentHtml = coverHtml + '\n' + contentHtml;
    }
    if (this.headerFooterConfig?.enabled) {
      const headerHtml = this.exportHeaderFooterConfigToHtml(this.headerFooterConfig, 'header');
      const footerHtml = this.exportHeaderFooterConfigToHtml(this.headerFooterConfig, 'footer');
      contentHtml = headerHtml + '\n' + contentHtml + '\n' + footerHtml;
    }
    if (this.signatureConfig?.enabled) {
      const signatureHtml = this.signatureEditor
        ? this.signatureEditor.exportToHtml()
        : this.exportSignatureConfigToHtml(this.signatureConfig);
      contentHtml = contentHtml + '\n' + signatureHtml;
    }

    const styleTag = `<style id="document-generator-custom-css">\n${css}\n</style>`;
    if (/<\/head>/i.test(contentHtml)) {
      return contentHtml.replace(/<\/head>/i, `${styleTag}\n</head>`);
    }
    if (/<html[\s>]/i.test(contentHtml)) {
      return contentHtml.replace(/<html([^>]*)>/i, `<html$1><head>${styleTag}</head>`);
    }
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  ${styleTag}
</head>
<body>
${contentHtml}
</body>
</html>`;
  }

  private exportCoverConfigToHtml(c: Partial<CoverConfig>): string {
    if (!c || !c.enabled) return '';
    const backgroundStyle =
      c.backgroundType === 'gradient'
        ? `background: linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo});`
        : c.backgroundType === 'solid'
          ? `background: ${c.backgroundColor};`
          : c.backgroundImageUrl
            ? `background: url('${c.backgroundImageUrl}') center/cover;`
            : `background: ${c.backgroundColor};`;

    return `
<div class="pdf-cover" style="height: 100vh; ${backgroundStyle} color: ${c.textColor}; display: flex; align-items: center; justify-content: center; padding: 60px;">
  <div style="text-align: ${c.layout === 'left-aligned' ? 'left' : 'center'}; max-width: 600px;">
    ${c.logoUrl ? `<img src="${c.logoUrl}" style="max-width: 120px; margin-bottom: 24px;" alt="Logo"/>` : ''}
    <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 16px; color: ${c.textColor};">${c.title || 'Título'}</h1>
    ${c.subtitle ? `<p style="font-size: 1.1rem; opacity: 0.9; margin: 0 0 24px; color: ${c.textColor};">${c.subtitle}</p>` : ''}
    ${c.showDivider ? `<div style="width: 80px; height: 4px; background: ${c.textColor}; opacity: 0.5; border-radius: 4px; margin: ${c.layout === 'left-aligned' ? '0 0 24px' : '0 auto 24px'};"></div>` : ''}
    <p style="font-size: 0.9rem; opacity: 0.85; color: ${c.textColor};">
      ${[c.showAuthor && c.author ? c.author : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(' · ')}
    </p>
  </div>
</div>`;
  }

  private exportSignatureConfigToHtml(c: Partial<SignatureConfig>): string {
    if (!c || !c.enabled) return '';
    const signatureBlock = `
<div style="text-align: center; ${c.layout === 'horizontal' ? 'flex: 1;' : ''}">
  ${c.signatureImageUrl ? `<img src="${c.signatureImageUrl}" style="max-width: 150px; max-height: 60px; object-fit: contain; margin-bottom: 8px;" alt="Firma"/>` : ''}
  ${c.showLine ? '<div style="border-top: 1px solid #374151; margin: 0 auto 8px; min-width: 180px;"></div>' : ''}
  <div style="font-weight: 600; color: #111827; font-size: 0.95rem;">${c.name || 'Nombre del firmante'}</div>
  ${c.title ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.title}</div>` : ''}
  ${c.company ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.company}</div>` : ''}
  <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 8px;">
    ${[c.showLocation && c.location ? c.location : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(', ')}
  </div>
</div>`;

    if (c.layout === 'horizontal') {
      return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; gap: 40px;">
    ${signatureBlock}
    ${signatureBlock}
  </div>
</div>`;
    }

    if (c.layout === 'vertical') {
      return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
  ${signatureBlock}
</div>`;
    }

    return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    ${signatureBlock}
    <div style="text-align: right; font-size: 0.75rem; color: #9ca3af;">
      ${c.showLocation && c.location ? `<div>${c.location}</div>` : ''}
      ${c.showDate && c.date ? `<div>${c.date}</div>` : ''}
    </div>
  </div>
</div>`;
  }

  private exportHeaderFooterConfigToHtml(
    c: Partial<HeaderFooterConfig>,
    zone: 'header' | 'footer',
  ): string {
    if (!c || !c.enabled) return '';

    const isHeader = zone === 'header';
    const left = isHeader ? (c.headerLeft ?? '') : (c.footerLeft ?? '');
    const center = isHeader ? (c.headerCenter ?? '') : (c.footerCenter ?? '');
    const right = isHeader ? (c.headerRight ?? '') : (c.footerRight ?? '');

    const resolveVars = (text: string): string =>
      text
        .replace(/\{page\}/g, String(c.startPageFrom ?? 1))
        .replace(/\{total\}/g, '?')
        .replace(/\{title\}/g, 'Documento')
        .replace(/\{date\}/g, new Date().toLocaleDateString('es-ES'))
        .replace(/\{author\}/g, '');

    const hasContent = [left, center, right].some((t) => t.trim());
    if (!hasContent) return '';

    const dividerStyle = c.showDivider
      ? isHeader
        ? 'border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; padding-bottom: 6px;'
        : 'border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 6px;'
      : '';

    return `
<div class="pdf-${zone}" style="display:flex; justify-content:space-between; align-items:center; padding: 6px 20px; font-size:${c.fontSize ?? '9pt'}; color:${c.textColor ?? '#64748b'}; background:${c.backgroundColor && c.backgroundColor !== 'transparent' ? c.backgroundColor : 'transparent'}; ${dividerStyle}">
  <span>${resolveVars(left)}</span>
  <span>${resolveVars(center)}</span>
  <span>${resolveVars(right)}</span>
</div>`;
  }

  private stripWrappingHtmlFence(content: string): string {
    const trimmed = content.trim();
    const match = /^```(?:html)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
    return match ? match[1].trim() : content;
  }

  private applyCorporateCoverVisibility(html: string): string {
    if (this.isCorporateCoverEnabled()) {
      return html;
    }

    if (!/class\s*=\s*["'][^"']*\bcover\b/i.test(html)) {
      return html;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('.cover').forEach((cover) => cover.remove());
      return doc.body.innerHTML || html;
    } catch {
      return html.replace(
        /<([a-z][\w:-]*)\b[^>]*class=(["'])[^"']*\bcover\b[^"']*\2[^>]*>[\s\S]*?<\/\1>/gi,
        '',
      );
    }
  }

  private isCorporateCoverEnabled(): boolean {
    return this.selectedQuickStylePreset === 'corporate';
  }

  insertEditorBlockFromSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const templateId = select.value as EditorBlockTemplateId;
    select.value = '';
    if (!templateId) {
      return;
    }

    const template = this.editorBlockTemplates.find(
      (block) => block.id === templateId,
    );
    if (!template) {
      return;
    }

    const snippet =
      this.contentEditorMode === 'html' ? template.html : template.markdown;
    this.insertEditorSnippet(snippet);
  }

  private insertEditorSnippet(snippet: string): void {
    const textarea = document.querySelector(
      'textarea[formControlName="content"]',
    ) as HTMLTextAreaElement;
    const content = String(this.documentForm.get('content')?.value ?? '');

    if (!textarea) {
      const separator = content.trim() ? '\n\n' : '';
      this.documentForm.patchValue({ content: `${content}${separator}${snippet}` });
      this.updatePreview();
      this.syncAssistantFromFormNow();
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const prefix = before && !before.endsWith('\n') ? '\n\n' : '';
    const suffix = after && !snippet.endsWith('\n') ? '\n\n' : '';
    const insert = `${prefix}${snippet}${suffix}`;

    this.documentForm.patchValue({
      content: `${before}${insert}${after}`,
    });
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      const cursor = start + insert.length;
      textarea.selectionStart = cursor;
      textarea.selectionEnd = cursor;
      this.updatePreview();
    }, 0);
  }

  applySelectedTextFormat(): void {
    if (this.contentEditorMode === 'plain') {
      return;
    }

    const textarea = document.querySelector(
      'textarea[formControlName="content"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const content = String(this.documentForm.get('content')?.value ?? '');
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    if (start === end) {
      const range = this.getCurrentMarkdownBlockRange(content, start);
      start = range.start;
      end = range.end;
    }

    const selectedText = content.substring(start, end);
    if (!selectedText.trim()) {
      return;
    }

    const formatted =
      this.contentEditorMode === 'html'
        ? this.formatSelectedTextAsHtml(selectedText, this.selectedTextFormat)
        : this.formatSelectedTextAsMarkdown(selectedText, this.selectedTextFormat);

    this.documentForm.patchValue({
      content: `${content.substring(0, start)}${formatted}${content.substring(end)}`,
    });
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formatted.length;
      this.updatePreview();
    }, 0);
  }

  private formatSelectedTextAsMarkdown(
    text: string,
    format: SelectedTextFormatId,
  ): string {
    const trimmed = text.trim();
    const cleanLines = text
      .split('\n')
      .map((line) => this.stripMarkdownLinePrefix(line));

    switch (format) {
      case 'h1':
        return cleanLines.map((line) => `# ${line.trim()}`).join('\n');
      case 'h2':
        return cleanLines.map((line) => `## ${line.trim()}`).join('\n');
      case 'h3':
        return cleanLines.map((line) => `### ${line.trim()}`).join('\n');
      case 'bold':
        return `**${trimmed}**`;
      case 'italic':
        return `*${trimmed}*`;
      case 'quote':
        return cleanLines.map((line) => `> ${line.trim()}`).join('\n');
      case 'list':
        return cleanLines.map((line) => `- ${line.trim()}`).join('\n');
      case 'numbered-list':
        return cleanLines
          .map((line, index) => `${index + 1}. ${line.trim()}`)
          .join('\n');
      case 'inline-code':
        return text.includes('\n') ? `\`\`\`\n${trimmed}\n\`\`\`` : `\`${trimmed}\``;
      case 'callout':
        return `> **Nota:** ${cleanLines.map((line) => line.trim()).join('\n> ')}`;
      case 'paragraph':
      default:
        return cleanLines.map((line) => line.trim()).join('\n');
    }
  }

  private formatSelectedTextAsHtml(
    text: string,
    format: SelectedTextFormatId,
  ): string {
    const escaped = this.escapeHtml(text.trim());
    const lines = text
      .split('\n')
      .map((line) => this.escapeHtml(line.trim()))
      .filter(Boolean);

    switch (format) {
      case 'h1':
        return `<h1>${escaped}</h1>`;
      case 'h2':
        return `<h2>${escaped}</h2>`;
      case 'h3':
        return `<h3>${escaped}</h3>`;
      case 'bold':
        return `<strong>${escaped}</strong>`;
      case 'italic':
        return `<em>${escaped}</em>`;
      case 'quote':
        return `<blockquote>${escaped}</blockquote>`;
      case 'list':
        return `<ul>\n${lines.map((line) => `  <li>${line}</li>`).join('\n')}\n</ul>`;
      case 'numbered-list':
        return `<ol>\n${lines.map((line) => `  <li>${line}</li>`).join('\n')}\n</ol>`;
      case 'inline-code':
        return text.includes('\n')
          ? `<pre><code>${escaped}</code></pre>`
          : `<code>${escaped}</code>`;
      case 'callout':
        return `<aside class="callout"><strong>Nota:</strong> ${escaped}</aside>`;
      case 'paragraph':
      default:
        return `<p>${escaped}</p>`;
    }
  }

  private stripMarkdownLinePrefix(line: string): string {
    return line
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s{0,3}>\s?/, '')
      .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/, '');
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
    // If the action is a heading (before starts with '#'), apply it per-line
    // and remove any existing leading heading markers to avoid stacking (###).
    if (before.trim().startsWith('#')) {
      const lineStart = content.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      let lineEnd = content.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = content.length;
      const block = content.substring(lineStart, lineEnd);
      const lines = block.split('\n');
      const newLines = lines.map((ln: string) => {
        // remove up to 3 leading spaces and any leading 1-6 #'s plus following space
        return before + ln.replace(/^\s{0,3}#{1,6}\s*/, '');
      });
      const newContent =
        content.substring(0, lineStart) +
        newLines.join('\n') +
        content.substring(lineEnd);
      this.documentForm.patchValue({ content: newContent });

      setTimeout(() => {
        textarea.focus();
        // place cursor at start of first modified line content (after the heading)
        const newSelectionStart = lineStart + before.length;
        textarea.selectionStart = newSelectionStart;
        textarea.selectionEnd = newSelectionStart + (selectedText.length || 0);
        this.updatePreview();
      }, 0);
      this.syncAssistantFromFormNow();
      return;
    }

    // Default behaviour for inline wrappers (bold, italic, link, code...)
    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    this.documentForm.patchValue({ content: newContent });
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
      this.updatePreview();
    }, 0);
  }

  applyTextColor(color?: string): void {
    const textarea = document.querySelector(
      'textarea[formControlName="content"]',
    ) as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    const content = this.documentForm.get('content')?.value || '';

    if (start === end) {
      const range = this.getCurrentMarkdownBlockRange(content, start);
      start = range.start;
      end = range.end;
    }

    const selectedText = content.substring(start, end);

    if (!selectedText.trim()) {
      return;
    }

    const safeColor = this.sanitizeTextColor(color ?? this.selectedTextColor);
    const coloredText =
      this.contentEditorMode === 'html'
        ? this.colorSpan(selectedText, safeColor)
        : this.applyColorToMarkdownSelection(selectedText, safeColor);

    const newContent =
      content.substring(0, start) +
      coloredText +
      content.substring(end);

    this.documentForm.patchValue({ content: newContent });
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + coloredText.length;
      this.updatePreview();
    }, 0);
  }

  private getCurrentMarkdownBlockRange(content: string, cursorPosition: number): { start: number; end: number } {
    let start = content.lastIndexOf('\n\n', Math.max(0, cursorPosition - 1));
    start = start === -1 ? 0 : start + 2;

    let end = content.indexOf('\n\n', cursorPosition);
    end = end === -1 ? content.length : end;

    return { start, end };
  }

  private applyColorToMarkdownSelection(selection: string, color: string): string {
    return selection
      .split(/(\r?\n)/)
      .map((part) => (part.includes('\n') ? part : this.applyColorToMarkdownLine(part, color)))
      .join('');
  }

  private applyColorToMarkdownLine(line: string, color: string): string {
    if (!line.trim() || this.isMarkdownTableSeparator(line)) {
      return line;
    }

    if (line.includes('|')) {
      return line
        .split(/(\|)/)
        .map((part) => (part === '|' ? part : this.colorMarkdownInline(part, color)))
        .join('');
    }

    const headingMatch = /^(\s{0,3}#{1,6}\s+)(.+)$/.exec(line);
    if (headingMatch) {
      return `${headingMatch[1]}${this.colorMarkdownInline(headingMatch[2], color)}`;
    }

    const prefixedLineMatch = /^(\s*(?:>\s*)*(?:(?:[-*+]\s+)|(?:\d+[.)]\s+))?)(.+)$/.exec(line);
    if (prefixedLineMatch) {
      return `${prefixedLineMatch[1]}${this.colorMarkdownInline(prefixedLineMatch[2], color)}`;
    }

    return this.colorMarkdownInline(line, color);
  }

  private colorMarkdownInline(value: string, color: string): string {
    const match = /^(\s*)(.*?)(\s*)$/.exec(value);
    if (!match || !match[2]) {
      return value;
    }

    const [, leading, core, trailing] = match;
    return `${leading}${this.wrapMarkdownInlineCore(core, color)}${trailing}`;
  }

  private wrapMarkdownInlineCore(value: string, color: string): string {
    const wrappers: Array<[RegExp, (match: RegExpExecArray) => string]> = [
      [/^(\*\*|__)(.+)(\1)$/s, (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`],
      [/^(\*|_)(.+)(\1)$/s, (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`],
      [/^(~~)(.+)(~~)$/s, (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`],
      [/^(`+)(.+)(\1)$/s, (match) => `${match[1]}${match[2]}${match[3]}`],
    ];

    for (const [regex, formatter] of wrappers) {
      const match = regex.exec(value);
      if (match) {
        return formatter(match);
      }
    }

    return this.colorSpan(value, color);
  }

  private colorSpan(value: string, color: string): string {
    return `<span style="color: ${color} !important;">${value}</span>`;
  }

  private isMarkdownTableSeparator(line: string): boolean {
    return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  private sanitizeTextColor(color: string): string {
    const trimmed = color.trim();
    if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^rgba?\([^)]+\)$/.test(trimmed)) {
      return trimmed;
    }
    return '#111827';
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
      void this.saveDraft();
    }
    if (event.ctrlKey && event.key === 'p' && this.showSlashCommands) {
      event.preventDefault();
      this.showSlashCommands = false;
    }
  }

  onCoverConfigChanged(config: CoverConfig): void {
    this.coverConfig = config;
    this.updatePreview();
  }

  onSignatureConfigChanged(config: SignatureConfig): void {
    this.signatureConfig = config;
    this.updatePreview();
  }

  onHeaderFooterConfigChanged(config: HeaderFooterConfig): void {
    this.headerFooterConfig = config;
    this.updatePreview();
  }

  hasActiveModal(): boolean {
    return this.showCoverEditor || 
           this.showSignatureEditor || 
           this.showHeaderFooterEditor || 
           this.showTableBuilder || 
           this.showImageInsert;
  }

  closeAllModals(): void {
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
  }

  toggleCoverEditor(): void {
    this.showCoverEditor = !this.showCoverEditor;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
  }

  toggleSignatureEditor(): void {
    this.showSignatureEditor = !this.showSignatureEditor;
    this.showCoverEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
  }

  toggleHeaderFooterEditor(): void {
    this.showHeaderFooterEditor = !this.showHeaderFooterEditor;
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
  }

  toggleTableBuilder(): void {
    this.showTableBuilder = !this.showTableBuilder;
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showImageInsert = false;
  }

  toggleImageInsert(): void {
    this.showImageInsert = !this.showImageInsert;
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
  }

  handleSlashCommand(command: SlashCommand): void {
    this.showSlashCommands = false;
    switch (command.id) {
      case 'heading1':
        this.insertMarkdown('# ', '');
        break;
      case 'heading2':
        this.insertMarkdown('## ', '');
        break;
      case 'heading3':
        this.insertMarkdown('### ', '');
        break;
      case 'bold':
        this.insertMarkdown('**', '**');
        break;
      case 'italic':
        this.insertMarkdown('*', '*');
        break;
      case 'quote':
        this.insertMarkdown('> ', '');
        break;
      case 'divider':
        this.insertMarkdown('\n---\n', '');
        break;
      case 'code':
        this.insertMarkdown('```\n', '\n```');
        break;
      case 'bullet-list':
        this.insertMarkdown('- ', '');
        break;
      case 'numbered-list':
        this.insertMarkdown('1. ', '');
        break;
      case 'checklist':
        this.insertMarkdown('- [ ] ', '');
        break;
      case 'callout':
        this.insertMarkdown('> **Nota:** ', '');
        break;
      case 'callout-info':
        this.insertMarkdown('> ℹ️ **Info:** ', '');
        break;
      case 'callout-warning':
        this.insertMarkdown('> ⚠️ **Advertencia:** ', '');
        break;
      case 'callout-success':
        this.insertMarkdown('> ✅ **Éxito:** ', '');
        break;
      case 'cover':
        this.toggleCoverEditor();
        break;
      case 'signatures':
        this.toggleSignatureEditor();
        break;
      case 'table':
        this.toggleTableBuilder();
        break;
      case 'image':
        this.toggleImageInsert();
        break;
      case 'link':
        this.insertMarkdown('[', '](url)');
        break;
      case 'columns':
        this.insertMarkdown(
          '\n<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">\n\n',
          '\n\n</div>\n'
        );
        break;
    }
  }

  insertCoverIntoDocument(): void {
    if (this.coverEditor) {
      const coverHtml = this.coverEditor.exportToHtml();
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      if (this.contentEditorMode === 'html') {
        this.documentForm.patchValue({ content: currentContent + separator + coverHtml });
      } else {
        const coverMd = this.coverEditor.exportToMarkdown();
        this.documentForm.patchValue({ content: currentContent + separator + coverMd });
      }
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertSignatureIntoDocument(): void {
    if (this.signatureEditor) {
      const signatureHtml = this.signatureEditor.exportToHtml();
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      if (this.contentEditorMode === 'html') {
        this.documentForm.patchValue({ content: currentContent + separator + signatureHtml });
      } else {
        this.documentForm.patchValue({ content: currentContent + separator + '\n\n## Firmas\n\n_Firma electrónica_\n_' });
      }
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertTableFromBuilder(): void {
    if (this.tableBuilder) {
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      let tableContent: string;
      if (this.contentEditorMode === 'html') {
        tableContent = this.tableBuilder.exportToHtml();
      } else {
        tableContent = this.tableBuilder.exportToMarkdown();
      }
      this.documentForm.patchValue({ content: currentContent + separator + tableContent });
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertImageFromUpload(): void {
    if (this.imageInsert) {
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      let imageContent: string;
      if (this.contentEditorMode === 'html') {
        imageContent = this.imageInsert.exportToHtml();
      } else {
        imageContent = this.imageInsert.exportToMarkdown();
      }
      if (imageContent) {
        this.documentForm.patchValue({ content: currentContent + separator + imageContent });
        this.updatePreview();
        this.syncAssistantFromFormNow();
      }
    }
  }

  generateFullDocumentHtml(): string {
    let html = '';
    const formValue = this.documentForm.value;
    const title = formValue.title || 'Documento';

    if (this.coverEditor && this.coverConfig?.enabled) {
      html += this.coverEditor.exportToHtml();
    }

    html += `\n<div class="document-content" style="padding: 2rem; margin-top: 2rem;">\n`;
    html += this.previewHtmlMarkup;
    html += `\n</div>\n`;

    if (this.signatureEditor && this.signatureConfig?.enabled) {
      html += this.signatureEditor.exportToHtml();
    }

    if (this.headerFooterEditor && this.headerFooterConfig?.enabled) {
      html += `\n<!-- Header/Footer config: ${JSON.stringify(this.headerFooterConfig)} -->\n`;
    }

    return html;
  }

  async saveDraft(): Promise<void> {
    if (!this.selectedType || this.isSavingDraft) {
      return;
    }
    this.isSavingDraft = true;
    this.draftSaveMessage = '';
    try {
      await this.documentPersistence.whenReady();
      const formValue = this.documentForm.value;
      const client = this.clients.find((c) => c.id === formValue.clientId);
      const backgroundSettings = this.documentBackgroundSettings();
      const documentCss = this.customCssForDocument();
      const coverConfigData = this.coverEditor?.getConfig();
      const signatureConfigData = this.signatureEditor?.getConfig();
      const headerFooterConfigData = this.headerFooterEditor?.getConfig();
      const documentData = {
        ...formValue,
        client: client?.name || 'Cliente',
        type: this.selectedType.id,
        pdfStyleId: this.selectedPdfStyle,
        quickStylePreset: this.selectedQuickStylePreset,
        contentEditorMode: this.contentEditorMode,
        customCss: documentCss,
        coverConfig: coverConfigData,
        signatureConfig: signatureConfigData,
        headerFooterConfig: headerFooterConfigData,
        ...backgroundSettings,
        isDraft: true,
        pdfBytes: [] as number[],
      };
      const id = this.savedDraftId ?? Date.now().toString();
      await this.documentPersistence.save(id, documentData);
      this.savedDraftId = id;
      this.draftSaveMessage = 'Borrador guardado en este navegador.';
      setTimeout(() => {
        this.draftSaveMessage = '';
      }, 4000);
      void this.router.navigate(['/documents', 'create', 'edit', id], {
        replaceUrl: true,
      });
    } catch (e) {
      console.error('saveDraft', e);
      this.draftSaveMessage =
        'No se pudo guardar el borrador. Comprueba el almacenamiento del navegador.';
    } finally {
      this.isSavingDraft = false;
    }
  }

  loadTemplate(template: DocumentTemplate) {
    this.documentForm.patchValue({ content: template.content });
    this.updatePreview();
    this.syncAssistantFromFormNow();
  }

  insertDefaultCssTemplate() {
    this.customCss = `:root {
	--brand-dark: #5b0000;
	--brand-primary: #7a0000;
	--brand-accent: #ff3131;

	--text: #111827;
	--text-soft: #4b5563;

	--bg: #ffffff;
	--bg-soft: #f8f9fb;

	--border: #e5e7eb;

	--code-bg: #020617;
	--code-text: #f8fafc;
}

body {
	font-family: Inter, Barlow, sans-serif;
	background: var(--bg);
	color: var(--text);
	line-height: 1.75;
	font-size: 16px;

	margin: 0;
	padding: 56px 72px;
}

/* ---------- TITULOS ---------- */

h1 {
	font-size: 3rem;
	font-weight: 800;
	line-height: 1.1;

	color: var(--text);

	margin-top: 2rem;
	margin-bottom: 2.5rem;

	padding-bottom: 1rem;

	border-bottom: 3px solid var(--brand-accent);

	letter-spacing: -1px;
}

h2 {
	font-size: 2rem;
	font-weight: 750;

	color: var(--text);

	margin-top: 3rem;
	margin-bottom: 1.25rem;

	padding-left: 1rem;

	border-left: 5px solid var(--brand-accent);
}

h3 {
	font-size: 1.45rem;
	font-weight: 700;

	color: var(--text);

	margin-top: 2rem;
	margin-bottom: 1rem;
}

/* ---------- TEXTO ---------- */

p {
	color: var(--text-soft);
	margin: 1rem 0;
}

strong {
	color: var(--text);
	font-weight: 700;
}

/* ---------- LINKS ---------- */

a {
	color: var(--brand-primary);
	text-decoration: none;
	font-weight: 600;
}

a:hover {
	color: var(--brand-accent);
}

/* ---------- CODIGO ---------- */

pre {
	background: var(--code-bg);

	color: var(--code-text);

	padding: 18px 22px;

	border-radius: 8px;

	overflow-x: auto;

	margin: 1.75rem 0;

	border-left: 5px solid var(--brand-accent);

	box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

code {
	font-family: 'Fira Code', Consolas, monospace;
	font-size: 0.95em;
}

:not(pre)>code {
	background: #f3f4f6;

	color: #374151;

	padding: 3px 7px;

	border-radius: 5px;
}

/* ---------- TABLAS ---------- */

table {
	width: 100%;
	border-collapse: collapse;

	margin: 2rem 0;

	background: white;
}

th {
	background: var(--brand-primary);

	color: white;

	text-align: left;

	padding: 14px;

	font-size: 0.95rem;

	font-weight: 700;
}

td {
	padding: 14px;

	border-bottom: 1px solid var(--border);

	color: var(--text-soft);
}

tr:nth-child(even) {
	background: #fafafa;
}

/* ---------- BLOCKQUOTE ---------- */

blockquote {
	margin: 2rem 0;

	padding: 1rem 1.5rem;

	background: var(--bg-soft);

	border-left: 5px solid var(--brand-accent);

	border-radius: 6px;

	color: var(--text-soft);
}

/* ---------- LISTAS ---------- */

ul,
ol {
	padding-left: 1.5rem;
	color: var(--text-soft);
}

li {
	margin: 0.5rem 0;
}

/* ---------- IMAGENES ---------- */

img {
	max-width: 100%;

	border-radius: 10px;

	margin: 2rem 0;
}

/* ---------- SEPARADORES ---------- */

hr {
	border: none;

	height: 2px;

	background: var(--border);

	margin: 3rem 0;
}

/* ---------- PORTADA ---------- */

.cover {
	height: 100vh;

	background:
		radial-gradient(
			circle at top right,
			rgba(255,49,49,0.15) 0%,
			transparent 30%
		),
		linear-gradient(
			135deg,
			#420000 0%,
			#5b0000 40%,
			#7a0000 100%
		);

	color: white;

	padding: 80px;

	display: flex;
	flex-direction: column;
	justify-content: center;
}

.cover .eyebrow {
	font-size: 0.9rem;

	letter-spacing: 4px;

	text-transform: uppercase;

	color: rgba(255,255,255,0.7);

	margin-bottom: 3rem;
}

.cover h1 {
	font-size: 4.5rem;

	font-weight: 800;

	line-height: 1;

	color: white;

	border: none;

	padding: 0;

	margin: 0 0 2rem 0;

	max-width: 850px;
}

.cover .accent-line {
	width: 140px;
	height: 6px;

	background: var(--brand-accent);

	border-radius: 999px;

	margin: 2rem 0;
}

.cover .subtitle {
	font-size: 1.3rem;

	line-height: 1.7;

	color: rgba(255,255,255,0.82);

	max-width: 720px;
}

/* ---------- PAGINACION ---------- */

@page {
	margin: 2cm;
}

/* ---------- PAGE BREAKS ---------- */

h1,
h2,
h3 {
	page-break-after: avoid;
}

pre,
table,
blockquote {
	page-break-inside: avoid;
}`;
    this.applyCustomCss();
  }

  insertCode() {
    this.insertMarkdown('`', '`');
  }

  insertCodeBlock() {
    this.insertMarkdown('```\n', '\n```');
  }

  toggleFullscreen() {
    this.fullscreenMode = !this.fullscreenMode;
    if (this.fullscreenMode) {
      this.fullscreenTab = 'editor';
    }
  }
 
  applyCustomCss(): void {
    const styleEl = document.getElementById('custom-editor-css') || this.createCustomStyleEl();
    styleEl.textContent = this.documentPreviewCss();
  }

  private pdfExportCustomCss(): string {
    return resolvePdfGenerationCss(this.customCssForDocument(), this.documentBackgroundSettings());
  }

  private documentBackgroundSettings() {
    if (this.pdfBackgroundMode === 'theme') {
      return {
        pdfBackgroundMode: this.pdfBackgroundMode,
        pdfBackgroundColor: this.readThemeCssColor('--bg-primary', '#f8fafc'),
        pdfBackgroundImageUrl: this.pdfBackgroundImageUrl,
        documentPaperColor: this.readThemeCssColor('--surface', '#ffffff'),
        documentTextColor: this.readThemeCssColor('--text-primary', '#1f2937'),
        documentMutedColor: this.readThemeCssColor('--text-secondary', '#475569'),
        documentAccentColor: this.readThemeCssColor('--brand', '#2563eb'),
        documentBorderColor: this.readThemeCssColor('--border-soft', '#e2e8f0'),
      };
    }

    return {
      pdfBackgroundMode: this.pdfBackgroundMode,
      pdfBackgroundColor: this.pdfBackgroundColor,
      pdfBackgroundImageUrl: this.pdfBackgroundImageUrl,
      documentPaperColor: this.documentPaperColor,
      documentTextColor: this.documentTextColor,
      documentMutedColor: this.documentMutedColor,
      documentAccentColor: this.documentAccentColor,
      documentBorderColor: this.documentBorderColor,
    };
  }

  private readThemeCssColor(variableName: string, fallback: string): string {
    if (typeof window === 'undefined') {
      return fallback;
    }
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
    return value || fallback;
  }

  private cleanUserCustomCss(): string {
    const cleaned = this.removeManagedStylePreset(this.customCss);
    if (cleaned !== this.customCss) {
      this.customCss = cleaned;
    }
    return cleaned;
  }

  private customCssForDocument(): string {
    // Quick preset first (lower priority), then user CSS last (higher priority).
    return [
      this.stylePresetCss(this.selectedQuickStylePreset),
      prioritizeUserCss(normalizeUserCss(this.cleanUserCustomCss())),
    ]
      .filter((part) => part.trim())
      .join('\n\n');
  }

  private selectedPdfStylePreviewCss(): string {
    const css =
      this.pdfStyles.find((style) => style.id === this.selectedPdfStyle)?.css ??
      '';
    return css ? scopeCssToMarkdownPreview(css) : '';
  }

  private documentPreviewCss(): string {
    const background = this.documentBackgroundSettings();
    // Cascade (lowest → highest priority):
    //   defaults → PDF style template → quick style preset → document colors → user/AI CSS.
    // Custom CSS is last so examples like `h1 { color: ... }` always work.
    return [
      buildDocumentPreviewCss(''),
      this.selectedPdfStylePreviewCss(),
      normalizeUserCss(this.stylePresetCss(this.selectedQuickStylePreset)),
      buildPreviewBackgroundOverrideCss(background),
      prioritizeUserCss(normalizeUserCss(this.cleanUserCustomCss())),
    ].filter(Boolean).join('\n\n');
  }

  onPdfBackgroundChange(): void {
    this.applyCustomCss();
  }

  get previewPaneStyle(): Record<string, string> {
    return buildPreviewPaneStyle(this.documentBackgroundSettings());
  }

  /** Base font size used for quick adjustments (in rem). */
  baseFontSize = 1.05;

  /** Ensure a CSS :root variable is present or updated in customCss. */
  upsertRootVariable(varName: string, value: string): void {
    try {
      const raw = this.customCss || '';
      const rootRe = /:root\s*\{([\s\S]*?)\}/m;
      const match = rootRe.exec(raw);
      if (match) {
        let body = match[1];
        const varRe = new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*[^;]+;');
        if (varRe.test(body)) {
          body = body.replace(varRe, `${varName}: ${value};`);
        } else {
          body = `${body.trim()}\n  ${varName}: ${value};\n`;
        }
        const newRoot = `:root {\n${body}\n}`;
        this.customCss = raw.replace(rootRe, newRoot);
      } else {
        // Prepend a :root block
        this.customCss = `:root {\n  ${varName}: ${value};\n}\n\n${raw}`;
      }
      this.applyCustomCss();
    } catch (e) {
      console.warn('upsertRootVariable failed', e);
    }
  }

  applyStylePreset(preset: string | null | undefined): void {
    this.customCss = this.removeManagedStylePreset(this.customCss);
    this.selectedQuickStylePreset =
      !preset || preset === 'default' ? '' : preset;
    this.applyCustomCss();
  }

  private removeManagedStylePreset(css: string): string {
    return (css || '')
      .replace(
        /\/\* document-style-preset:start \*\/[\s\S]*?\/\* document-style-preset:end \*\//m,
        '',
      )
      .trim();
  }

  private stylePresetCss(preset: string): string {
    const presets: Record<string, string> = {
      corporate: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 1.05rem;
  --markdown-line-height: 1.72;
  --markdown-color: #1f2937;
  --brand-primary: #7a0000;
  --brand-accent: #ff3131;
}

h1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 850;
  color: #111827;
  border-bottom: 2px solid rgba(122, 0, 0, 0.22);
  padding-bottom: 0.75rem;
}

h1::before {
  background: linear-gradient(90deg, #7a0000, #ff3131);
}

h2 {
  font-size: clamp(1.55rem, 2.5vw, 2rem);
  font-weight: 800;
  color: #1f2937;
  border-left: 5px solid #ff3131;
  padding-left: 0.85rem;
}

h3 {
  color: #374151;
  font-weight: 750;
}

table {
  border-radius: 12px;
  overflow: hidden;
}

th {
  background: #7a0000;
  color: #ffffff;
}

blockquote {
  background: #fff1f1;
  border-left-color: #ff3131;
  color: #5b0000;
}
/* document-style-preset:end */`,
      compact: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 0.92rem;
  --markdown-line-height: 1.48;
  --markdown-color: #1f2937;
}

h1 {
  font-size: 1.8rem;
  margin: 1rem 0 0.6rem;
}

h2 {
  font-size: 1.35rem;
  margin: 0.85rem 0 0.45rem;
}

h3 {
  font-size: 1.1rem;
  margin: 0.7rem 0 0.35rem;
}

p,
ul,
ol,
table {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

th,
td {
  padding: 0.4rem 0.55rem;
}
/* document-style-preset:end */`,
      large: `
/* document-style-preset:start */
:root {
  --markdown-font-size: 1.22rem;
  --markdown-line-height: 1.86;
  --markdown-color: #111827;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 3.35rem);
}

h2 {
  font-size: clamp(1.85rem, 3vw, 2.35rem);
}

h3 {
  font-size: 1.55rem;
}

th,
td {
  padding: 0.8rem 1rem;
}
/* document-style-preset:end */`,
    };

    return presets[preset] ?? '';
  }

  adjustBaseFontSize(deltaRem: number): void {
    try {
      // look for existing --markdown-font-size in customCss
      const raw = this.customCss || '';
      const rootRe = /:root\s*\{([\s\S]*?)\}/m;
      const match = rootRe.exec(raw);
      let current = this.baseFontSize;
      if (match) {
        const body = match[1];
        const varMatch = /--markdown-font-size\s*:\s*([0-9.]+)rem\s*;/.exec(body);
        if (varMatch) {
          current = Number.parseFloat(varMatch[1]);
        }
      }
      const next = Math.max(0.6, Math.min(3, +(current + deltaRem).toFixed(2)));
      this.baseFontSize = next;
      this.upsertRootVariable('--markdown-font-size', `${next}rem`);
      this.applyCustomCss();
    } catch (e) {
      console.warn('adjustBaseFontSize failed', e);
    }
  }

  private exportStyledHtml(title: string): void {
    const safeTitle = this.escapeHtml(title || 'Documento');
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 48px 24px;
      background: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .markdown-preview {
      max-width: 920px;
      margin: 0 auto;
      padding: 48px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
    }
    ${this.documentPreviewCss()}
  </style>
</head>
<body>
  <main class="markdown-preview">
    ${this.previewHtmlMarkup}
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    this.universalDocument.download(blob, `${title || 'documento'}.html`);
  }

  private getRenderableContentForPdf(content: string): string {
    if (this.contentEditorMode === 'html') {
      return this.prepareHtmlContentForRendering(content);
    }
    if (this.contentEditorMode === 'plain') {
      return this.applyCorporateCoverVisibility(this.plainTextToHtml(content));
    }
    return this.applyCorporateCoverVisibility(content);
  }

  private getPlainContentForExport(content: string): string {
    if (this.contentEditorMode !== 'html') {
      return content;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return (doc.body.textContent || content).trim();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
 
  private createCustomStyleEl(): HTMLStyleElement {
    const el = document.createElement('style');
    el.id = 'custom-editor-css';
    el.setAttribute('data-custom-css', 'true');
    document.head.appendChild(el);
    return el;
  }

  async exportDocument(format: string) {
    const content = this.documentForm.get('content')?.value || '';
    const renderableContent = this.getRenderableContentForPdf(content);
    const title = this.documentForm.get('title')?.value || 'documento';
    const formValue = this.documentForm.value;
    const client = this.clients.find((c) => c.id === formValue.clientId);

    if (format === 'pdf') {
      try {
        const backgroundSettings = this.documentBackgroundSettings();
        const dateStr = formValue.date
          ? String(formValue.date)
          : new Date().toISOString().split('T')[0];
        const pdfBlob = await this.pdfService.generateMarkdownPdf({
          content: renderableContent,
          title: title,
          date: dateStr,
          client: client?.name || 'Josanz ERP',
          subtitle: client?.name || 'Josanz ERP',
          pdfStyleId: this.selectedPdfStyle,
          contentEditorMode: this.contentEditorMode,
          quickStylePreset: this.selectedQuickStylePreset,
          customCss: this.pdfExportCustomCss(),
          ...backgroundSettings,
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

    if (format === 'html') {
      this.exportStyledHtml(title);
      return;
    }

    const exportContent =
      format === 'markdown'
        ? content
        : this.getPlainContentForExport(content);
    const blocks = exportContent.split('\n\n').map((text: string) => ({
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
      txt: DocumentFormat.PLAINTEXT,
    };

    try {
      const blob = await this.universalDocument.export(blocks, {
        format: formatMap[format],
      });
      this.universalDocument.download(blob, `${title}.${format}`);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(
        `No se pudo exportar a ${format.toUpperCase()}. Revisa el contenido e inténtalo de nuevo.`,
      );
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
      this.contentEditorMode = this.inferEditorModeFromFile(file.name);
      this.documentForm.get('content')?.setValue(content);
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }

    if (result.warnings.length > 0 && isDevMode()) {
      console.warn('importDocument:', result.warnings);
    }

    this.fileInput.nativeElement.value = '';
  }

  private inferEditorModeFromFile(fileName: string): ContentEditorMode {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'html' || extension === 'htm') {
      return 'html';
    }
    if (extension === 'txt') {
      return 'plain';
    }
    return 'markdown';
  }

  async generateDocument() {
    if (this.documentForm.valid) {
      this.documentGenerateError = '';
      this.isGenerating = true;
      try {
        const formValue = this.documentForm.value;
        const client = this.clients.find((c) => c.id === formValue.clientId);
        const renderableContent = this.getRenderableContentForPdf(
          String(formValue.content ?? ''),
        );
        const backgroundSettings = this.documentBackgroundSettings();

        const documentData = {
          ...formValue,
          content: renderableContent,
          client: client?.name || 'Cliente',
          type: this.selectedType?.id,
          pdfStyleId: this.selectedPdfStyle,
          contentEditorMode: this.contentEditorMode,
          customCss: this.pdfExportCustomCss(),
          quickStylePreset: this.selectedQuickStylePreset,
          ...backgroundSettings,
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
        await this.documentPersistence.whenReady();
        await this.documentPersistence.save(documentId, {
          ...documentData,
          isDraft: false,
          pdfBytes: Array.from(pdfArray),
        });

        this.router.navigate(['/documents/preview', documentId]);
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.documentGenerateError =
          'No se pudo generar el documento. Revisa los datos e inténtalo de nuevo.';
      } finally {
        this.isGenerating = false;
      }
    }
  }
}
