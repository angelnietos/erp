import {
  Component,
  DestroyRef,
  HostListener,
  ViewEncapsulation,
  inject,
  isDevMode,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, interval } from 'rxjs';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DocumentRenderService } from '../services/document-render.service';
import { DocumentExportOrchestratorService } from '../services/document-export-orchestrator.service';
import { DocumentEditorHistory } from '../services/document-editor-history.service';
import { DocxExportService } from '../services/docx-export.service';
import { DocumentPersistenceService } from '../services/document-persistence.service';
import {
  AssistantContextService,
  AssistantDocumentCommand,
} from '../services/assistant-context.service';
import {
  UniversalDocumentService,
  DocumentFormat,
} from '../services/universal-document.service';
import type { EditorSurface } from './document-editor-canvas.component';
import {
  TemplatesRegistryService,
  DocumentTemplate,
  PdfStyle,
} from '../services/templates-registry.service';
import {
  DocumentAiService,
  DocumentAiContext,
} from '../services/document-ai.service';
import { parseMarkdownToHtml } from '../utils/markdown-parse.util';
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
import {
  exportCoverConfigToHtml,
  PDF_COVER_SHARED_CSS,
  exportWatermarkConfigToHtml,
} from '../utils/document-export-html';
import {
  CoverEditorComponent,
  type CoverConfig,
} from './cover-editor.component';
import {
  SignatureEditorComponent,
  type SignatureConfig,
} from './signature-editor.component';
import {
  HeaderFooterEditorComponent,
  type HeaderFooterConfig,
} from './header-footer-editor.component';
import {
  WatermarkDialogComponent,
  type WatermarkConfig,
} from './watermark-dialog.component';
import { TableBuilderComponent } from './table-builder.component';
import { ImageInsertComponent } from './image-insert.component';
import {
  SlashCommandsComponent,
  type SlashCommand,
} from './slash-commands.component';
import { DocumentEditorToolbarComponent } from './document-editor-toolbar.component';
import { DocumentEditorCanvasComponent } from './document-editor-canvas.component';
import { DocumentLivePreviewComponent } from './document-live-preview.component';
import { DocumentExportActionsComponent } from './document-export-actions.component';
import { DocumentToolsModalComponent } from './document-tools-modal.component';
import {
  removeManagedStylePreset,
  stylePresetCss,
} from '../utils/document-style-presets';
import type {
  ContentEditorMode,
  DocumentRenderInput,
  DocumentType,
  EditorBlockTemplate,
  EditorBlockTemplateId,
} from '../models/document-render.models';

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

type PdfPreviewSource = 'current' | 'markdown' | 'html';

interface SelectedTextFormat {
  id: SelectedTextFormatId;
  label: string;
}

@Component({
  selector: 'app-document-create-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DocumentEditorToolbarComponent,
    DocumentEditorCanvasComponent,
    DocumentLivePreviewComponent,
    DocumentExportActionsComponent,
    DocumentToolsModalComponent,
    SlashCommandsComponent,
  ],
  templateUrl: './document-create-editor.component.html',
  styleUrl: './document-create-editor.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DocumentCreateEditorComponent implements OnInit, OnDestroy {
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
  private lastHtmlEditorContent: string | null = null;
  private previewRenderCounter = 1;
  get previewRenderKey(): number {
    return this.previewRenderCounter;
  }
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
  contentEditorMode: ContentEditorMode = 'markdown';
  editorSurface: EditorSurface = 'legacy';
  importFeedback = '';
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
  showWatermarkEditor = false;
  showSlashCommands = false;
  slashMenuPosition = { x: 0, y: 0 };
  activeSidebarTab: 'styles' | 'blocks' | 'advanced' = 'blocks';
  private readonly editorHistory = new DocumentEditorHistory();
  private historySuspended = false;
  historyCanUndo = false;
  historyCanRedo = false;

  coverPanelEnabled = false;
  signaturePanelEnabled = false;
  headerFooterPanelEnabled = false;
  watermarkPanelEnabled = false;
  coverConfig: Partial<CoverConfig> = { enabled: false };
  signatureConfig: Partial<SignatureConfig> = { enabled: false };
  headerFooterConfig: Partial<HeaderFooterConfig> = { enabled: false };
  watermarkConfig: Partial<WatermarkConfig> = { enabled: false };

  @ViewChild(CoverEditorComponent) coverEditor?: CoverEditorComponent;
  @ViewChild(SignatureEditorComponent)
  signatureEditor?: SignatureEditorComponent;
  @ViewChild(HeaderFooterEditorComponent)
  headerFooterEditor?: HeaderFooterEditorComponent;
  @ViewChild(TableBuilderComponent) tableBuilder?: TableBuilderComponent;
  @ViewChild(ImageInsertComponent) imageInsert?: ImageInsertComponent;
  @ViewChild(WatermarkDialogComponent)
  watermarkEditor?: WatermarkDialogComponent;
  @ViewChild(DocumentToolsModalComponent)
  toolsModal?: DocumentToolsModalComponent;
  @ViewChild(SlashCommandsComponent) slashCommands?: SlashCommandsComponent;
  @ViewChild(DocumentEditorCanvasComponent)
  editorCanvas?: DocumentEditorCanvasComponent;
  readonly selectedTextFormats: SelectedTextFormat[] = [
    { id: 'paragraph', label: 'P�rrafo normal' },
    { id: 'h1', label: 'T�tulo H1' },
    { id: 'h2', label: 'T�tulo H2' },
    { id: 'h3', label: 'T�tulo H3' },
    { id: 'bold', label: 'Negrita' },
    { id: 'italic', label: 'Cursiva' },
    { id: 'quote', label: 'Cita' },
    { id: 'list', label: 'Lista' },
    { id: 'numbered-list', label: 'Lista numerada' },
    { id: 'inline-code', label: 'C�digo' },
    { id: 'callout', label: 'Nota destacada' },
  ];
  readonly editorBlockTemplates: EditorBlockTemplate[] = [
    {
      id: 'paragraph',
      label: 'P�rrafo',
      markdown: `\n\n[Escribe aqu� un p�rrafo descriptivo con el contexto, objetivo o explicaci�n principal.]\n`,
      html: `<p>[Escribe aqu� un p�rrafo descriptivo con el contexto, objetivo o explicaci�n principal.]</p>`,
    },
    {
      id: 'section',
      label: 'Secci�n completa',
      markdown: `\n\n## [T�tulo de la secci�n]\n\n**Objetivo:** [Describe el objetivo]\n\n**Detalle:** [Explica los puntos principales]\n\n**Resultado esperado:** [Indica el resultado]\n`,
      html: `<section class="section card">
  <h2>[T�tulo de la secci�n]</h2>
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
      markdown: `\n\n## Cronograma e hitos\n\n| Hito | Descripci�n | Fecha estimada | Dependencias |\n|---|---|---|---|\n| Hito 1 | Inicio del proyecto | [Fecha] | - |\n| Hito 2 | Dise�o aprobado | [Fecha] | Hito 1 |\n| Hito 3 | Entrega final | [Fecha] | Hito 2 |\n`,
      html: `<section class="section">
  <h2>Cronograma e hitos</h2>
  <table class="doc-table timeline-table">
    <thead><tr><th>Hito</th><th>Descripci�n</th><th>Fecha estimada</th><th>Dependencias</th></tr></thead>
    <tbody>
      <tr><td>Hito 1</td><td>Inicio del proyecto</td><td>[Fecha]</td><td>-</td></tr>
      <tr><td>Hito 2</td><td>Dise�o aprobado</td><td>[Fecha]</td><td>Hito 1</td></tr>
      <tr><td>Hito 3</td><td>Entrega final</td><td>[Fecha]</td><td>Hito 2</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'budget',
      label: 'Presupuesto',
      markdown: `\n\n## Presupuesto estimado\n\n| Concepto | Horas | Coste unitario | Importe |\n|---|---:|---:|---:|\n| An�lisis y dise�o | [h] | [EUR/h] | [EUR] |\n| Desarrollo | [h] | [EUR/h] | [EUR] |\n| Pruebas | [h] | [EUR/h] | [EUR] |\n| **Total** |  |  | **[EUR]** |\n`,
      html: `<section class="section">
  <h2>Presupuesto estimado</h2>
  <table class="doc-table budget-table">
    <thead><tr><th>Concepto</th><th>Horas</th><th>Coste unitario</th><th>Importe</th></tr></thead>
    <tbody>
      <tr><td>An�lisis y dise�o</td><td>[h]</td><td>[EUR/h]</td><td>[EUR]</td></tr>
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
      markdown: `\n\n## Riesgos y mitigaci�n\n\n| Riesgo | Impacto | Probabilidad | Mitigaci�n |\n|---|---|---|---|\n| [Riesgo] | Alto/Medio/Bajo | Alta/Media/Baja | [Acci�n preventiva] |\n| [Riesgo] | Alto/Medio/Bajo | Alta/Media/Baja | [Acci�n preventiva] |\n`,
      html: `<section class="section">
  <h2>Riesgos y mitigaci�n</h2>
  <table class="doc-table risk-table">
    <thead><tr><th>Riesgo</th><th>Impacto</th><th>Probabilidad</th><th>Mitigaci�n</th></tr></thead>
    <tbody>
      <tr><td>[Riesgo]</td><td>Alto/Medio/Bajo</td><td>Alta/Media/Baja</td><td>[Acci�n preventiva]</td></tr>
      <tr><td>[Riesgo]</td><td>Alto/Medio/Bajo</td><td>Alta/Media/Baja</td><td>[Acci�n preventiva]</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'approvals',
      label: 'Aprobaciones',
      markdown: `\n\n## Aprobaciones\n\n| Rol | Nombre | Responsabilidad |\n|---|---|---|\n| Cliente | [Nombre] | Aprobaci�n funcional |\n| QA | [Nombre] | Pruebas y calidad |\n| Proveedor | [Nombre] | Entrega t�cnica |\n`,
      html: `<section class="section">
  <h2>Aprobaciones</h2>
  <table class="doc-table approvals-table">
    <thead><tr><th>Rol</th><th>Nombre</th><th>Responsabilidad</th></tr></thead>
    <tbody>
      <tr><td>Cliente</td><td>[Nombre]</td><td>Aprobaci�n funcional</td></tr>
      <tr><td>QA</td><td>[Nombre]</td><td>Pruebas y calidad</td></tr>
      <tr><td>Proveedor</td><td>[Nombre]</td><td>Entrega t�cnica</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'callout',
      label: 'Nota destacada',
      markdown: `\n\n> **Nota:** [Incluye aqu� una advertencia, decisi�n importante o recomendaci�n.]\n`,
      html: `<aside class="callout">
  <strong>Nota:</strong> [Incluye aqu� una advertencia, decisi�n importante o recomendaci�n.]
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
      name: 'Documentaci�n T�cnica',
      description: 'Crear documentos t�cnicos o informativos',
    },
    {
      id: 'architecture',
      name: 'Documentaci�n Arquitect�nica',
      description: 'Documentos de arquitectura de sistemas con diagramas',
    },
    {
      id: 'resume',
      name: 'Curr�culum Vitae',
      description: 'Plantillas estandarizadas de CV para candidatos',
    },
    {
      id: 'interview',
      name: 'Pruebas T�cnicas Entrevista',
      description: 'Evaluaciones y scorecards estandarizados',
    },
    {
      id: 'offer',
      name: 'Cartas de Oferta',
      description: 'Cartas oficiales de contrataci�n estandarizadas',
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
  private readonly exportOrchestrator = inject(DocumentExportOrchestratorService);
  private readonly documentRender = inject(DocumentRenderService);
  private readonly documentPersistence = inject(DocumentPersistenceService);
  readonly assistantService = inject(AssistantContextService);
  readonly universalDocument = inject(UniversalDocumentService);
  private readonly docxExport = inject(DocxExportService);
  private readonly documentAi = inject(DocumentAiService);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdRef = inject(ChangeDetectorRef);

  private formHooksBound = false;

  get editorModeLabel(): string {
    if (this.editorSurface === 'blocks') {
      return 'Editor visual (TipTap)';
    }
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
        return '<h1>T�tulo</h1>\n<p>Escribe HTML libre con estilos inline, tablas, secciones, etc.</p>';
      case 'plain':
        return 'Escribe texto normal. Las l�neas en blanco separan p�rrafos.';
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

  /** Lista de plantillas seg�n categor�a del tipo de documento (para cambiar plantilla en el editor). */
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
    console.log('copyMarkdownToClipboard called');
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
      this.aiError = 'Describe qu� debe contener el documento.';
      return;
    }
    this.isAiGenerating = true;
    this.aiError = null;
    try {
      const ctx = this.getAiContext();
      const md = await this.documentAi.generateDraft(brief, ctx);
      const current = this.documentForm.get('content')?.value || '';
      const next =
        mode === 'append' ? (current ? `${current}\n\n---\n\n${md}` : md) : md;
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
        'Escribe una instrucci�n (por ejemplo: m�s formal, acortar, a�adir tabla de costes).';
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
    console.log(
      'convertMarkdownToVisualHtmlWithAi called',
      this.contentEditorMode,
    );
    const content = String(
      this.documentForm.get('content')?.value ?? '',
    ).trim();
    if (this.contentEditorMode !== 'markdown') {
      this.aiError = 'Esta acci�n solo est� disponible desde el modo Markdown.';
      return;
    }
    if (!content) {
      this.aiError =
        'Primero escribe o genera contenido Markdown en el editor.';
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
      await this.setContentEditorMode('html');
      this.applyCustomCss();
      this.updatePreview();
      this.syncAssistantFromFormNow();
      // Force DOM update for iframe srcdoc
      setTimeout(() => this.cdRef.detectChanges());
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error
          ? e.message
          : 'Error al convertir Markdown a HTML visual con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  async convertHtmlToMarkdownWithAi(): Promise<void> {
    console.log('convertHtmlToMarkdownWithAi called', this.contentEditorMode);
    const content = String(
      this.documentForm.get('content')?.value ?? '',
    ).trim();
    if (this.contentEditorMode !== 'html') {
      this.aiError = 'Esta acci�n solo est� disponible desde el modo HTML.';
      return;
    }
    if (!content) {
      this.aiError = 'Primero escribe o genera contenido HTML en el editor.';
      return;
    }

    this.isAiGenerating = true;
    this.aiError = null;
    try {
      const markdown = await this.documentAi.convertHtmlToMarkdown(
        this.getAiContext(),
      );
      this.customCss = '';
      this.documentForm.patchValue({ content: markdown });
      await this.setContentEditorMode('markdown');
      this.applyCustomCss();
      this.updatePreview();
      this.syncAssistantFromFormNow();
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error
          ? e.message
          : 'Error al convertir HTML a Markdown con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

  async beautifyDocumentWithAi(): Promise<void> {
    console.log('beautifyDocumentWithAi called', this.contentEditorMode);
    const content = String(
      this.documentForm.get('content')?.value ?? '',
    ).trim();
    if (!content) {
      this.aiError = 'Primero escribe o genera contenido en el editor.';
      return;
    }

    this.isAiGenerating = true;
    this.aiError = null;
    try {
      let beautified: string;

      if (this.contentEditorMode === 'markdown') {
        beautified = await this.documentAi.beautifyMarkdown(
          this.getAiContext(),
        );
      } else if (this.contentEditorMode === 'html') {
        beautified = await this.documentAi.beautifyHtml(this.getAiContext());
        beautified = enrichDocumentHtmlForStyling(beautified);
      } else {
        this.aiError = 'Mode no compatible para embellecer.';
        return;
      }

this.documentForm.patchValue({ content: beautified });
       this.updatePreview();
       this.syncAssistantFromFormNow();
     } catch (e: unknown) {
       this.aiError =
         e instanceof Error
           ? e.message
           : 'Error al embellecer el documento con IA.';
     } finally {
       this.isAiGenerating = false;
     }
   }

   async technicalImproveDocumentWithAi(): Promise<void> {
    console.log('technicalImproveDocumentWithAi called', this.contentEditorMode);
    const content = String(
      this.documentForm.get('content')?.value ?? '',
    ).trim();
    if (!content) {
      this.aiError = 'Primero escribe o genera contenido en el editor.';
      return;
    }

    this.isAiGenerating = true;
    this.aiError = null;
    try {
      let improved: string;

      if (this.contentEditorMode === 'markdown') {
        improved = await this.documentAi.technicalImproveMarkdown(
          this.getAiContext(),
        );
      } else if (this.contentEditorMode === 'html') {
        improved = await this.documentAi.technicalImproveHtml(this.getAiContext());
        improved = enrichDocumentHtmlForStyling(improved);
      } else {
        this.aiError = 'Modo no compatible para mejorar estructura técnica.';
        return;
      }

      this.documentForm.patchValue({ content: improved });
      this.updatePreview();
      this.syncAssistantFromFormNow();
    } catch (e: unknown) {
      this.aiError =
        e instanceof Error
          ? e.message
          : 'Error al mejorar la estructura técnica del documento con IA.';
    } finally {
      this.isAiGenerating = false;
    }
  }

   getTitlePlaceholder(): string {
    switch (this.selectedType?.id) {
      case 'quote':
        return 'Ej: Presupuesto Desarrollo Web Corporativo';
      case 'proposal':
        return 'Ej: Propuesta de Implementaci�n ERP';
      case 'documentation':
        return 'Ej: Manual de Usuario - Sistema ERP';
      case 'architecture':
        return 'Ej: Arquitectura del Sistema ERP';
      case 'resume':
        return 'Ej: Curr�culum - Juan Garc�a L�pez';
      case 'interview':
        return 'Ej: Evaluaci�n T�cnica - Candidato Senior Developer';
      case 'offer':
        return 'Ej: Carta Oferta - Puesto Senior Full Stack';
      default:
        return 'T�tulo del documento';
    }
  }

  getContentPlaceholder(): string {
    switch (this.selectedType?.id) {
      case 'quote':
        return 'Descripci�n detallada del presupuesto, alcance de trabajo, condiciones...';
      case 'proposal':
        return 'Contenido de la propuesta comercial, beneficios, soluci�n propuesta...';
      case 'documentation':
        return 'Contenido detallado de la documentaci�n t�cnica...';
      case 'architecture':
        return 'Descripci�n de la arquitectura del sistema, componentes, tecnolog�as...';
      case 'resume':
        return 'Datos personales, experiencia laboral, formaci�n y habilidades del candidato';
      case 'interview':
        return 'Evaluaci�n t�cnica, preguntas, ejercicios y scorecard estandarizado';
      case 'offer':
        return 'Condiciones contractuales, salario, beneficios y fecha de incorporaci�n';
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
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.applyAssistantSyncFromValues(values as Record<string, unknown>);
      });

    this.documentForm.get('content')?.valueChanges
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((content) => {
        if (typeof content === 'string' && !this.historySuspended) {
          this.editorHistory.push(content);
          this.refreshHistoryFlags();
        }
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
  private applyAssistantSyncFromValues(values: Record<string, unknown>): void {
    this.assistantService.setFormData(values);
    const content = values['content'];
    if (typeof content === 'string') {
      this.assistantService.setDocumentContent(content, this.selectedType?.id);
    }
    this.assistantService.setFormData({
      ...values,
      customCss: this.customCss,
      contentEditorMode: this.contentEditorMode,
      pdfStyleId: this.selectedPdfStyle,
      quickStylePreset: this.selectedQuickStylePreset,
    });
  }

  private applyAssistantDocumentCommand(
    command: AssistantDocumentCommand,
  ): void {
    const currentContent = String(
      this.documentForm.get('content')?.value ?? '',
    );
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
    this.initEditorHistory(
      String(this.documentForm.get('content')?.value ?? ''),
    );
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
      this.customCss = removeManagedStylePreset(this.customCss);
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
    if (
      p['headerFooterConfig'] &&
      typeof p['headerFooterConfig'] === 'object'
    ) {
      this.headerFooterConfig = p[
        'headerFooterConfig'
      ] as Partial<HeaderFooterConfig>;
    }
    this.applyCustomCss();
    this.documentForm.patchValue(patch);
    this.syncAssistantFromFormNow();
  }

  get blockEditorHtml(): string {
    const content = String(this.documentForm.get('content')?.value ?? '');
    if (this.contentEditorMode === 'html') {
      return content;
    }
    if (this.contentEditorMode === 'plain') {
      return this.plainTextToHtml(content);
    }
    return this.convertMarkdownToHtmlForEditor(content);
  }

  async setEditorSurface(surface: EditorSurface): Promise<void> {
    if (this.editorSurface === surface) {
      return;
    }

    if (surface === 'blocks') {
      const content = String(this.documentForm.get('content')?.value ?? '');
      if (this.contentEditorMode === 'markdown' && content.trim()) {
        this.documentForm.patchValue({
          content: this.convertMarkdownToHtmlForEditor(content),
        });
      } else if (this.contentEditorMode === 'plain' && content.trim()) {
        this.documentForm.patchValue({ content: this.plainTextToHtml(content) });
      }
      this.contentEditorMode = 'html';
    }

    this.editorSurface = surface;
    this.updatePreview();
    this.syncAssistantFromFormNow();
    this.cdRef.markForCheck();
  }

  onBlockHtmlChange(html: string): void {
    this.documentForm.patchValue({ content: html });
    this.onEditorContentInput();
  }

  async setContentEditorMode(mode: ContentEditorMode): Promise<void> {
    if (this.contentEditorMode === mode) {
      return;
    }

    const content = String(this.documentForm.get('content')?.value ?? '');
    if (this.contentEditorMode === 'markdown' && mode === 'html') {
      const restoredHtml =
        this.lastHtmlEditorContent &&
        this.convertHtmlToMarkdownForEditor(
          this.lastHtmlEditorContent,
        ).trim() === content.trim()
          ? this.lastHtmlEditorContent
          : null;

      if (restoredHtml) {
        this.documentForm.patchValue({ content: restoredHtml });
      } else {
        const html = this.convertMarkdownToHtmlForEditor(content);
        this.documentForm.patchValue({ content: html });
      }
    } else if (this.contentEditorMode === 'html' && mode === 'markdown') {
      this.lastHtmlEditorContent = content;
      const markdown = this.convertHtmlToMarkdownForEditor(content);
      this.documentForm.patchValue({ content: markdown });
    } else if (this.contentEditorMode === 'plain' && mode === 'html') {
      this.documentForm.patchValue({ content: this.plainTextToHtml(content) });
    } else if (this.contentEditorMode === 'html' && mode === 'plain') {
      this.lastHtmlEditorContent = content;
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      this.documentForm.patchValue({
        content: (doc.body.textContent || '').trim(),
      });
    }

    this.contentEditorMode = mode;
    this.updatePreview();
    this.syncAssistantFromFormNow();
  }

  private convertMarkdownToHtmlForEditor(content: string): string {
    return enrichDocumentHtmlForStyling(parseMarkdownToHtml(content));
  }

  private convertHtmlToMarkdownForEditor(html: string): string {
    if (!html.trim()) {
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(
      this.stripWrappingHtmlFence(html),
      'text/html',
    );
    const markdown = this.nodeToMarkdown(doc.body, {
      listLevel: 0,
      olIndex: 1,
    }).trim();
    return markdown.replace(/\n{3,}/g, '\n\n');
  }

  private nodeToMarkdown(
    node: Node,
    context: { listLevel: number; listType?: 'ul' | 'ol'; olIndex: number },
  ): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || '').replace(/\s+/g, ' ');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes)
      .map((child) => this.nodeToMarkdown(child, context))
      .join('');

    switch (tag) {
      case 'br':
        return '  \n';
      case 'p':
      case 'div':
      case 'section':
      case 'article':
      case 'body':
      case 'html':
        return `${children.trim()}\n\n`;
      case 'h1':
        return `# ${children.trim()}\n\n`;
      case 'h2':
        return `## ${children.trim()}\n\n`;
      case 'h3':
        return `### ${children.trim()}\n\n`;
      case 'h4':
        return `#### ${children.trim()}\n\n`;
      case 'h5':
        return `##### ${children.trim()}\n\n`;
      case 'h6':
        return `###### ${children.trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${children.trim()}**`;
      case 'em':
      case 'i':
        return `*${children.trim()}*`;
      case 'u':
        return `_${children.trim()}_`;
      case 'a':
        return `[${children.trim()}](${element.getAttribute('href') || ''})`;
      case 'img':
        return `![${element.getAttribute('alt') || ''}](${element.getAttribute('src') || ''})`;
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          return children;
        }
        return '`' + children.trim() + '`';
      case 'pre': {
        const codeText =
          element.textContent?.replace(/\r\n?/g, '\n').trim() || '';
        return '\n\n```\n' + codeText + '\n```\n\n';
      }
      case 'blockquote': {
        const block = children
          .split('\n')
          .map((line) => (line.trim() ? `> ${line}` : ''))
          .join('\n');
        return `${block}\n\n`;
      }
      case 'ul': {
        return (
          Array.from(element.children)
            .map((child) =>
              this.nodeToMarkdown(child, {
                listLevel: context.listLevel + 1,
                listType: 'ul',
                olIndex: 1,
              }),
            )
            .join('') + '\n'
        );
      }
      case 'ol': {
        return (
          Array.from(element.children)
            .map((child, index) =>
              this.nodeToMarkdown(child, {
                listLevel: context.listLevel + 1,
                listType: 'ol',
                olIndex: index + 1,
              }),
            )
            .join('') + '\n'
        );
      }
      case 'li': {
        const prefix =
          context.listType === 'ol' ? `${context.olIndex}. ` : '- ';
        const item = Array.from(element.childNodes)
          .map((child) => this.nodeToMarkdown(child, context))
          .join('')
          .trim();
        const indentation = '  '.repeat(Math.max(0, context.listLevel - 1));
        return `${indentation}${prefix}${item}\n`;
      }
      case 'table': {
        const rows = Array.from(element.querySelectorAll('tr'));
        if (!rows.length) {
          return '';
        }
        const rowToText = (row: HTMLTableRowElement) =>
          Array.from(row.children)
            .map((cell) => this.nodeToMarkdown(cell, context).trim())
            .join(' | ');
        const header = rowToText(rows[0]);
        const separator = Array.from(rows[0].children)
          .map(() => '---')
          .join(' | ');
        const body = rows.slice(1).map(rowToText).join('\n');
        return `${header}\n${separator}${body ? `\n${body}` : ''}\n\n`;
      }
      case 'thead':
      case 'tbody':
      case 'tfoot':
        return children;
      default:
        return children;
    }
  }

  updatePreview() {
    const content = this.documentForm.get('content')?.value || '';
    const input = this.buildRenderInput(content);
    const payload = this.documentRender.buildPayload(input);

    this.previewHtmlMarkup = payload.contentMarkup;
    this.previewRenderCounter++;
    this.htmlPreviewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(
      this.exportOrchestrator.buildPreviewSrcdoc(input),
    );
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(payload.bodyHtml);
    this.cdRef.detectChanges();

    this.wordCount = content
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    this.characterCount = content.length;
  }

  onEditorContentInput(): void {
    this.updatePreview();
  }

  private initEditorHistory(content: string): void {
    this.historySuspended = true;
    this.editorHistory.reset(content);
    this.historySuspended = false;
    this.refreshHistoryFlags();
  }

  private refreshHistoryFlags(): void {
    this.historyCanUndo = this.editorHistory.canUndo();
    this.historyCanRedo = this.editorHistory.canRedo();
    this.cdRef.markForCheck();
  }

  undoEdit(): void {
    const previous = this.editorHistory.undo();
    if (previous === null) {
      return;
    }
    this.historySuspended = true;
    this.documentForm.patchValue({ content: previous });
    this.historySuspended = false;
    this.updatePreview();
    this.syncAssistantFromFormNow();
    this.refreshHistoryFlags();
  }

  redoEdit(): void {
    const next = this.editorHistory.redo();
    if (next === null) {
      return;
    }
    this.historySuspended = true;
    this.documentForm.patchValue({ content: next });
    this.historySuspended = false;
    this.updatePreview();
    this.syncAssistantFromFormNow();
    this.refreshHistoryFlags();
  }

  openSlashCommands(): void {
    this.showSlashCommands = true;
    this.cdRef.detectChanges();
  }

  closeSlashCommands(): void {
    this.showSlashCommands = false;
    this.cdRef.detectChanges();
    this.editorCanvas?.focusTextarea();
  }

  private buildRenderInput(
    content: string,
    contentEditorMode: ContentEditorMode = this.contentEditorMode,
  ): DocumentRenderInput {
    const title = String(this.documentForm.get('title')?.value ?? 'Documento');
    const coverConfig = this.coverEditor?.getConfig() ??
      this.toolsModal?.coverEditor?.getConfig() ??
      this.coverConfig ?? { enabled: false };
    const signatureConfig = this.signatureEditor?.getConfig() ??
      this.toolsModal?.signatureEditor?.getConfig() ??
      this.signatureConfig ?? { enabled: false };
    const headerFooterConfig = this.headerFooterEditor?.getConfig() ??
      this.toolsModal?.headerFooterEditor?.getConfig() ??
      this.headerFooterConfig ?? { enabled: false };
    const watermarkConfig = this.watermarkEditor?.getConfig() ??
      this.toolsModal?.watermarkEditor?.getConfig() ??
      this.watermarkConfig ?? { enabled: false };

    return {
      content,
      contentEditorMode,
      customCss: this.customCss,
      selectedPdfStyle: this.selectedPdfStyle,
      selectedQuickStylePreset: this.selectedQuickStylePreset,
      pdfStyles: this.pdfStyles,
      backgroundSettings: this.documentBackgroundSettings(),
      coverConfig,
      signatureConfig,
      headerFooterConfig,
      watermarkConfig,
      coverPanelEnabled: this.coverPanelEnabled,
      signaturePanelEnabled: this.signaturePanelEnabled,
      headerFooterPanelEnabled: this.headerFooterPanelEnabled,
      watermarkPanelEnabled: this.watermarkPanelEnabled,
      documentTitle: title,
    };
  }

  private resolvePdfPreviewMode(source: PdfPreviewSource): ContentEditorMode {
    if (source === 'markdown') {
      return 'markdown';
    }
    if (source === 'html') {
      return 'html';
    }
    return this.contentEditorMode;
  }

  private async generatePdfBlob(
    title: string,
    source: PdfPreviewSource = 'current',
  ): Promise<Blob> {
    const content = this.documentForm.get('content')?.value || '';
    const mode = this.resolvePdfPreviewMode(source);
    const input = this.buildRenderInput(content, mode);
    return this.exportOrchestrator.exportPdf(input, title);
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
      stylePresetCss(this.selectedQuickStylePreset),
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
      this.pdfBackgroundMode === 'corporate' &&
      this.pdfBackgroundImageUrl.trim()
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

  private previewCoverOverrideCss(): string {
    return `
/* Cover styles (shared with PDF) */
${PDF_COVER_SHARED_CSS}

/* Responsive preview overrides - only affect elements without inline color styles */
.pdf-cover,
.pdf-cover-page,
.cover {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  min-height: auto !important;
  aspect-ratio: 210/297 !important;
  padding: 32px !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12) !important;
  overflow: hidden !important;
}

.cover-container {
  width: 100% !important;
}

.cover-title,
.cover-subtitle {
  max-width: 100% !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  white-space: normal !important;
}

/* Watermark overlay for iframe preview */
.pdf-watermark {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) rotate(-45deg) !important;
  font-size: 48px !important;
  color: #000000 !important;
  opacity: 0.1 !important;
  pointer-events: none !important;
  user-select: none !important;
  z-index: -1 !important;
  white-space: nowrap !important;
  font-weight: 700 !important;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
}

/* Content spacing - compact but professional (preserve inline styles) */
.document-preview-render .pdf-body-content p {
  margin: 0.45rem 0;
  line-height: 1.68;
}

.document-preview-render .pdf-body-content ul,
.document-preview-render .pdf-body-content ol {
  margin: 0.55rem 0;
}

.document-preview-render .pdf-body-content li {
  margin: 0.25rem 0;
}

/* Headers with tight spacing */
.document-preview-render .pdf-body-content h1 {
  margin: 1.25rem 0 0.5rem 0;
}

.document-preview-render .pdf-body-content h2 {
  margin: 0.85rem 0 0.4rem 0;
}

.document-preview-render .pdf-body-content h3 {
  margin: 0.7rem 0 0.35rem 0;
}

/* Avoid page breaks before lists */
.document-preview-render .pdf-body-content h1 + ul,
.document-preview-render .pdf-body-content h2 + ul,
.document-preview-render .pdf-body-content h3 + ul,
.document-preview-render .pdf-body-content h1 + ol,
.document-preview-render .pdf-body-content h2 + ol,
.document-preview-render .pdf-body-content h3 + ol {
  margin-top: 0.25rem;
}
`;
  }

  private exportCoverConfigToHtml(c: Partial<CoverConfig>): string {
    return exportCoverConfigToHtml(c);
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
    // Remove cover elements for inline cover previews (corporate style renders built-in header)
    if (!/class\s*=\s*["'][^"']*\b(pdf-cover|cover)\b[^"']*/i.test(html)) {
      return html;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc
        .querySelectorAll('.pdf-cover, .pdf-cover-page, .cover')
        .forEach((cover) => cover.remove());
      return doc.body.innerHTML || html;
    } catch {
      return html.replace(
        /<([a-z][\w:-]*)\b[^>]*class=(["'])[^"']*\b(pdf-cover|cover)\b[^"']*\2[^>]*>[\s\S]*?<\/\1>/gi,
        '',
      );
    }
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
      this.documentForm.patchValue({
        content: `${content}${separator}${snippet}`,
      });
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
        : this.formatSelectedTextAsMarkdown(
            selectedText,
            this.selectedTextFormat,
          );

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
        return text.includes('\n')
          ? `\`\`\`\n${trimmed}\n\`\`\``
          : `\`${trimmed}\``;
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
    const textarea =
      this.editorCanvas?.getTextareaElement() ??
      (document.querySelector(
        'textarea[formControlName="content"]',
      ) as HTMLTextAreaElement | null);
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
    let coloredText: string;

    if (this.contentEditorMode === 'html') {
      coloredText = this.colorHtmlSelectionWithClass(selectedText, safeColor);
    } else {
      coloredText = this.applyColorToMarkdownSelection(selectedText, safeColor);
    }

    const newContent =
      content.substring(0, start) + coloredText + content.substring(end);

    this.documentForm.patchValue({ content: newContent });
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + coloredText.length;
      this.updatePreview();
    }, 0);
  }

  private colorHtmlSelectionWithClass(html: string, color: string): string {
    if (!html.trim()) {
      return '';
    }

    // Generate a unique class name for this color
    const colorHash = color.replace(/[^a-f0-9]/gi, '').substring(0, 6);
    const className = `doc-color-${colorHash}`;

    // Add the class definition to customCss if not already present
    this.ensureColorClassInCss(className, color);

    // Check if HTML or plain text
    const isHtml = /<[^>]+>/.test(html);

    if (isHtml) {
      // Parse HTML and add class to elements properly
      return this.applyClassToHtmlContent(html, className);
    } else {
      // Wrap plain text with the class
      return `<span class="${className}">${this.escapeHtml(html)}</span>`;
    }
  }

  private applyClassToHtmlContent(html: string, className: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<root>${html}</root>`, 'text/xml');

      if (doc.getElementsByTagName('parsererror').length > 0) {
        // XML parsing failed, try HTML parsing
        return `<span class="${className}">${this.escapeHtml(html)}</span>`;
      }

      const root = doc.documentElement;
      if (!root) {
        return `<span class="${className}">${this.escapeHtml(html)}</span>`;
      }

      // Add class to root and all children
      this.addClassToAllElements(root, className);

      // Get the serializedcontent (children of root)
      let result = '';
      for (let i = 0; i < root.childNodes.length; i++) {
        result += this.serializeNode(root.childNodes[i]);
      }

      return (
        result || `<span class="${className}">${this.escapeHtml(html)}</span>`
      );
    } catch (e) {
      console.warn('HTML class application failed', e);
      return `<span class="${className}">${this.escapeHtml(html)}</span>`;
    }
  }

  private addClassToAllElements(element: Node, className: string): void {
    if (element.nodeType === Node.ELEMENT_NODE) {
      const el = element as Element;
      const existing = el.getAttribute('class') || '';
      if (!existing.includes(className)) {
        const newClass = existing.trim()
          ? `${existing} ${className}`
          : className;
        el.setAttribute('class', newClass);
      }
    }

    for (let i = 0; i < element.childNodes.length; i++) {
      this.addClassToAllElements(element.childNodes[i], className);
    }
  }

  private serializeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      const attrs = this.serializeAttributes(el);
      const content = Array.from(el.childNodes)
        .map((child: Node) => this.serializeNode(child))
        .join('');
      return `<${tagName}${attrs}>${content}</${tagName}>`;
    }
    return '';
  }

  private serializeAttributes(element: Element): string {
    let attrs = '';
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs += ` ${attr.name}="${attr.value}"`;
      }
    }
    return attrs;
  }

  private ensureColorClassInCss(className: string, color: string): void {
    const cssRule = `.${className} { color: ${color} !important; }`;

    // Check if rule already exists
    if (this.customCss.includes(className)) {
      return;
    }

    // Add to customCss
    if (this.customCss.trim()) {
      this.customCss += `\n\n${cssRule}`;
    } else {
      this.customCss = cssRule;
    }

    this.applyCustomCss();
  }

  handleToolbarFormatAction(action: string): void {
    if (this.contentEditorMode === 'html') {
      this.handleHtmlFormatAction(action);
    } else if (this.contentEditorMode === 'plain') {
      this.handlePlainFormatAction(action);
    } else {
      this.handleMarkdownFormatAction(action);
    }
  }

  private handlePlainFormatAction(action: string): void {
    switch (action) {
      case 'bold':
        this.wrapPlainSelection('**', '**');
        break;
      case 'italic':
        this.wrapPlainSelection('_', '_');
        break;
      case 'strike':
        this.wrapPlainSelection('~~', '~~');
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        this.prefixPlainLine(
          action === 'h1' ? '# ' : action === 'h2' ? '## ' : '### ',
        );
        break;
      case 'quote':
        this.prefixPlainLine('> ');
        break;
      case 'list':
        this.prefixPlainLine('- ');
        break;
      case 'numbered-list':
        this.prefixPlainLine('1. ');
        break;
      case 'link':
        this.wrapPlainSelection('', ' (url)');
        break;
      case 'code':
        this.wrapPlainSelection('`', '`');
        break;
      case 'code-block':
        this.insertAtCursor('\n```\n', '\n```\n');
        break;
      case 'divider':
        this.insertAtCursor('\n---\n');
        break;
      case 'checklist':
        this.prefixPlainLine('- [ ] ');
        break;
      default:
        break;
    }
  }

  private wrapPlainSelection(before: string, after: string): void {
    this.insertMarkdown(before, after);
  }

  private prefixPlainLine(prefix: string): void {
    this.insertMarkdown(prefix, '');
  }

  private insertAtCursor(text: string, suffix = ''): void {
    const textarea =
      this.editorCanvas?.getTextareaElement() ??
      (document.querySelector(
        'textarea[formControlName="content"]',
      ) as HTMLTextAreaElement | null);
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = this.documentForm.get('content')?.value || '';
    const selected = content.substring(start, end);
    const insertion = text + selected + suffix;
    const newContent =
      content.substring(0, start) + insertion + content.substring(end);
    this.documentForm.patchValue({ content: newContent });
    this.updatePreview();
    this.syncAssistantFromFormNow();
    setTimeout(() => {
      textarea.focus();
      const cursor = start + text.length + selected.length;
      textarea.selectionStart = cursor;
      textarea.selectionEnd = cursor;
    }, 0);
  }

  private handleMarkdownFormatAction(action: string): void {
    switch (action) {
      case 'bold':
        this.insertMarkdown('**', '**');
        break;
      case 'italic':
        this.insertMarkdown('*', '*');
        break;
      case 'strike':
        this.insertMarkdown('~~', '~~');
        break;
      case 'code':
        this.insertCode();
        break;
      case 'h1':
        this.insertMarkdown('# ', '');
        break;
      case 'h2':
        this.insertMarkdown('## ', '');
        break;
      case 'h3':
        this.insertMarkdown('### ', '');
        break;
      case 'quote':
        this.insertMarkdown('> ', '');
        break;
      case 'list':
        this.insertMarkdown('- ', '');
        break;
      case 'numbered-list':
        this.insertMarkdown('1. ', '');
        break;
      case 'link':
        this.insertMarkdown('[', '](url)');
        break;
      case 'code-block':
        this.insertCodeBlock();
        break;
      case 'divider':
        this.insertMarkdown('\n---\n', '');
        break;
      case 'checklist':
        this.insertMarkdown('- [ ] ', '');
        break;
    }
  }

  private handleHtmlFormatAction(action: string): void {
    const textarea =
      this.editorCanvas?.getTextareaElement() ??
      (document.querySelector(
        'textarea[formControlName="content"]',
      ) as HTMLTextAreaElement | null);
    if (!textarea) {
      return;
    }

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    const content = this.documentForm.get('content')?.value || '';
    let selectedText = content.substring(start, end);

    if (start === end || !selectedText.trim()) {
      const range = this.getCurrentMarkdownBlockRange(content, start);
      start = range.start;
      end = range.end;
      selectedText = content.substring(start, end);
    }

    if (!selectedText.trim() && action !== 'divider' && action !== 'checklist') {
      return;
    }

    let formattedText: string;
    switch (action) {
      case 'bold':
        formattedText = this.wrapHtmlElement(selectedText, 'strong');
        break;
      case 'italic':
        formattedText = this.wrapHtmlElement(selectedText, 'em');
        break;
      case 'strike':
        formattedText = this.wrapHtmlElement(selectedText, 'del');
        break;
      case 'code':
        formattedText = this.wrapHtmlElement(selectedText, 'code');
        break;
      case 'h1':
      case 'h2':
      case 'h3':
        formattedText = this.wrapHtmlHeading(selectedText, action);
        break;
      case 'quote':
        formattedText = this.wrapHtmlBlock(selectedText, 'blockquote');
        break;
      case 'list':
        formattedText = this.wrapHtmlList(selectedText, 'ul');
        break;
      case 'numbered-list':
        formattedText = this.wrapHtmlList(selectedText, 'ol');
        break;
      case 'link':
        formattedText = `<a href="url">${this.escapeHtml(selectedText)}</a>`;
        break;
      case 'code-block':
        formattedText = `<pre><code>${this.escapeHtml(selectedText)}</code></pre>`;
        break;
      case 'divider':
        formattedText = '<hr />';
        break;
      case 'checklist':
        formattedText =
          '<ul class="doc-checklist"><li><input type="checkbox" disabled /> Tarea</li></ul>';
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);

    this.documentForm.patchValue({ content: newContent });
    this.updatePreview();
    this.syncAssistantFromFormNow();

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  }

  private wrapHtmlHeading(text: string, tag: string): string {
    const tagNum = tag.replace(/\D/g, '');
    const tagName = `h${tagNum}`;
    const isHtml = /<[^>]+>/.test(text);
    const content = isHtml ? text.trim() : this.escapeHtml(text.trim());
    return `<${tagName}>${content}</${tagName}>`;
  }

  private wrapHtmlElement(text: string, tag: string): string {
    // Check if text is already HTML (contains < and >)
    const isHtml = /<[^>]+>/.test(text);

    if (isHtml) {
      // Text contains HTML, use it as-is
      return `<${tag}>${text}</${tag}>`;
    } else {
      // Plain text, escape it
      const escaped = this.escapeHtml(text);
      return `<${tag}>${escaped}</${tag}>`;
    }
  }

  private wrapHtmlBlock(text: string, tag: string): string {
    const tagName = tag.startsWith('h') ? `h${tag.replace(/[^123]/, '')}` : tag;
    if (tag.startsWith('h') || tag === 'blockquote') {
      // For headings and blockquote, wrap the entire text as one block
      const isHtml = /<[^>]+>/.test(text);
      const content = isHtml ? text.trim() : this.escapeHtml(text.trim());
      return `<${tagName}>${content}</${tagName}>`;
    }
    const isHtml = /<[^>]+>/.test(text);
    const content = isHtml ? text : this.escapeHtml(text);
    return `<${tagName}>${content}</${tagName}>`;
  }

  private wrapHtmlList(text: string, tag: 'ul' | 'ol'): string {
    const lines = text.split('\n').filter((line) => line.trim());
    const items = lines
      .map((line) => {
        // Check if line is HTML (contains tags)
        const isHtml = /<[^>]+>/.test(line);
        const content = isHtml ? line : this.escapeHtml(line.trim());
        return `  <li>${content}</li>`;
      })
      .join('\n');
    return `<${tag}>\n${items}\n</${tag}>`;
  }

  toggleDocumentTool(tool: string): void {
    switch (tool) {
      case 'cover':
        this.toggleCoverEditor();
        break;
      case 'header-footer':
        this.toggleHeaderFooterEditor();
        break;
      case 'signature':
        this.toggleSignatureEditor();
        break;
      case 'table':
        this.toggleTableBuilder();
        break;
      case 'image':
        this.toggleImageInsert();
        break;
      case 'watermark':
        this.toggleWatermarkEditor();
        break;
    }
  }

  private getCurrentMarkdownBlockRange(
    content: string,
    cursorPosition: number,
  ): { start: number; end: number } {
    let start = content.lastIndexOf('\n\n', Math.max(0, cursorPosition - 1));
    start = start === -1 ? 0 : start + 2;

    let end = content.indexOf('\n\n', cursorPosition);
    end = end === -1 ? content.length : end;

    return { start, end };
  }

  private applyColorToMarkdownSelection(
    selection: string,
    color: string,
  ): string {
    return selection
      .split(/(\r?\n)/)
      .map((part) =>
        part.includes('\n') ? part : this.applyColorToMarkdownLine(part, color),
      )
      .join('');
  }

  private applyColorToMarkdownLine(line: string, color: string): string {
    if (!line.trim() || this.isMarkdownTableSeparator(line)) {
      return line;
    }

    if (line.includes('|')) {
      return line
        .split(/(\|)/)
        .map((part) =>
          part === '|' ? part : this.colorMarkdownInline(part, color),
        )
        .join('');
    }

    const headingMatch = /^(\s{0,3}#{1,6}\s+)(.+)$/.exec(line);
    if (headingMatch) {
      return `${headingMatch[1]}${this.colorMarkdownInline(headingMatch[2], color)}`;
    }

    const prefixedLineMatch =
      /^(\s*(?:>\s*)*(?:(?:[-*+]\s+)|(?:\d+[.)]\s+))?)(.+)$/.exec(line);
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
      [
        /^(\*\*|__)(.+)(\1)$/s,
        (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`,
      ],
      [
        /^(\*|_)(.+)(\1)$/s,
        (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`,
      ],
      [
        /^(~~)(.+)(~~)$/s,
        (match) => `${match[1]}${this.colorSpan(match[2], color)}${match[3]}`,
      ],
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

  private colorHtmlSelection(html: string, color: string): string {
    if (!html.trim()) {
      return '';
    }

    // For plain text without HTML tags, use simple wrapping
    const isSimpleText = !html.includes('<');

    if (isSimpleText) {
      return `<span style="color: ${color} !important;">${this.escapeHtml(html)}</span>`;
    }

    // For HTML with tags, parse and apply color recursively
    try {
      const parser = new DOMParser();
      // Parse as a complete HTML document to preserve structure
      const doc = parser.parseFromString(
        `<!DOCTYPE html><html><body>${html}</body></html>`,
        'text/html',
      );

      const body = doc.body;
      if (!body) {
        return `<span style="color: ${color} !important;">${this.escapeHtml(html)}</span>`;
      }

      // Apply color to all elements in the body
      this.applyColorSafeRecursive(body, color);

      // Serialize: get everything inside body as HTML string
      const result = body.innerHTML;
      return (
        result ||
        `<span style="color: ${color} !important;">${this.escapeHtml(html)}</span>`
      );
    } catch (e) {
      // Fallback to safe wrapping if parsing fails
      console.warn('HTML color parsing failed, using fallback', e);
      return `<span style="color: ${color} !important;">${this.escapeHtml(html)}</span>`;
    }
  }

  private applyColorSafeRecursive(node: Element | Node, color: string): void {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    const element = node as HTMLElement;

    // Check if element already has color style
    const currentStyle = element.getAttribute('style') || '';
    const hasColor = /color\s*:/i.test(currentStyle);

    // Only apply color if not already present
    if (!hasColor) {
      const newStyle = currentStyle.trim()
        ? `${currentStyle}; color: ${color} !important;`
        : `color: ${color} !important;`;
      element.setAttribute('style', newStyle.trim());
    }

    // Recursively process children
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.applyColorSafeRecursive(child as Element, color);
      }
    }
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

  handleEditorKeydown(event: KeyboardEvent): void {
    if (this.showSlashCommands && this.slashCommands?.handleKeydown(event)) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undoEdit();
      return;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.key === 'z' && event.shiftKey))
    ) {
      event.preventDefault();
      this.redoEdit();
      return;
    }

    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.handleToolbarFormatAction('bold');
    }
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      this.handleToolbarFormatAction('italic');
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      void this.saveDraft();
    }
    if (event.key === 'Escape' && this.showSlashCommands) {
      event.preventDefault();
      this.closeSlashCommands();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.fullscreenMode) {
      event.preventDefault();
      this.toggleFullscreen();
      return;
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      void this.saveDraft();
    }
  }

  getActiveCoverConfig(): Partial<CoverConfig> | null {
    return this.coverConfig?.enabled ? this.coverConfig : null;
  }

  getActiveSignatureConfig(): Partial<SignatureConfig> | null {
    return this.signatureConfig?.enabled ? this.signatureConfig : null;
  }

  getActiveHeaderFooterConfig(): Partial<HeaderFooterConfig> | null {
    return this.headerFooterConfig?.enabled ? this.headerFooterConfig : null;
  }

  onCloseCover(): void {
    this.showCoverEditor = false;
  }

  onCoverConfigChange(config: CoverConfig): void {
    this.coverConfig = config;
    this.coverPanelEnabled = config.enabled;
    this.updatePreview();
  }

  onSignatureConfigChange(config: SignatureConfig): void {
    this.signatureConfig = config;
    this.signaturePanelEnabled = config.enabled;
    this.updatePreview();
  }

  onHeaderFooterConfigChange(config: HeaderFooterConfig): void {
    this.headerFooterConfig = config;
    this.headerFooterPanelEnabled = config.enabled;
    this.updatePreview();
  }

  onWatermarkConfigChange(config: WatermarkConfig): void {
    this.watermarkConfig = config;
    this.watermarkPanelEnabled = config.enabled;
    this.updatePreview();
  }

  hasActiveModal(): boolean {
    return (
      this.showCoverEditor ||
      this.showSignatureEditor ||
      this.showHeaderFooterEditor ||
      this.showTableBuilder ||
      this.showImageInsert ||
      this.showWatermarkEditor
    );
  }

  activeToolModalTitle(): string {
    if (this.showCoverEditor) return 'Portada del Documento';
    if (this.showSignatureEditor) return 'Bloque de Firmas';
    if (this.showHeaderFooterEditor) return 'Encabezado y Pie de Pagina';
    if (this.showTableBuilder) return 'Constructor de Tablas';
    if (this.showImageInsert) return 'Insertar Imagen';
    if (this.showWatermarkEditor) return 'Marca de Agua';
    return '';
  }

  activeToolModalSubtitle(): string {
    if (this.showCoverEditor) {
      return 'Personaliza la primera pagina de tu PDF con logo, titulos y fondos';
    }
    if (this.showSignatureEditor) {
      return 'Configura firmas para los responsables al final del documento';
    }
    if (this.showHeaderFooterEditor) {
      return 'Define la paginacion y cabeceras de cada pagina';
    }
    if (this.showTableBuilder) {
      return 'Disena y estructura tablas de datos visualmente';
    }
    if (this.showImageInsert) {
      return 'Sube y edita el diseno de imagenes en tu documento';
    }
    if (this.showWatermarkEditor) {
      return 'A�ade una marca de agua semi-transparente al documento';
    }
    return '';
  }

  closeAllModals(): void {
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
    this.showWatermarkEditor = false;
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
    this.showWatermarkEditor = false;
  }

  toggleWatermarkEditor(): void {
    this.showWatermarkEditor = !this.showWatermarkEditor;
    this.showCoverEditor = false;
    this.showSignatureEditor = false;
    this.showHeaderFooterEditor = false;
    this.showTableBuilder = false;
    this.showImageInsert = false;
  }

  handleSlashCommand(command: SlashCommand): void {
    this.closeSlashCommands();
    const html = this.contentEditorMode === 'html';
    switch (command.id) {
      case 'heading1':
        html
          ? this.insertAtCursor('<h1>', '</h1>')
          : this.insertMarkdown('# ', '');
        break;
      case 'heading2':
        html
          ? this.insertAtCursor('<h2>', '</h2>')
          : this.insertMarkdown('## ', '');
        break;
      case 'heading3':
        html
          ? this.insertAtCursor('<h3>', '</h3>')
          : this.insertMarkdown('### ', '');
        break;
      case 'paragraph':
        html
          ? this.insertAtCursor('<p>', '</p>')
          : this.insertMarkdown('\n\n', '');
        break;
      case 'bold':
        this.handleToolbarFormatAction('bold');
        break;
      case 'italic':
        this.handleToolbarFormatAction('italic');
        break;
      case 'quote':
        html
          ? this.insertAtCursor('<blockquote>', '</blockquote>')
          : this.insertMarkdown('> ', '');
        break;
      case 'divider':
        html
          ? this.insertAtCursor('\n<hr />\n')
          : this.insertMarkdown('\n---\n', '');
        break;
      case 'code':
        html
          ? this.insertAtCursor('<pre><code>', '</code></pre>')
          : this.insertMarkdown('```\n', '\n```');
        break;
      case 'bullet-list':
        html
          ? this.insertAtCursor('<ul>\n  <li>', '</li>\n</ul>')
          : this.insertMarkdown('- ', '');
        break;
      case 'numbered-list':
        html
          ? this.insertAtCursor('<ol>\n  <li>', '</li>\n</ol>')
          : this.insertMarkdown('1. ', '');
        break;
      case 'checklist':
        html
          ? this.insertAtCursor(
              '<ul class="doc-checklist"><li><input type="checkbox" disabled /> ',
              '</li></ul>',
            )
          : this.insertMarkdown('- [ ] ', '');
        break;
      case 'callout':
        html
          ? this.insertAtCursor(
              '<div class="doc-callout doc-callout--note"><strong>Nota:</strong> ',
              '</div>',
            )
          : this.insertMarkdown('> **Nota:** ', '');
        break;
      case 'callout-info':
        html
          ? this.insertAtCursor(
              '<div class="doc-callout doc-callout--info"><strong>Info:</strong> ',
              '</div>',
            )
          : this.insertMarkdown('> **Info:** ', '');
        break;
      case 'callout-warning':
        html
          ? this.insertAtCursor(
              '<div class="doc-callout doc-callout--warning"><strong>Advertencia:</strong> ',
              '</div>',
            )
          : this.insertMarkdown('> **Advertencia:** ', '');
        break;
      case 'callout-success':
        html
          ? this.insertAtCursor(
              '<div class="doc-callout doc-callout--success"><strong>Éxito:</strong> ',
              '</div>',
            )
          : this.insertMarkdown('> **Éxito:** ', '');
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
      case 'watermark':
        this.toggleWatermarkEditor();
        break;
      case 'link':
        this.insertMarkdown('[', '](url)');
        break;
      case 'columns':
        this.insertMarkdown(
          '\n<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">\n\n',
          '\n\n</div>\n',
        );
        break;
    }
  }

  insertCoverIntoDocument(): void {
    const coverEditor = this.coverEditor ?? this.toolsModal?.coverEditor;
    if (coverEditor) {
      const coverHtml = coverEditor.exportToHtml();
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      if (this.contentEditorMode === 'html') {
        this.documentForm.patchValue({
          content: currentContent + separator + coverHtml,
        });
      } else {
        const coverMd = coverEditor.exportToMarkdown();
        this.documentForm.patchValue({
          content: currentContent + separator + coverMd,
        });
      }
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertSignatureIntoDocument(): void {
    const signatureEditor =
      this.signatureEditor ?? this.toolsModal?.signatureEditor;
    if (signatureEditor) {
      const signatureHtml = signatureEditor.exportToHtml();
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      if (this.contentEditorMode === 'html') {
        this.documentForm.patchValue({
          content: currentContent + separator + signatureHtml,
        });
      } else {
        const signatureMd = signatureEditor.exportToMarkdown();
        this.documentForm.patchValue({
          content: currentContent + separator + signatureMd,
        });
      }
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertTableFromBuilder(): void {
    const tableBuilder = this.tableBuilder ?? this.toolsModal?.tableBuilder;
    if (tableBuilder) {
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      let tableContent: string;
      if (this.contentEditorMode === 'html') {
        tableContent = tableBuilder.exportToHtml();
      } else {
        tableContent = tableBuilder.exportToMarkdown();
      }
      this.documentForm.patchValue({
        content: currentContent + separator + tableContent,
      });
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertImageFromUpload(): void {
    const imageInsert = this.imageInsert ?? this.toolsModal?.imageInsert;
    if (imageInsert) {
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      let imageContent: string;
      if (this.contentEditorMode === 'html') {
        imageContent = imageInsert.exportToHtml();
      } else {
        imageContent = imageInsert.exportToMarkdown();
      }
      if (imageContent) {
        this.documentForm.patchValue({
          content: currentContent + separator + imageContent,
        });
        this.updatePreview();
        this.syncAssistantFromFormNow();
      }
    }
  }

  insertWatermarkIntoDocument(): void {
    // Watermark is applied via CSS overlay, no need to insert into document content
    // The watermarkConfig is already passed to the render service
  }

  generateFullDocumentHtml(): string {
    let html = '';
    const formValue = this.documentForm.value;
    const title = formValue.title || 'Documento';
    const coverEditor = this.coverEditor ?? this.toolsModal?.coverEditor;
    const signatureEditor =
      this.signatureEditor ?? this.toolsModal?.signatureEditor;

    if (coverEditor && this.coverConfig?.enabled) {
      html += coverEditor.exportToHtml();
    }

    html += `\n<div class="document-content" style="padding: 2rem; margin-top: 2rem;">\n`;
    html += this.previewHtmlMarkup;
    html += `\n</div>\n`;

    if (signatureEditor && this.signatureConfig?.enabled) {
      html += signatureEditor.exportToHtml();
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
      const documentData = {
        ...formValue,
        client: client?.name || 'Cliente',
        type: this.selectedType.id,
        pdfStyleId: this.selectedPdfStyle,
        quickStylePreset: this.selectedQuickStylePreset,
        contentEditorMode: this.contentEditorMode,
        customCss: documentCss,
        coverConfig: this.coverConfig?.enabled ? this.coverConfig : undefined,
        signatureConfig: this.signatureConfig?.enabled
          ? this.signatureConfig
          : undefined,
        headerFooterConfig: this.headerFooterConfig?.enabled
          ? this.headerFooterConfig
          : undefined,
        watermarkConfig: this.watermarkConfig?.enabled
          ? this.watermarkConfig
          : undefined,
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
    // Force the corporate preview and PDF style, and switch preview background
    // settings away from the UI theme so blue theme accents no longer override
    // the red/granate corporate palette.
    this.selectedPdfStyle = 'default';
    this.pdfBackgroundMode = 'color';
    this.pdfBackgroundColor = '#ffffff';
    this.documentPaperColor = '#ffffff';
    this.documentTextColor = '#111827';
    this.documentMutedColor = '#4b5563';
    this.documentAccentColor = '#7a0000';
    this.documentBorderColor = '#e5e7eb';

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
    this.applyFullscreenBodyLock(this.fullscreenMode);
  }

  ngOnDestroy(): void {
    this.applyFullscreenBodyLock(false);
  }

  private applyFullscreenBodyLock(active: boolean): void {
    const root = document.documentElement;
    if (active) {
      root.classList.add('dg-editor-fullscreen');
      document.body.style.overflow = 'hidden';
    } else {
      root.classList.remove('dg-editor-fullscreen');
      document.body.style.overflow = '';
    }
  }

  applyCustomCss(): void {
    const styleEl =
      document.getElementById('custom-editor-css') ||
      this.createCustomStyleEl();
    const content = this.documentForm.get('content')?.value || '';
    styleEl.textContent = this.documentRender.buildPreviewStylesheet(
      this.buildRenderInput(content),
    );
    this.updatePreview();
  }

  private pdfExportCustomCss(): string {
    const content = this.documentForm.get('content')?.value || '';
    return this.documentRender.customCssForDocument(
      this.buildRenderInput(content),
    );
  }

  private documentBackgroundSettings() {
    if (this.pdfBackgroundMode === 'theme') {
      return {
        pdfBackgroundMode: this.pdfBackgroundMode,
        pdfBackgroundColor: this.readThemeCssColor('--bg-primary', '#f8fafc'),
        pdfBackgroundImageUrl: this.pdfBackgroundImageUrl,
        documentPaperColor: this.readThemeCssColor('--surface', '#ffffff'),
        documentTextColor: this.readThemeCssColor('--text-primary', '#1f2937'),
        documentMutedColor: this.readThemeCssColor(
          '--text-secondary',
          '#475569',
        ),
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
    const cleaned = removeManagedStylePreset(this.customCss);
    if (cleaned !== this.customCss) {
      this.customCss = cleaned;
    }
    return cleaned;
  }

  private customCssForDocument(): string {
    const content = this.documentForm.get('content')?.value || '';
    return this.documentRender.customCssForDocument(
      this.buildRenderInput(content),
    );
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
        const varRe = new RegExp(
          varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*[^;]+;',
        );
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
    this.customCss = removeManagedStylePreset(this.customCss);
    this.selectedQuickStylePreset =
      !preset || preset === 'default' ? '' : preset;
    this.applyCustomCss();
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
        const varMatch = /--markdown-font-size\s*:\s*([0-9.]+)rem\s*;/.exec(
          body,
        );
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
    const input = this.buildRenderInput(
      this.documentForm.get('content')?.value || '',
    );
    const blob = this.exportOrchestrator.exportHtmlFile(input, title);
    this.universalDocument.download(blob, `${title || 'documento'}.html`);
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
    const title = this.documentForm.get('title')?.value || 'documento';
    const formValue = this.documentForm.value;
    const client = this.clients.find((c) => c.id === formValue.clientId);

    if (
      format === 'pdf' ||
      format === 'pdf-markdown' ||
      format === 'pdf-html'
    ) {
      try {
        const source: PdfPreviewSource =
          format === 'pdf-markdown'
            ? 'markdown'
            : format === 'pdf-html'
              ? 'html'
              : 'current';
        const pdfBlob = await this.generatePdfBlob(title, source);
        const suffix =
          source === 'markdown'
            ? '-preview-markdown'
            : source === 'html'
              ? '-preview-html'
              : '';
        this.universalDocument.download(pdfBlob, `${title}${suffix}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(
          'No se pudo generar el PDF. Revisa el contenido e int�ntalo de nuevo.',
        );
      }
      return;
    }

    if (format === 'html') {
      this.exportStyledHtml(title);
      return;
    }

    if (format === 'docx') {
      try {
        const input = this.buildRenderInput(content);
        const exportHtml = this.exportOrchestrator.buildExportHtml(input);
        const blob = await this.docxExport.exportHtml(exportHtml, title);
        this.universalDocument.download(blob, `${title}.docx`);
      } catch (error) {
        console.error('Error exporting DOCX:', error);
        alert(
          'No se pudo exportar a DOCX. Revisa el contenido e inténtalo de nuevo.',
        );
      }
      return;
    }

    const exportContent =
      format === 'markdown' ? content : this.getPlainContentForExport(content);
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
        `No se pudo exportar a ${format.toUpperCase()}. Revisa el contenido e int�ntalo de nuevo.`,
      );
    }
  }

  async importDocument(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const result = await this.universalDocument.import(file);

    if (result.success) {
      const htmlBlock = result.blocks.find((b) => b.type === 'html');
      const content = htmlBlock
        ? htmlBlock.content
        : result.blocks.map((b) => b.content).join('\n\n');
      this.contentEditorMode = this.inferEditorModeFromFile(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx' || ext === 'doc' || ext === 'pdf') {
        this.editorSurface = 'blocks';
      }
      this.documentForm.get('content')?.setValue(content);
      this.initEditorHistory(content);
      this.updatePreview();
      this.syncAssistantFromFormNow();
      this.importFeedback =
        result.warnings.length > 0 ? result.warnings.join(' · ') : '';
    } else if (result.warnings.length > 0) {
      alert(result.warnings.join('\n'));
      this.importFeedback = result.warnings.join(' · ');
    }

    if (result.warnings.length > 0 && isDevMode()) {
      console.warn('importDocument:', result.warnings);
    }

    input.value = '';
  }

  private inferEditorModeFromFile(fileName: string): ContentEditorMode {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (
      extension === 'html' ||
      extension === 'htm' ||
      extension === 'docx' ||
      extension === 'doc' ||
      extension === 'pdf'
    ) {
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
        const backgroundSettings = this.documentBackgroundSettings();

        const coverCfg = this.coverConfig?.enabled
          ? this.coverConfig
          : undefined;
        const sigCfg = this.signatureConfig?.enabled
          ? this.signatureConfig
          : undefined;
        const hfCfg = this.headerFooterConfig?.enabled
          ? this.headerFooterConfig
          : undefined;
        const wmCfg = this.watermarkConfig?.enabled
          ? this.watermarkConfig
          : undefined;

        const documentData = {
          ...formValue,
          content: String(formValue.content ?? ''),
          client: client?.name || 'Cliente',
          type: this.selectedType?.id,
          pdfStyleId: this.selectedPdfStyle,
          contentEditorMode: this.contentEditorMode,
          customCss: this.pdfExportCustomCss(),
          quickStylePreset: this.selectedQuickStylePreset,
          coverConfig: coverCfg,
          signatureConfig: sigCfg,
          headerFooterConfig: hfCfg,
          watermarkConfig: wmCfg,
          ...backgroundSettings,
        };

        const title = String(formValue.title ?? 'Documento');
        const pdfBytes = await this.generatePdfBlob(title);

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
          'No se pudo generar el documento. Revisa los datos e int�ntalo de nuevo.';
      } finally {
        this.isGenerating = false;
      }
    }
  }
}
