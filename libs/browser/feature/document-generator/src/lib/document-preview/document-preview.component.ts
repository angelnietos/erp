import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { DocumentPersistenceService } from '../services/document-persistence.service';
import { DocumentExportOrchestratorService } from '../services/document-export-orchestrator.service';
import {
  buildPreviewBackgroundOverrideCss,
  buildPreviewPaneStyle,
  downloadPdfBlob,
  readPdfBackgroundSettings,
  resolvePdfGenerationCss,
} from '../utils/document-preview-css';
import mermaid from 'mermaid';
import { parseMarkdownToHtml } from '../utils/markdown-parse.util';

/** Payload persistido o en state de navegación (campos variables por tipo). */
interface DocumentPreviewPayload {
  id?: string;
  type?: string;
  title?: string;
  client?: string;
  date?: string | Date;
  content?: unknown;
  architectureDiagram?: string;
  dataFlow?: string;
  projectName?: string;
  totalAmount?: number | string;
  description?: string;
  executiveSummary?: string;
  objectives?: string;
  scope?: string;
  deliverables?: string;
  timeline?: string;
  pricing?: string;
  terms?: string;
  systemOverview?: string;
  components?: string;
  technologies?: string;
  apis?: string;
  deployment?: string;
  customCss?: string;
  pdfStyleId?: string;
  quickStylePreset?: string;
  contentEditorMode?: 'markdown' | 'html' | 'plain';
  pdfBackgroundMode?: 'theme' | 'color' | 'corporate';
  pdfBackgroundColor?: string;
  pdfBackgroundImageUrl?: string;
  documentPaperColor?: string;
  documentTextColor?: string;
  documentMutedColor?: string;
  documentAccentColor?: string;
  documentBorderColor?: string;
  pdfBytes?: number[];
  coverConfig?: Record<string, unknown>;
  signatureConfig?: Record<string, unknown>;
  headerFooterConfig?: Record<string, unknown>;
}

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <nav class="dg-breadcrumb" aria-label="Ubicación">
        <a routerLink="/documents/list">Documentos</a>
        <svg
          class="w-4 h-4 shrink-0 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="dg-breadcrumb__current">Vista previa</span>
      </nav>

      <div class="dg-panel dg-hero">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div class="space-y-2">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h1 class="dg-hero__title">Vista previa del documento</h1>
            <p class="dg-hero__lead">
              Revisa el contenido completo antes de descargar tu PDF.
            </p>
            <span class="dg-chip">Listo para descargar</span>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            @if (downloadError) {
              <p class="dg-alert-error text-sm w-full sm:col-span-2">{{ downloadError }}</p>
            }
            <button
              type="button"
              (click)="downloadDocument()"
              [disabled]="isDownloadingPdf"
              class="dg-btn dg-btn-primary"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {{ isDownloadingPdf ? 'Generando PDF…' : 'Descargar PDF' }}
            </button>
            <button
              type="button"
              (click)="goBack()"
              class="dg-btn dg-btn-secondary"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </button>
          </div>
        </div>
      </div>

      <div class="dg-panel">
        <div class="space-y-6">
          <div class="dg-preview-header">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
              <h2 class="text-xl font-bold text-primary">
                {{ document?.title || 'Documento' }}
              </h2>
              <span class="dg-badge" [class]="getTypeBadgeClass(document?.type)">
                {{ getTypeLabel(document?.type) }}
              </span>
            </div>

            <div class="dg-preview-meta">
              <div>
                <span class="font-semibold text-primary">Cliente:</span>
                {{ document?.client }}
              </div>
              <div>
                <span class="font-semibold text-primary">Fecha:</span>
                {{ document?.date | date: 'medium' }}
              </div>
            </div>
          </div>

          <div class="prose max-w-none">
            @if (documentContentHtml) {
              <section class="space-y-3">
                <h3 class="dg-section-head__title text-base">
                  Contenido del documento
                </h3>
                <div
                  class="document-preview-render markdown-preview dg-preview-render"
                  [ngStyle]="previewContentStyle"
                  [innerHTML]="documentContentHtml"
                ></div>
              </section>
            }

            <div *ngIf="document?.type === 'quote'" class="space-y-6">
              <div>
                <h3 class="dg-section-head__title text-base mb-3">
                  Presupuesto del proyecto
                </h3>
                <div class="dg-callout dg-callout--neutral space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span class="dg-callout__label">Proyecto</span>
                      <p class="text-primary mt-1">{{ document?.projectName }}</p>
                    </div>
                    <div>
                      <span class="dg-callout__label">Monto total</span>
                      <p class="text-primary mt-1 text-lg font-bold">
                        {{
                          document?.totalAmount
                            | currency: 'EUR' : 'symbol' : '1.2-2'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span class="dg-callout__label">Descripción</span>
                <div class="dg-callout dg-callout--neutral mt-1">
                  <p class="text-primary whitespace-pre-wrap">
                    {{ document?.description }}
                  </p>
                </div>
              </div>
            </div>

            <div *ngIf="document?.type === 'proposal'" class="space-y-6">
              <div *ngIf="document?.executiveSummary">
                <h3 class="dg-section-head__title text-base mb-3">
                  Resumen ejecutivo
                </h3>
                <div class="dg-callout dg-callout--info">
                  <p class="text-primary whitespace-pre-wrap">
                    {{ document?.executiveSummary }}
                  </p>
                </div>
              </div>

              <div
                *ngIf="document?.objectives"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <span class="dg-callout__label">Objetivos</span>
                  <div class="dg-callout dg-callout--neutral mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.objectives }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.scope">
                  <span class="dg-callout__label">Alcance del proyecto</span>
                  <div class="dg-callout dg-callout--neutral mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.scope }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                *ngIf="document?.deliverables"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <span class="dg-callout__label">Entregables</span>
                  <div class="dg-callout dg-callout--success mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.deliverables }}
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div *ngIf="document?.timeline">
                    <span class="dg-callout__label">Cronograma</span>
                    <div class="dg-callout dg-callout--accent mt-1">
                      <p class="text-primary font-medium text-sm">
                        {{ document?.timeline }}
                      </p>
                    </div>
                  </div>

                  <div *ngIf="document?.pricing">
                    <span class="dg-callout__label">Precios</span>
                    <div class="dg-callout dg-callout--warning mt-1">
                      <p class="text-primary font-medium text-sm">
                        {{ document?.pricing }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="document?.terms">
                <span class="dg-callout__label">Términos y condiciones</span>
                <div class="dg-callout dg-callout--danger mt-1">
                  <p class="text-primary whitespace-pre-wrap text-sm">
                    {{ document?.terms }}
                  </p>
                </div>
              </div>
            </div>

            <div
              *ngIf="document?.type === 'documentation' && !documentContentHtml"
              class="space-y-6"
            >
              <div>
                <h3 class="dg-section-head__title text-base mb-3">
                  Contenido del documento
                </h3>
                <div class="dg-callout dg-callout--neutral">
                  <div
                    class="prose prose-sm max-w-none"
                    [innerHTML]="documentationHtml"
                  ></div>
                </div>
              </div>
            </div>

            <div *ngIf="document?.type === 'architecture'" class="space-y-8">
              <div *ngIf="document?.systemOverview">
                <h3 class="dg-section-head__title text-base mb-3">
                  Resumen del sistema
                </h3>
                <div class="dg-callout dg-callout--info">
                  <p class="text-primary whitespace-pre-wrap">
                    {{ document?.systemOverview }}
                  </p>
                </div>
              </div>

              <div #diagramsContainer class="space-y-6">
                <div *ngIf="document?.architectureDiagram" class="space-y-4">
                  <span class="dg-callout__label">Diagrama de arquitectura</span>
                  <div class="dg-mermaid-box">
                    <div id="architecture-diagram" class="flex justify-center">
                      <div class="text-muted text-sm">Renderizando diagrama…</div>
                    </div>
                  </div>
                  <details class="dg-details text-sm">
                    <summary>Ver código Mermaid</summary>
                    <pre class="dg-code-block">{{ document?.architectureDiagram }}</pre>
                  </details>
                </div>

                <div *ngIf="document?.dataFlow" class="space-y-4">
                  <span class="dg-callout__label">Diagrama de flujo de datos</span>
                  <div class="dg-mermaid-box">
                    <div id="dataflow-diagram" class="flex justify-center">
                      <div class="text-muted text-sm">Renderizando diagrama…</div>
                    </div>
                  </div>
                  <details class="dg-details text-sm">
                    <summary>Ver código Mermaid</summary>
                    <pre class="dg-code-block">{{ document?.dataFlow }}</pre>
                  </details>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="document?.components">
                  <span class="dg-callout__label">Componentes del sistema</span>
                  <div class="dg-callout dg-callout--success mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.components }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.technologies">
                  <span class="dg-callout__label">Tecnologías utilizadas</span>
                  <div class="dg-callout dg-callout--accent mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm font-medium">
                      {{ document?.technologies }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="document?.apis">
                  <span class="dg-callout__label">APIs y endpoints</span>
                  <div class="dg-callout dg-callout--warning mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm font-mono">
                      {{ document?.apis }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.deployment">
                  <span class="dg-callout__label">Estrategia de despliegue</span>
                  <div class="dg-callout dg-callout--info mt-1">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.deployment }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentPreviewComponent implements OnInit, AfterViewInit {
  document: DocumentPreviewPayload | null = null;
  isDownloadingPdf = false;
  downloadError = '';
  @ViewChild('diagramsContainer', { static: false })
  diagramsContainer!: ElementRef;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly persistence = inject(DocumentPersistenceService);
  private readonly exportOrchestrator = inject(DocumentExportOrchestratorService);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    try {
      await this.persistence.whenReady();
      const payload = await this.persistence.getPayload(id);
      if (payload) {
        this.document = payload;
        this.applyDocumentCss();
        return;
      }
    } catch {
      /* IndexedDB no disponible o registro vacío */
    }
    const legacy =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(`document_${id}`)
        : null;
    if (legacy) {
      try {
        this.document = JSON.parse(legacy);
        this.applyDocumentCss();
        return;
      } catch {
        /* corrupto */
      }
    }
    this.document = {
      id,
      type: 'quote',
      title: 'Presupuesto Proyecto ABC',
      client: 'Cliente A',
      date: new Date(),
      projectName: 'Proyecto ABC',
      totalAmount: 5000,
      description: 'Descripción del presupuesto...',
      content: '<p>Contenido del documento...</p>',
    };
    this.applyDocumentCss();
  }

  /** Markdown guardado → HTML para vista previa (GFM: tablas, listas, etc.). */
  get documentationHtml(): string {
    const doc = this.document;
    if (!doc?.content || doc.type !== 'documentation') {
      return '';
    }
    const raw = doc.content as string;
    if (typeof raw !== 'string') {
      return '';
    }
    if (/<[a-z][\s\S]*>/i.test(raw.trim())) {
      return raw;
    }
    try {
      return parseMarkdownToHtml(raw);
    } catch {
      return '';
    }
  }

  get previewContentStyle(): Record<string, string> {
    return buildPreviewPaneStyle(
      readPdfBackgroundSettings(
        this.document as unknown as Record<string, unknown>,
      ),
    );
  }

  get documentContentHtml(): string {
    const raw = this.document?.content;
    if (typeof raw !== 'string' || !raw.trim()) {
      return '';
    }
    if (/<[a-z][\s\S]*>/i.test(raw.trim())) {
      return raw;
    }
    try {
      return parseMarkdownToHtml(raw);
    } catch {
      return raw;
    }
  }

  ngAfterViewInit() {
    // Renderizar diagramas Mermaid si existen
    if (this.document?.type === 'architecture' && this.diagramsContainer) {
      this.renderMermaidDiagrams();
    }
  }

  private async renderMermaidDiagrams() {
    if (!this.document) return;

    try {
      // Configurar Mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });

      // Renderizar diagrama de arquitectura si existe
      if (this.document.architectureDiagram) {
        const architectureContainer =
          this.diagramsContainer.nativeElement.querySelector(
            '#architecture-diagram',
          );
        if (architectureContainer) {
          const { svg } = await mermaid.render(
            'architecture-diagram-svg',
            this.document.architectureDiagram,
          );
          architectureContainer.innerHTML = svg;
        }
      }

      // Renderizar diagrama de flujo de datos si existe
      if (this.document.dataFlow) {
        const dataFlowContainer =
          this.diagramsContainer.nativeElement.querySelector(
            '#dataflow-diagram',
          );
        if (dataFlowContainer) {
          const { svg } = await mermaid.render(
            'dataflow-diagram-svg',
            this.document.dataFlow,
          );
          dataFlowContainer.innerHTML = svg;
        }
      }
    } catch (error) {
      console.error('Error rendering Mermaid diagrams:', error);
      // Mostrar mensaje de error en lugar del diagrama
      const containers =
        this.diagramsContainer.nativeElement.querySelectorAll(
          '.dg-mermaid-box',
        );
      containers.forEach((container: HTMLElement) => {
        container.innerHTML =
          '<div class="dg-alert-error text-sm p-3">Error al renderizar el diagrama. Verifica la sintaxis Mermaid.</div>';
      });
    }
  }

  getTypeLabel(type: string | undefined): string {
    switch (type ?? '') {
      case 'quote':
        return 'Presupuesto';
      case 'proposal':
        return 'Propuesta';
      case 'documentation':
        return 'Documentación';
      case 'architecture':
        return 'Arquitectura';
      default:
        return type ?? '';
    }
  }

  getTypeBadgeClass(type: string | undefined): string {
    switch (type ?? '') {
      case 'quote':
        return 'dg-badge--quote';
      case 'proposal':
        return 'dg-badge--proposal';
      case 'documentation':
        return 'dg-badge--contract';
      case 'architecture':
        return 'dg-badge--architecture';
      default:
        return 'dg-badge--default';
    }
  }

  async downloadDocument(): Promise<void> {
    const d = this.document;
    if (!d?.id) {
      return;
    }

    this.downloadError = '';
    this.isDownloadingPdf = true;
    this.cdr.markForCheck();
    try {
      if (typeof d.content === 'string' && d.content.trim()) {
        const blob = await this.exportOrchestrator.exportPdfFromPersisted(
          d as unknown as Record<string, unknown>,
          d.title || 'Documento',
        );
        downloadPdfBlob(blob, `${d.title || 'documento'}.pdf`);
        return;
      }

      if (Array.isArray(d.pdfBytes) && d.pdfBytes.length > 0) {
        const blob = new Blob([new Uint8Array(d.pdfBytes)], {
          type: 'application/pdf',
        });
        downloadPdfBlob(blob, `${d.title || 'documento'}.pdf`);
        return;
      }

      void this.router.navigate(['/documents/preview-download', d.id], {
        state: { document: d },
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      this.downloadError =
        'No se pudo generar el PDF. Revisa el contenido e inténtalo de nuevo.';
    } finally {
      this.isDownloadingPdf = false;
      this.cdr.markForCheck();
    }
  }

  goBack() {
    this.router.navigate(['/documents/list']);
  }

  private applyDocumentCss(): void {
    const styleEl =
      document.getElementById('document-preview-custom-css') ??
      this.createPreviewStyleEl();
    const background = readPdfBackgroundSettings(
      this.document as unknown as Record<string, unknown>,
    );
    styleEl.textContent = [
      resolvePdfGenerationCss(this.document?.customCss, background),
      buildPreviewBackgroundOverrideCss(background),
    ].join('\n\n');
  }

  private createPreviewStyleEl(): HTMLStyleElement {
    const el = document.createElement('style');
    el.id = 'document-preview-custom-css';
    el.setAttribute('data-document-preview-css', 'true');
    document.head.appendChild(el);
    return el;
  }
}
