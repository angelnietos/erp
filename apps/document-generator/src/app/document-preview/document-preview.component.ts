import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PdfGenerationService } from '../services/pdf-generation.service';
import mermaid from 'mermaid';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule],
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
        <span class="text-primary font-medium">Vista Previa</span>
      </nav>

      <!-- Header -->
      <div class="bg-surface rounded-2xl shadow-xl border border-soft p-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div class="space-y-2">
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent"
            >
              Vista Previa del Documento
            </h1>
            <p class="text-secondary text-lg">
              Revisa el contenido completo antes de descargar tu PDF
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
                    d="M9 12l2 2 4-4M21 12c0 4.418-3.582 8-8 8a8.963 8.963 0 01-5.586-2.068A8.963 8.963 0 015 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
                <span>Documento listo para descargar</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              (click)="downloadDocument()"
              class="inline-flex items-center px-6 py-4 bg-success text-bg-secondary font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Descargar PDF
            </button>
            <button
              (click)="goBack()"
              class="inline-flex items-center px-6 py-4 border border-soft rounded-xl text-sm font-medium text-primary bg-secondary hover:bg-tertiary hover:border-vibrant transition-all duration-200"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a Documentos
            </button>
          </div>
        </div>
      </div>

      <!-- Document Preview -->
      <div
        class="bg-surface rounded-2xl shadow-xl border border-soft p-8 overflow-hidden"
      >
        <div class="space-y-6">
          <!-- Header del documento -->
          <div class="border-b pb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-primary">
                {{ document?.title || 'Documento' }}
              </h2>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                [class]="getTypeBadgeClass(document?.type)"
              >
                {{ getTypeLabel(document?.type) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm text-secondary">
              <div>
                <span class="font-medium">Cliente:</span> {{ document?.client }}
              </div>
              <div>
                <span class="font-medium">Fecha:</span>
                {{ document?.date | date: 'medium' }}
              </div>
            </div>
          </div>

          <!-- Contenido del documento -->
          <div class="prose max-w-none">
            <!-- Presupuesto -->
            <div *ngIf="document?.type === 'quote'" class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-primary mb-3">
                  Presupuesto del Proyecto
                </h3>
                <div class="bg-tertiary rounded-lg p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="font-medium text-gray-700">Proyecto:</span>
                      <p class="text-primary mt-1">
                        {{ document?.projectName }}
                      </p>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700"
                        >Monto Total:</span
                      >
                      <p
                        class="text-primary mt-1 text-lg font-semibold text-green-600"
                      >
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
                <h4 class="font-medium text-gray-700 mb-2">Descripción:</h4>
                <div class="bg-tertiary rounded-lg p-4">
                  <p class="text-primary whitespace-pre-wrap">
                    {{ document?.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Propuesta Comercial -->
            <div *ngIf="document?.type === 'proposal'" class="space-y-6">
              <div *ngIf="document?.executiveSummary">
                <h3 class="text-lg font-medium text-primary mb-3">
                  Resumen Ejecutivo
                </h3>
                <div
                  class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400"
                >
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
                  <h4 class="font-medium text-gray-700 mb-2">Objetivos</h4>
                  <div class="bg-tertiary rounded-lg p-4">
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.objectives }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.scope">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Alcance del Proyecto
                  </h4>
                  <div class="bg-tertiary rounded-lg p-4">
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
                  <h4 class="font-medium text-gray-700 mb-2">Entregables</h4>
                  <div
                    class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400"
                  >
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.deliverables }}
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div *ngIf="document?.timeline">
                    <h4 class="font-medium text-gray-700 mb-2">Cronograma</h4>
                    <div class="bg-purple-50 rounded-lg p-4">
                      <p class="text-purple-900 font-medium">
                        {{ document?.timeline }}
                      </p>
                    </div>
                  </div>

                  <div *ngIf="document?.pricing">
                    <h4 class="font-medium text-gray-700 mb-2">Precios</h4>
                    <div class="bg-yellow-50 rounded-lg p-4">
                      <p class="text-yellow-900 font-medium">
                        {{ document?.pricing }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="document?.terms">
                <h4 class="font-medium text-gray-700 mb-2">
                  Términos y Condiciones
                </h4>
                <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                  <p class="text-primary whitespace-pre-wrap text-sm">
                    {{ document?.terms }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Documentación Técnica -->
            <div *ngIf="document?.type === 'documentation'" class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-primary mb-3">
                  Contenido del Documento
                </h3>
                <div class="bg-tertiary rounded-lg p-4">
                  <div
                    class="prose prose-sm max-w-none"
                    [innerHTML]="document?.content"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Documentación Arquitectónica -->
            <div *ngIf="document?.type === 'architecture'" class="space-y-8">
              <div *ngIf="document?.systemOverview">
                <h3 class="text-lg font-medium text-primary mb-3">
                  Resumen del Sistema
                </h3>
                <div
                  class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400"
                >
                  <p class="text-primary whitespace-pre-wrap">
                    {{ document?.systemOverview }}
                  </p>
                </div>
              </div>

              <!-- Contenedor para diagramas Mermaid -->
              <div #diagramsContainer class="space-y-6">
                <div *ngIf="document?.architectureDiagram" class="space-y-4">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Diagrama de Arquitectura
                  </h4>
                  <div class="bg-surface border rounded-lg p-4 mermaid-container">
                    <div id="architecture-diagram" class="flex justify-center">
                      <div class="text-muted">Renderizando diagrama...</div>
                    </div>
                  </div>
                  <details class="text-sm">
                    <summary
                      class="cursor-pointer text-secondary hover:text-gray-800"
                    >
                      Ver código Mermaid
                    </summary>
                    <pre
                      class="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs font-mono"
                      >{{ document?.architectureDiagram }}</pre
                    >
                  </details>
                </div>

                <div *ngIf="document?.dataFlow" class="space-y-4">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Diagrama de Flujo de Datos
                  </h4>
                  <div class="bg-surface border rounded-lg p-4 mermaid-container">
                    <div id="dataflow-diagram" class="flex justify-center">
                      <div class="text-muted">Renderizando diagrama...</div>
                    </div>
                  </div>
                  <details class="text-sm">
                    <summary
                      class="cursor-pointer text-secondary hover:text-gray-800"
                    >
                      Ver código Mermaid
                    </summary>
                    <pre
                      class="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs font-mono"
                      >{{ document?.dataFlow }}</pre
                    >
                  </details>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="document?.components">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Componentes del Sistema
                  </h4>
                  <div
                    class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400"
                  >
                    <p class="text-primary whitespace-pre-wrap text-sm">
                      {{ document?.components }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.technologies">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Tecnologías Utilizadas
                  </h4>
                  <div
                    class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400"
                  >
                    <p
                      class="text-purple-900 whitespace-pre-wrap text-sm font-medium"
                    >
                      {{ document?.technologies }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="document?.apis">
                  <h4 class="font-medium text-gray-700 mb-2">
                    APIs y Endpoints
                  </h4>
                  <div
                    class="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400"
                  >
                    <p
                      class="text-primary whitespace-pre-wrap text-sm font-mono"
                    >
                      {{ document?.apis }}
                    </p>
                  </div>
                </div>

                <div *ngIf="document?.deployment">
                  <h4 class="font-medium text-gray-700 mb-2">
                    Estrategia de Despliegue
                  </h4>
                  <div
                    class="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400"
                  >
                    <p class="text-indigo-900 whitespace-pre-wrap text-sm">
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
  document: any = null;
  @ViewChild('diagramsContainer', { static: false })
  diagramsContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pdfService: PdfGenerationService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const stored = localStorage.getItem(`document_${id}`);
    if (stored) {
      this.document = JSON.parse(stored);
    } else {
      // Fallback mock data
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
          '.mermaid-container',
        );
      containers.forEach((container: HTMLElement) => {
        container.innerHTML =
          '<div class="text-red-500 text-sm p-4 bg-red-50 rounded">Error al renderizar el diagrama. Verifica la sintaxis Mermaid.</div>';
      });
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
      default:
        return type;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'quote':
        return 'bg-blue-100 text-blue-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      case 'documentation':
        return 'bg-green-100 text-green-800';
      case 'architecture':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  downloadDocument() {
    // Navigate to preview-download screen
    this.router.navigate(['/documents/preview-download', this.document.id], {
      state: { document: this.document },
    });
  }

  goBack() {
    this.router.navigate(['/documents/list']);
  }
}
