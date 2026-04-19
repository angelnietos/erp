import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface DocumentListItem {
  id: string;
  title: string;
  client: string;
  date: Date;
  type: string;
}

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-secondary">
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
          />
        </svg>
        <span>Documentos</span>
      </nav>

      <!-- Header Section -->
      <div class="bg-surface rounded-2xl shadow-xl border border-soft p-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div class="space-y-2">
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent"
            >
              Documentos generados
            </h1>
            <p class="text-secondary text-lg">
              Gestiona y descarga tus PDF generados en esta sesión
            </p>
            <div class="flex items-center space-x-4 pt-2">
              <div class="flex items-center space-x-2 text-sm text-muted">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{{ documents.length }} documentos</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <a
              routerLink="/documents/settings/ai"
              class="inline-flex items-center justify-center px-4 py-2 border border-soft rounded-xl text-sm font-medium text-primary bg-secondary hover:bg-tertiary hover:border-vibrant transition-all duration-200"
            >
              <svg
                class="w-4 h-4 mr-2 shrink-0"
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
              Motor IA
            </a>
            <a
              routerLink="/documents/create"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand to-brand text-bg-secondary font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

      <!-- Documents Grid -->
      @if (documents.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (doc of documents; track doc.id) {
            <div
              class="group bg-surface rounded-2xl shadow-lg hover:shadow-2xl border border-soft hover:border-vibrant transition-all duration-300 transform hover:-translate-y-1"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                      [class]="getTypeBadgeClass(doc.type)"
                    >
                      <svg
                        class="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 011.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ getTypeLabel(doc.type) }}
                    </span>
                    <h3
                      class="text-lg font-semibold text-primary mt-2 line-clamp-2 group-hover:text-brand transition-colors"
                    >
                      {{ doc.title || 'Documento sin título' }}
                    </h3>
                  </div>
                </div>

                <div class="space-y-3 mb-6">
                  <div class="flex items-center text-sm text-secondary">
                    <svg
                      class="w-4 h-4 mr-2 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{{ doc.client }}</span>
                  </div>
                  <div class="flex items-center text-sm text-secondary">
                    <svg
                      class="w-4 h-4 mr-2 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 012 0z"
                      />
                    </svg>
                    <span>{{ doc.date | date: 'mediumDate' }}</span>
                  </div>
                </div>

                <div class="flex space-x-2">
                  <a
                    [routerLink]="['/documents/preview', doc.id]"
                    class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-soft rounded-lg text-sm font-medium text-primary bg-secondary hover:bg-tertiary hover:border-vibrant transition-all duration-200"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
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
                    Ver
                  </a>
                  <button
                    type="button"
                    (click)="downloadDocument(doc)"
                    class="inline-flex items-center px-4 py-2 bg-success text-bg-secondary rounded-lg hover:shadow-lg transition-all duration-200 shadow-md"
                    title="Descargar PDF"
                  >
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (documents.length === 0) {
        <div
          class="bg-surface rounded-2xl shadow-xl border border-soft p-12"
        >
          <div class="text-center max-w-md mx-auto">
            <div
              class="w-24 h-24 bg-brand-ambient rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                class="w-12 h-12 text-brand"
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
            <h3 class="text-2xl font-bold text-primary mb-3">
              No hay documentos aún
            </h3>
            <p class="text-secondary mb-8 text-lg">
              Crea uno desde el editor y genera el PDF: aparecerá aquí para
              previsualizarlo y descargarlo.
            </p>
            <div class="space-y-4">
              <a
                routerLink="/documents/create"
                class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand to-brand text-bg-secondary font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  class="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
              <div class="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                <a
                  routerLink="/documents/settings/ai"
                  class="text-brand hover:underline font-medium"
                  >Configurar motor de IA</a
                >
                <span class="text-muted hidden sm:inline">·</span>
                <button
                  type="button"
                  (click)="openFloatingHelp()"
                  class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center bg-transparent border-none cursor-pointer p-0"
                >
                  Abrir burbuja de ayuda
                </button>
              </div>
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
        this.documents = this.loadFromLocalStorage();
      });
  }

  ngOnInit(): void {
    this.documents = this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): DocumentListItem[] {
    const items: DocumentListItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('document_')) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw) as Record<string, unknown>;
        const id = key.replace('document_', '');
        const title =
          (typeof data['title'] === 'string' && data['title']) ||
          'Sin título';
        const client =
          (typeof data['client'] === 'string' && data['client']) ||
          'Cliente';
        const type =
          (typeof data['type'] === 'string' && data['type']) ||
          'documentation';
        let dateVal: Date;
        if (data['date'] != null) {
          const d = new Date(String(data['date']));
          dateVal = isNaN(d.getTime()) ? new Date(+id) : d;
        } else {
          dateVal = new Date(+id);
        }
        items.push({ id, title, client, date: dateVal, type });
      } catch {
        /* clave corrupta */
      }
    }
    return items.sort((a, b) => +b.id - +a.id);
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
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25';
      case 'proposal':
        return 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25';
      case 'documentation':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25';
      case 'architecture':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/25';
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/25';
    }
  }

  downloadDocument(doc: DocumentListItem): void {
    const raw = localStorage.getItem(`document_${doc.id}`);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { pdfBytes?: number[]; title?: string };
      if (!data.pdfBytes?.length) return;
      const u8 = new Uint8Array(data.pdfBytes);
      const blob = new Blob([u8], { type: 'application/pdf' });
      const a = document.createElement('a');
      const safe = (data.title || 'documento').replace(/[/\\?%*:|"<>]/g, '-');
      a.href = URL.createObjectURL(blob);
      a.download = `${safe}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
    }
  }
}
