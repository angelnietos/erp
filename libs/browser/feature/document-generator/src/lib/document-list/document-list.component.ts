import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';
import {
  DocumentListItem,
  DocumentPersistenceService,
} from '../services/document-persistence.service';
import { DocumentExportOrchestratorService } from '../services/document-export-orchestrator.service';
import {
  downloadPdfBlob,
} from '../utils/document-preview-css';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <nav class="dg-breadcrumb" aria-label="Ubicación">
        <svg
          class="w-4 h-4 shrink-0 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
          />
        </svg>
        <span class="dg-breadcrumb__current">Documentos</span>
      </nav>

      <div class="dg-panel dg-hero dg-list-hero">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 class="dg-hero__title">Documentos generados</h1>
            <p class="dg-hero__lead">
              Historial en este navegador (IndexedDB): borradores y PDF
              generados.
            </p>
            <p class="dg-chip dg-chip--brand">
              {{ documents.length }}
              {{ documents.length === 1 ? 'documento' : 'documentos' }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              routerLink="/documents/settings/ai"
              class="dg-btn dg-btn-secondary"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              Motor IA
            </a>
            <a routerLink="/documents/create" class="dg-btn dg-btn-primary">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Crear documento
            </a>
          </div>
        </div>
      </div>

      @if (documents.length > 0) {
        <div class="dg-doc-grid">
          @for (doc of documents; track doc.id) {
            <article class="dg-doc-card">
              <div class="flex flex-wrap gap-2">
                <span class="dg-badge" [class]="getTypeBadgeClass(doc.type)">
                  {{ getTypeLabel(doc.type) }}
                </span>
                @if (doc.isDraft) {
                  <span class="dg-chip">Borrador</span>
                }
              </div>

              <h3 class="dg-doc-card__title">
                {{ doc.title || 'Documento sin título' }}
              </h3>

              <div class="space-y-2">
                <p class="dg-doc-card__meta flex items-center gap-2">
                  <svg
                    class="w-4 h-4 shrink-0 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {{ doc.client }}
                </p>
                <p class="dg-doc-card__meta flex items-center gap-2">
                  <svg
                    class="w-4 h-4 shrink-0 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 012 0z"
                    />
                  </svg>
                  {{ doc.date | date: 'mediumDate' }}
                </p>
              </div>

              <div class="dg-doc-card__actions">
                  @if (doc.isDraft) {
                    <a
                      [routerLink]="['/documents', 'create', 'edit', doc.id]"
                      class="dg-btn dg-btn-secondary dg-btn-sm flex-1 min-w-[7rem]"
                    >
                      <svg
                        class="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Continuar
                    </a>
                    <a
                      [routerLink]="['/documents/analysis']"
                      [queryParams]="{ doc: doc.id }"
                      class="dg-btn dg-btn-secondary dg-btn-sm"
                      title="Analizar borrador con IA"
                    >
                      Analizar
                    </a>
                  } @else {
                    <a
                      [routerLink]="['/documents/analysis']"
                      [queryParams]="{ doc: doc.id }"
                      class="dg-btn dg-btn-secondary dg-btn-sm"
                      title="Analizar con IA"
                    >
                      Analizar
                    </a>
                    <a
                      [routerLink]="['/documents/preview', doc.id]"
                      class="dg-btn dg-btn-secondary dg-btn-sm flex-1 min-w-[7rem]"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Ver
                    </a>
                  }
                  @if (!doc.isDraft) {
                    <button
                      type="button"
                      (click)="downloadDocument(doc)"
                      class="dg-btn dg-btn-primary dg-btn-sm"
                      title="Descargar PDF"
                      aria-label="Descargar PDF"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  }
                  <button
                    type="button"
                    (click)="removeDocument(doc)"
                    class="dg-btn dg-btn-danger dg-btn-sm"
                    title="Eliminar del historial"
                    aria-label="Eliminar del historial"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
            </article>
          }
        </div>
      }

      @if (documents.length === 0) {
        <div class="dg-empty-state">
          <svg
            class="dg-empty-state__icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 class="dg-empty-state__title">No hay documentos aún</h3>
          <p class="dg-empty-state__desc">
            Crea uno desde el editor y genera el PDF: aparecerá aquí para
            previsualizarlo y descargarlo.
          </p>
          <div class="mt-6 space-y-4">
            <a routerLink="/documents/create" class="dg-btn dg-btn-primary">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Crear primer documento
            </a>
            <div
              class="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm"
            >
              <a
                routerLink="/documents/settings/ai"
                class="text-brand hover:underline font-medium"
                >Configurar motor de IA</a
              >
                <span class="text-muted hidden sm:inline">·</span>
                <button
                  type="button"
                  (click)="openFloatingHelp()"
                  class="dg-btn dg-btn-ghost dg-btn-sm p-0 min-h-0 border-0"
                >
                  Abrir burbuja de ayuda
                </button>
              </div>
            </div>
        </div>
      }
    </div>
  `,
})
export class DocumentListComponent implements OnInit {
  documents: DocumentListItem[] = [];
  private readonly router = inject(Router);
  private readonly assistantCtx = inject(AssistantContextService);
  private readonly persistence = inject(DocumentPersistenceService);
  private readonly exportOrchestrator = inject(DocumentExportOrchestratorService);

  openFloatingHelp(): void {
    this.assistantCtx.openAssistant();
  }

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        filter((e) => {
          const path = e.urlAfterRedirects.split('?')[0];
          return path === '/documents/list' || path.endsWith('/documents/list');
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        void this.refreshList();
      });
  }

  ngOnInit(): void {
    void this.refreshList();
  }

  private async refreshList(): Promise<void> {
    try {
      await this.persistence.whenReady();
      this.documents = await this.persistence.listSummaries();
    } catch {
      this.documents = [];
    }
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

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'quote':
        return 'dg-badge--quote';
      case 'proposal':
        return 'dg-badge--proposal';
      case 'documentation':
        return 'dg-badge--contract';
      case 'architecture':
        return 'dg-badge--architecture';
      case 'resume':
        return 'dg-badge--default';
      case 'interview':
        return 'dg-badge--proposal';
      case 'offer':
        return 'dg-badge--invoice';
      default:
        return 'dg-badge--default';
    }
  }

  async downloadDocument(doc: DocumentListItem): Promise<void> {
    try {
      await this.persistence.whenReady();
      const data = (await this.persistence.getPayload(doc.id)) as Record<
        string,
        unknown
      > | null;
      if (!data) {
        return;
      }

      const title = (data['title'] as string) || 'documento';
      const content = data['content'];

      if (typeof content === 'string' && content.trim()) {
        const blob = await this.exportOrchestrator.exportPdfFromPersisted(
          data,
          title,
        );
        downloadPdfBlob(blob, `${title}.pdf`);
        return;
      }

      const pdfBytes = data['pdfBytes'];
      if (!Array.isArray(pdfBytes) || pdfBytes.length === 0) {
        return;
      }

      const blob = new Blob([new Uint8Array(pdfBytes as number[])], {
        type: 'application/pdf',
      });
      downloadPdfBlob(blob, `${title}.pdf`);
    } catch (e) {
      console.error(e);
    }
  }

  async removeDocument(doc: DocumentListItem): Promise<void> {
    if (
      !confirm(
        `¿Eliminar «${doc.title || 'este documento'}» del historial de este dispositivo?`,
      )
    ) {
      return;
    }
    try {
      await this.persistence.whenReady();
      await this.persistence.delete(doc.id);
      await this.refreshList();
    } catch (e) {
      console.error(e);
    }
  }
}
