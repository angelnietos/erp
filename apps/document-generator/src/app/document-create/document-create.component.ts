import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';
import {
  TemplatesRegistryService,
  DocumentTemplate,
} from '../services/templates-registry.service';

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
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
        <span class="text-primary font-medium">Crear Nuevo</span>
      </nav>

      <!-- Header -->
      <div class="bg-surface rounded-2xl shadow-xl border border-soft p-8">
        <div class="text-center max-w-2xl mx-auto">
          <div
            class="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent mb-3"
          >
            Crear Nuevo Documento
          </h1>
          <p class="text-secondary text-lg">
            Elige el tipo y una plantilla: el editor se abre en la siguiente
            pantalla para que no tengas que hacer scroll.
          </p>
          <p class="text-sm text-muted mt-4">
            <a
              routerLink="/documents/settings/ai"
              class="font-semibold text-brand hover:underline"
              >Motor de IA</a
            >
            · clave API y modelo (misma configuración que el ERP)
          </p>
        </div>
      </div>

      <!-- Document Type Selection -->
      <div class="bg-surface rounded-2xl shadow-xl border border-soft/50 p-8">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-2">
            ¿Qué tipo de documento necesitas?
          </h2>
          <p class="text-secondary">
            Elige el tipo que mejor se adapte a tus necesidades
          </p>
          <p class="text-xs text-muted mt-2 max-w-2xl mx-auto">
            En el editor tendrás la burbuja de ayuda (esquina): mismo chat e IA
            que en el resto del generador.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (type of documentTypes; track type.id) {
            <div
              (click)="selectDocumentType(type)"
              (keydown.enter)="selectDocumentType(type)"
              (keydown.space)="selectDocumentType(type)"
              tabindex="0"
              role="button"
              class="group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              [class.selected-doc-type-light]="selectedType?.id === type.id"
              [class.border-blue-500]="selectedType?.id === type.id"
              [class.bg-gradient-to-br]="selectedType?.id === type.id"
              [class.from-blue-50]="selectedType?.id === type.id"
              [class.to-indigo-50]="selectedType?.id === type.id"
              [class.border-soft]="selectedType?.id !== type.id"
              [class.hover:border-vibrant]="selectedType?.id !== type.id"
            >
              <div class="flex items-start justify-between mb-4">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-r from-surface to-surface-hover group-hover:from-brand-surface group-hover:to-brand-ambient flex items-center justify-center transition-all duration-300"
                >
                  @if (type.id === 'quote') {
                    <svg
                      class="w-6 h-6 text-secondary group-hover:text-brand"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599-1"
                      />
                    </svg>
                  }
                  @if (type.id === 'proposal') {
                    <svg
                      class="w-6 h-6 text-secondary group-hover:text-brand"
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
                  }
                  @if (type.id === 'documentation') {
                    <svg
                      class="w-6 h-6 text-secondary group-hover:text-brand"
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
                  }
                  @if (type.id === 'architecture') {
                    <svg
                      class="w-6 h-6 text-secondary group-hover:text-brand"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 2 0 011-1h2a1 2 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                </div>
                @if (selectedType?.id === type.id) {
                  <div
                    class="check-icon w-6 h-6 bg-brand rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                }
              </div>
              <div class="space-y-2">
                <h3
                  class="text-xl font-semibold text-primary group-hover:text-brand transition-colors"
                >
                  {{ type.name }}
                </h3>
                <p class="text-secondary leading-relaxed">
                  {{ type.description }}
                </p>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                @if (type.id === 'quote') {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                  >
                    💰 Cálculos automáticos
                  </span>
                }
                @if (type.id === 'proposal') {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    📋 Estructura profesional
                  </span>
                }
                @if (type.id === 'documentation') {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    📖 Contenido técnico
                  </span>
                }
                @if (type.id === 'architecture') {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    🎨 Diagramas Mermaid
                  </span>
                }
              </div>
            </div>
          }
        </div>

      </div>

      @if (selectedType) {
        <div
          class="bg-surface rounded-2xl shadow-xl border border-soft p-8 animate-slide-up"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-primary mb-2">
              Elige una plantilla
            </h2>
            <p class="text-secondary">
              Al elegir una se abre el editor en otra vista con el contenido cargado.
              También puedes continuar sin plantilla.
            </p>
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            role="list"
          >
            @for (template of templates; track template.id) {
              <a
                role="listitem"
                [routerLink]="['/documents', 'create', 'edit']"
                [queryParams]="editorQueryParams(template.id)"
                class="block px-4 py-3 rounded-xl border border-soft bg-tertiary hover:border-brand hover:bg-brand/5 transition-all text-left no-underline focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <div class="font-medium text-primary">
                  {{ template.icon }} {{ template.name }}
                </div>
                <div class="text-xs text-secondary mt-1 line-clamp-2">
                  {{ template.description }}
                </div>
              </a>
            }
          </div>
          <div class="mt-8 flex flex-wrap gap-3 items-center">
            <a
              [routerLink]="['/documents', 'create', 'edit']"
              [queryParams]="{ type: selectedType.id }"
              class="footer-cta-primary no-underline text-center"
            >
              Continuar sin plantilla
            </a>
            <button
              type="button"
              (click)="clearSelectedType()"
              class="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium border border-soft text-primary hover:bg-tertiary transition-colors"
            >
              Cambiar tipo de documento
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class DocumentCreateComponent implements OnInit {
  selectedType: DocumentType | null = null;
  templates: DocumentTemplate[] = [];
  private readonly templatesService = inject(TemplatesRegistryService);
  private readonly assistantService = inject(AssistantContextService);

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

  ngOnInit() {
    this.assistantService.setActiveTab('create');
  }

  selectDocumentType(type: DocumentType) {
    this.selectedType = type;

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

  clearSelectedType(): void {
    this.selectedType = null;
    this.templates = [];
  }

  editorQueryParams(templateId: string): { type: string; template: string } {
    return {
      type: this.selectedType!.id,
      template: templateId,
    };
  }
}
