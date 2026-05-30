import {
  Component,
  DestroyRef,
  HostListener,
  ViewEncapsulation,
  inject,
  isDevMode,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, interval } from 'rxjs';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { DocumentRenderService } from '../services/document-render.service';
import { DocumentPdfApiService } from '../services/document-pdf-api.service';
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
import { TableBuilderComponent } from './table-builder.component';
import { ImageInsertComponent } from './image-insert.component';
import { SlashCommandsComponent, type SlashCommand } from './slash-commands.component';
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

declare const marked: MarkedGlobal;

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
  ],
  templateUrl: './document-create-editor.component.html',
  styleUrl: './document-create-editor.component.css',
  encapsulation: ViewEncapsulation.None,
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

  coverPanelEnabled = false;
  signaturePanelEnabled = false;
  headerFooterPanelEnabled = false;
  coverConfig: Partial<CoverConfig> = { enabled: false };
  signatureConfig: Partial<SignatureConfig> = { enabled: false };
  headerFooterConfig: Partial<HeaderFooterConfig> = { enabled: false };

  @ViewChild(CoverEditorComponent) coverEditor?: CoverEditorComponent;
  @ViewChild(SignatureEditorComponent) signatureEditor?: SignatureEditorComponent;
  @ViewChild(HeaderFooterEditorComponent) headerFooterEditor?: HeaderFooterEditorComponent;
  @ViewChild(TableBuilderComponent) tableBuilder?: TableBuilderComponent;
  @ViewChild(ImageInsertComponent) imageInsert?: ImageInsertComponent;
  @ViewChild(DocumentToolsModalComponent) toolsModal?: DocumentToolsModalComponent;
  @ViewChild(SlashCommandsComponent) slashCommands!: SlashCommandsComponent;
  readonly selectedTextFormats: SelectedTextFormat[] = [
    { id: 'paragraph', label: 'Pórrafo normal' },
    { id: 'h1', label: 'Tótulo H1' },
    { id: 'h2', label: 'Tótulo H2' },
    { id: 'h3', label: 'Tótulo H3' },
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
      label: 'Pórrafo',
      markdown: `\n\n[Escribe aquó un pórrafo descriptivo con el contexto, objetivo o explicación principal.]\n`,
      html: `<p>[Escribe aquó un pórrafo descriptivo con el contexto, objetivo o explicación principal.]</p>`,
    },
    {
      id: 'section',
      label: 'Sección completa',
      markdown: `\n\n## [Tótulo de la sección]\n\n**Objetivo:** [Describe el objetivo]\n\n**Detalle:** [Explica los puntos principales]\n\n**Resultado esperado:** [Indica el resultado]\n`,
      html: `<section class="section card">
  <h2>[Tótulo de la sección]</h2>
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
      markdown: `\n\n## Cronograma e hitos\n\n| Hito | Descripción | Fecha estimada | Dependencias |\n|---|---|---|---|\n| Hito 1 | Inicio del proyecto | [Fecha] | - |\n| Hito 2 | Diseóo aprobado | [Fecha] | Hito 1 |\n| Hito 3 | Entrega final | [Fecha] | Hito 2 |\n`,
      html: `<section class="section">
  <h2>Cronograma e hitos</h2>
  <table class="doc-table timeline-table">
    <thead><tr><th>Hito</th><th>Descripción</th><th>Fecha estimada</th><th>Dependencias</th></tr></thead>
    <tbody>
      <tr><td>Hito 1</td><td>Inicio del proyecto</td><td>[Fecha]</td><td>-</td></tr>
      <tr><td>Hito 2</td><td>Diseóo aprobado</td><td>[Fecha]</td><td>Hito 1</td></tr>
      <tr><td>Hito 3</td><td>Entrega final</td><td>[Fecha]</td><td>Hito 2</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'budget',
      label: 'Presupuesto',
      markdown: `\n\n## Presupuesto estimado\n\n| Concepto | Horas | Coste unitario | Importe |\n|---|---:|---:|---:|\n| Anólisis y diseóo | [h] | [EUR/h] | [EUR] |\n| Desarrollo | [h] | [EUR/h] | [EUR] |\n| Pruebas | [h] | [EUR/h] | [EUR] |\n| **Total** |  |  | **[EUR]** |\n`,
      html: `<section class="section">
  <h2>Presupuesto estimado</h2>
  <table class="doc-table budget-table">
    <thead><tr><th>Concepto</th><th>Horas</th><th>Coste unitario</th><th>Importe</th></tr></thead>
    <tbody>
      <tr><td>Anólisis y diseóo</td><td>[h]</td><td>[EUR/h]</td><td>[EUR]</td></tr>
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
      markdown: `\n\n## Aprobaciones\n\n| Rol | Nombre | Responsabilidad |\n|---|---|---|\n| Cliente | [Nombre] | Aprobación funcional |\n| QA | [Nombre] | Pruebas y calidad |\n| Proveedor | [Nombre] | Entrega tócnica |\n`,
      html: `<section class="section">
  <h2>Aprobaciones</h2>
  <table class="doc-table approvals-table">
    <thead><tr><th>Rol</th><th>Nombre</th><th>Responsabilidad</th></tr></thead>
    <tbody>
      <tr><td>Cliente</td><td>[Nombre]</td><td>Aprobación funcional</td></tr>
      <tr><td>QA</td><td>[Nombre]</td><td>Pruebas y calidad</td></tr>
      <tr><td>Proveedor</td><td>[Nombre]</td><td>Entrega tócnica</td></tr>
    </tbody>
  </table>
</section>`,
    },
    {
      id: 'callout',
      label: 'Nota destacada',
      markdown: `\n\n> **Nota:** [Incluye aquó una advertencia, decisión importante o recomendación.]\n`,
      html: `<aside class="callout">
  <strong>Nota:</strong> [Incluye aquó una advertencia, decisión importante o recomendación.]
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
      name: 'Documentación Tócnica',
      description: 'Crear documentos tócnicos o informativos',
    },
    {
      id: 'architecture',
      name: 'Documentación Arquitectónica',
      description: 'Documentos de arquitectura de sistemas con diagramas',
    },
    {
      id: 'resume',
      name: 'Curróculum Vitae',
      description: 'Plantillas estandarizadas de CV para candidatos',
    },
    {
      id: 'interview',
      name: 'Pruebas Tócnicas Entrevista',
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
   private readonly documentRender = inject(DocumentRenderService);
   private readonly documentPdfApi = inject(DocumentPdfApiService);
   private readonly documentPersistence = inject(DocumentPersistenceService);
   readonly assistantService = inject(AssistantContextService);
   readonly universalDocument = inject(UniversalDocumentService);
   private readonly documentAi = inject(DocumentAiService);
   private readonly viewportScroller = inject(ViewportScroller);
   private readonly sanitizer = inject(DomSanitizer);
   private readonly cdRef = inject(ChangeDetectorRef);

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
        return '<h1>Tótulo</h1>\n<p>Escribe HTML libre con estilos inline, tablas, secciones, etc.</p>';
      case 'plain':
        return 'Escribe texto normal. Las lóneas en blanco separan pórrafos.';
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

  /** Lista de plantillas segón categoróa del tipo de documento (para cambiar plantilla en el editor). */
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
      this.aiError = 'Describe quó debe contener el documento.';
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
        'Escribe una instrucción (por ejemplo: mós formal, acortar, aóadir tabla de costes).';
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
    console.log('convertMarkdownToVisualHtmlWithAi called', this.contentEditorMode);
    const content = String(this.documentForm.get('content')?.value ?? '').trim();
    if (this.contentEditorMode !== 'markdown') {
      this.aiError = 'Esta acción solo estó disponible desde el modo Markdown.';
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
      await this.setContentEditorMode('html');
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

  async convertHtmlToMarkdownWithAi(): Promise<void> {
    console.log('convertHtmlToMarkdownWithAi called', this.contentEditorMode);
    const content = String(this.documentForm.get('content')?.value ?? '').trim();
    if (this.contentEditorMode !== 'html') {
      this.aiError = 'Esta acción solo está disponible desde el modo HTML.';
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
    const content = String(this.documentForm.get('content')?.value ?? '').trim();
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
        beautified = await this.documentAi.beautifyHtml(
          this.getAiContext(),
        );
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
        return 'Ej: Curróculum - Juan Garcóa López';
      case 'interview':
        return 'Ej: Evaluación Tócnica - Candidato Senior Developer';
      case 'offer':
        return 'Ej: Carta Oferta - Puesto Senior Full Stack';
      default:
        return 'Tótulo del documento';
    }
  }

  getContentPlaceholder(): string {
    switch (this.selectedType?.id) {
      case 'quote':
        return 'Descripción detallada del presupuesto, alcance de trabajo, condiciones...';
      case 'proposal':
        return 'Contenido de la propuesta comercial, beneficios, solución propuesta...';
      case 'documentation':
        return 'Contenido detallado de la documentación tócnica...';
      case 'architecture':
        return 'Descripción de la arquitectura del sistema, componentes, tecnologóas...';
      case 'resume':
        return 'Datos personales, experiencia laboral, formación y habilidades del candidato';
      case 'interview':
        return 'Evaluación tócnica, preguntas, ejercicios y scorecard estandarizado';
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
    if (p['headerFooterConfig'] && typeof p['headerFooterConfig'] === 'object') {
      this.headerFooterConfig = p['headerFooterConfig'] as Partial<HeaderFooterConfig>;
    }
    this.applyCustomCss();
    this.documentForm.patchValue(patch);
    this.syncAssistantFromFormNow();
  }

  async setContentEditorMode(mode: ContentEditorMode): Promise<void> {
    if (this.contentEditorMode === mode) {
      return;
    }

    const content = String(this.documentForm.get('content')?.value ?? '');
    if (this.contentEditorMode === 'markdown' && mode === 'html') {
      const html = this.convertMarkdownToHtmlForEditor(content);
      this.documentForm.patchValue({ content: html });
    } else if (this.contentEditorMode === 'html' && mode === 'markdown') {
      const markdown = this.convertHtmlToMarkdownForEditor(content);
      this.documentForm.patchValue({ content: markdown });
    } else if (this.contentEditorMode === 'plain' && mode === 'html') {
      this.documentForm.patchValue({ content: this.plainTextToHtml(content) });
    } else if (this.contentEditorMode === 'html' && mode === 'plain') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      this.documentForm.patchValue({ content: (doc.body.textContent || '').trim() });
    }

    this.contentEditorMode = mode;
    this.updatePreview();
    this.syncAssistantFromFormNow();
  }

  private convertMarkdownToHtmlForEditor(content: string): string {
    marked.setOptions?.({ gfm: true, breaks: true });
    return String(marked.parse(content, { gfm: true, breaks: true }));
  }

  private convertHtmlToMarkdownForEditor(html: string): string {
    if (!html.trim()) {
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(this.stripWrappingHtmlFence(html), 'text/html');
    const markdown = this.nodeToMarkdown(doc.body, { listLevel: 0, olIndex: 1 }).trim();
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
        const codeText = element.textContent?.replace(/\r\n?/g, '\n').trim() || '';
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
        return Array.from(element.children)
          .map((child) =>
            this.nodeToMarkdown(child, {
              listLevel: context.listLevel + 1,
              listType: 'ul',
              olIndex: 1,
            }),
          )
          .join('') + '\n';
      }
      case 'ol': {
        return Array.from(element.children)
          .map((child, index) =>
            this.nodeToMarkdown(child, {
              listLevel: context.listLevel + 1,
              listType: 'ol',
              olIndex: index + 1,
            }),
          )
          .join('') + '\n';
      }
      case 'li': {
        const prefix = context.listType === 'ol' ? `${context.olIndex}. ` : '- ';
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

    if (this.contentEditorMode === 'html') {
      this.htmlPreviewSrcdoc = this.sanitizer.bypassSecurityTrustHtml(
        this.documentRender.buildHtmlPreviewSrcdoc(
          payload.contentMarkup,
          payload.exportStylesheet,
          this.buildDocumentExtras(input.documentTitle),
        ),
      );
    } else {
      this.htmlPreviewSrcdoc = '';
    }

    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(payload.bodyHtml);
    this.cdRef.detectChanges();

    this.wordCount = content
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    this.characterCount = content.length;
  }

  private buildRenderInput(
    content: string,
    contentEditorMode: ContentEditorMode = this.contentEditorMode,
  ): DocumentRenderInput {
    const title = String(this.documentForm.get('title')?.value ?? 'Documento');
    const coverConfig =
      this.coverEditor?.getConfig() ??
      this.toolsModal?.coverEditor?.getConfig() ??
      this.coverConfig ??
      { enabled: false };
    const signatureConfig =
      this.signatureEditor?.getConfig() ??
      this.toolsModal?.signatureEditor?.getConfig() ??
      this.signatureConfig ??
      { enabled: false };
    const headerFooterConfig =
      this.headerFooterEditor?.getConfig() ??
      this.toolsModal?.headerFooterEditor?.getConfig() ??
      this.headerFooterConfig ??
      { enabled: false };

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
      coverPanelEnabled: this.coverPanelEnabled,
      signaturePanelEnabled: this.signaturePanelEnabled,
      headerFooterPanelEnabled: this.headerFooterPanelEnabled,
      documentTitle: title,
      isCorporateCoverEnabled: this.isCorporateCoverEnabled(),
    };
  }

  private buildDocumentExtras(documentTitle?: string) {
    const input = this.buildRenderInput(
      this.documentForm.get('content')?.value || '',
    );
    return {
      coverConfig: input.coverConfig,
      signatureConfig: input.signatureConfig,
      headerFooterConfig: input.headerFooterConfig,
      coverPanelEnabled: input.coverPanelEnabled,
      signaturePanelEnabled: input.signaturePanelEnabled,
      headerFooterPanelEnabled: input.headerFooterPanelEnabled,
      documentTitle,
    };
  }

  private buildExportPayload(contentEditorMode: ContentEditorMode = this.contentEditorMode) {
    const content = this.documentForm.get('content')?.value || '';
    const input = this.buildRenderInput(content, contentEditorMode);
    return this.documentRender.buildPayload(input);
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

  private buildPdfHtmlForPreview(source: PdfPreviewSource): string {
    const content = this.documentForm.get('content')?.value || '';
    const title = String(this.documentForm.get('title')?.value ?? 'Documento');
    const mode = this.resolvePdfPreviewMode(source);
    const input = this.buildRenderInput(content, mode);
    const payload = this.documentRender.buildPayload(input);

    if (source === 'html' || mode === 'html') {
      return this.documentRender.buildHtmlPreviewSrcdoc(
        payload.contentMarkup,
        payload.exportStylesheet,
        {
          coverConfig: input.coverConfig,
          signatureConfig: input.signatureConfig,
          headerFooterConfig: input.headerFooterConfig,
          coverPanelEnabled: input.coverPanelEnabled,
          signaturePanelEnabled: input.signaturePanelEnabled,
          headerFooterPanelEnabled: input.headerFooterPanelEnabled,
          documentTitle: input.documentTitle,
        },
      );
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style id="document-generator-preview-css">
${payload.previewStylesheet}
  </style>
</head>
<body class="document-create-shell">
  <main class="document-preview-pane markdown-preview" style="${this.previewPaneStyleAttribute()}">
${payload.bodyHtml}
  </main>
</body>
</html>`;
  }

  private previewPaneStyleAttribute(): string {
    return Object.entries(this.previewPaneStyle)
      .map(([property, value]) => {
        const cssProperty = property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
        return `${cssProperty}: ${String(value).replace(/"/g, '&quot;')}`;
      })
      .join('; ');
  }

  private async generatePdfBlob(
    title: string,
    source: PdfPreviewSource = 'current',
  ): Promise<Blob> {
    const html = this.buildPdfHtmlForPreview(source);
    const pdfMode = this.resolvePdfPreviewMode(source);
    try {
      return await this.documentPdfApi.exportPdf({
        title,
        html,
      });
    } catch (backendError) {
      console.warn('Backend PDF failed, falling back to client renderer', backendError);
      const formValue = this.documentForm.value;
      const client = this.clients.find((c) => c.id === formValue.clientId);
      const backgroundSettings = this.documentBackgroundSettings();
      return this.pdfService.generateMarkdownPdf({
        content: this.documentRender.getRenderableContentForPdf(
          String(formValue.content ?? ''),
          pdfMode,
          this.isCorporateCoverEnabled(),
        ),
        title,
        date: formValue.date
          ? String(formValue.date)
          : new Date().toISOString().split('T')[0],
        client: client?.name || 'Josanz ERP',
        subtitle: client?.name || 'Josanz ERP',
        pdfStyleId: this.selectedPdfStyle,
        contentEditorMode: pdfMode,
        quickStylePreset: this.selectedQuickStylePreset,
        customCss: this.documentRender.customCssForDocument(
          this.buildRenderInput(String(formValue.content ?? ''), pdfMode),
        ),
        coverConfig: this.coverConfig?.enabled ? this.coverConfig : undefined,
        signatureConfig: this.signatureConfig?.enabled
          ? this.signatureConfig
          : undefined,
        headerFooterConfig: this.headerFooterConfig?.enabled
          ? this.headerFooterConfig
          : undefined,
        ...backgroundSettings,
      });
    }
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
     // Use the same CSS as PDF export for consistency
     const css = resolvePdfGenerationCss(this.pdfExportCustomCss(), this.documentBackgroundSettings());
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
    <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0 0 16px; color: ${c.textColor};">${c.title || 'Tótulo'}</h1>
    ${c.subtitle ? `<p style="font-size: 1.1rem; opacity: 0.9; margin: 0 0 24px; color: ${c.textColor};">${c.subtitle}</p>` : ''}
    ${c.showDivider ? `<div style="width: 80px; height: 4px; background: ${c.textColor}; opacity: 0.5; border-radius: 4px; margin: ${c.layout === 'left-aligned' ? '0 0 24px' : '0 auto 24px'};"></div>` : ''}
    <p style="font-size: 0.9rem; opacity: 0.85; color: ${c.textColor};">
      ${[c.showAuthor && c.author ? c.author : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(' ó ')}
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

  handleToolbarFormatAction(action: string): void {
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
    }
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
    }
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

  hasActiveModal(): boolean {
    return this.showCoverEditor || 
           this.showSignatureEditor || 
           this.showHeaderFooterEditor || 
           this.showTableBuilder || 
           this.showImageInsert;
  }

  activeToolModalTitle(): string {
    if (this.showCoverEditor) return 'Portada del Documento';
    if (this.showSignatureEditor) return 'Bloque de Firmas';
    if (this.showHeaderFooterEditor) return 'Encabezado y Pie de Pagina';
    if (this.showTableBuilder) return 'Constructor de Tablas';
    if (this.showImageInsert) return 'Insertar Imagen';
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
    return '';
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
        this.insertMarkdown('> ?? **Info:** ', '');
        break;
      case 'callout-warning':
        this.insertMarkdown('> ?? **Advertencia:** ', '');
        break;
      case 'callout-success':
        this.insertMarkdown('> ? **óxito:** ', '');
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
    const coverEditor = this.coverEditor ?? this.toolsModal?.coverEditor;
    if (coverEditor) {
      const coverHtml = coverEditor.exportToHtml();
      const currentContent = this.documentForm.get('content')?.value || '';
      const separator = currentContent.trim() ? '\n\n' : '';
      if (this.contentEditorMode === 'html') {
        this.documentForm.patchValue({ content: currentContent + separator + coverHtml });
      } else {
        const coverMd = coverEditor.exportToMarkdown();
        this.documentForm.patchValue({ content: currentContent + separator + coverMd });
      }
      this.updatePreview();
      this.syncAssistantFromFormNow();
    }
  }

  insertSignatureIntoDocument(): void {
    const signatureEditor = this.signatureEditor ?? this.toolsModal?.signatureEditor;
    if (signatureEditor) {
      const signatureHtml = signatureEditor.exportToHtml();
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
      this.documentForm.patchValue({ content: currentContent + separator + tableContent });
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
    const coverEditor = this.coverEditor ?? this.toolsModal?.coverEditor;
    const signatureEditor = this.signatureEditor ?? this.toolsModal?.signatureEditor;

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
        signatureConfig: this.signatureConfig?.enabled ? this.signatureConfig : undefined,
        headerFooterConfig: this.headerFooterConfig?.enabled ? this.headerFooterConfig : undefined,
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
    const payload = this.buildExportPayload();
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
    ${payload.previewStylesheet}
  </style>
</head>
<body>
  <main class="markdown-preview">
    ${payload.bodyHtml}
  </main>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
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

if (format === 'pdf' || format === 'pdf-markdown' || format === 'pdf-html') {
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
           'No se pudo generar el PDF. Revisa el contenido e intóntalo de nuevo.',
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
        `No se pudo exportar a ${format.toUpperCase()}. Revisa el contenido e intóntalo de nuevo.`,
      );
    }
  }


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

    input.value = '';
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
        const backgroundSettings = this.documentBackgroundSettings();

        const coverCfg = this.coverConfig?.enabled ? this.coverConfig : undefined;
        const sigCfg = this.signatureConfig?.enabled ? this.signatureConfig : undefined;
        const hfCfg = this.headerFooterConfig?.enabled ? this.headerFooterConfig : undefined;

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
          'No se pudo generar el documento. Revisa los datos e intóntalo de nuevo.';
      } finally {
        this.isGenerating = false;
      }
    }
  }
}




