import { Component, inject, OnInit, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

      /* Tarjeta seleccionada: se apoya en variables de tema heredadas de forma natural */

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
        box-shadow: 0 10px 28px
          color-mix(in srgb, var(--brand) 38%, transparent);
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease,
          filter 0.2s ease;
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

      .document-create-page {
        padding-bottom: 2rem;
      }
    `,
  ],
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="document-create-page space-y-6">
      <!-- Breadcrumb -->
      <nav class="dg-breadcrumb" aria-label="Migas de pan">
        <a routerLink="/documents/list">Documentos</a>
        <span aria-hidden="true">/</span>
        <span class="dg-breadcrumb__current">Crear Nuevo</span>
      </nav>

      <!-- Header -->
      <div class="dg-panel">
        <div class="dg-hero">
          <div class="dg-hero__icon" aria-hidden="true">
            <svg
              class="w-7 h-7"
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
          <h1 class="dg-hero__title">Crear nuevo documento</h1>
          <p class="dg-hero__lead">
            Elige el tipo y una plantilla corporativa. El editor se abre en la
            siguiente pantalla con tablas, estilos Josanz y export PDF/DOCX.
          </p>
          <p class="text-sm text-muted mt-4">
            <a
              routerLink="/documents/settings/ai"
              class="font-semibold"
              style="color: var(--brand)"
              >Motor de IA</a
            >
            · clave API y modelo (misma configuración que el ERP)
          </p>
        </div>
      </div>

      <!-- Document Type Selection -->
      <div class="dg-panel">
        <div class="dg-section-head text-center sm:text-left">
          <h2 class="dg-section-head__title">
            ¿Qué tipo de documento necesitas?
          </h2>
          <p class="dg-section-head__desc mx-auto sm:mx-0">
            {{ documentTypes.length }} tipos disponibles · selecciona uno para
            ver plantillas recomendadas
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (type of documentTypes; track type.id) {
            <div
              (click)="selectDocumentType(type)"
              (keydown)="onDocumentTypeCardKeydown($event, type)"
              tabindex="0"
              role="button"
              [attr.aria-current]="selectedType?.id === type.id ? 'true' : null"
              class="dg-type-card"
              [class.dg-type-card--selected]="selectedType?.id === type.id"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="dg-type-card__icon-wrap">
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
                  <div class="dg-type-card__check" aria-hidden="true">
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                }
              </div>
              <div class="space-y-2">
                <h3 class="dg-type-card__name">{{ type.name }}</h3>
                <p class="dg-type-card__desc">{{ type.description }}</p>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                @if (type.id === 'quote') {
                  <span class="dg-chip dg-chip--brand">💰 Cálculos automáticos</span>
                }
                @if (type.id === 'proposal') {
                  <span class="dg-chip dg-chip--brand">📋 Estructura profesional</span>
                }
                @if (type.id === 'documentation') {
                  <span class="dg-chip dg-chip--brand">📖 Contenido técnico</span>
                }
                @if (type.id === 'architecture') {
                  <span class="dg-chip dg-chip--brand">🎨 Diagramas Mermaid</span>
                }
                @if (type.id === 'resume') {
                  <span class="dg-chip dg-chip--brand">👤 CV estandarizado</span>
                }
                @if (type.id === 'interview') {
                  <span class="dg-chip dg-chip--brand">✅ Scorecards</span>
                }
                @if (type.id === 'offer') {
                  <span class="dg-chip dg-chip--brand">✉️ Carta formal</span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (selectedType) {
        <div
          #templatesSection
          class="dg-panel animate-slide-up scroll-mt-24"
        >
          <div class="dg-section-head flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="dg-section-head__eyebrow">{{ selectedType.name }}</p>
              <h2 class="dg-section-head__title">Plantillas recomendadas</h2>
              <p class="dg-section-head__desc">
                {{ templates.length }} plantillas · incluyen tablas corporativas
                listas para editar
              </p>
            </div>
            <a
              [routerLink]="['/documents', 'create', 'edit']"
              [queryParams]="{ type: selectedType.id }"
              class="text-sm font-semibold whitespace-nowrap"
              style="color: var(--brand)"
            >
              Saltar plantillas →
            </a>
          </div>
          <div class="dg-template-grid" role="list">
            @for (template of templates; track template.id) {
              <a
                role="listitem"
                [routerLink]="['/documents', 'create', 'edit']"
                [queryParams]="editorQueryParams(template.id)"
                class="dg-template-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div class="dg-template-card__icon" aria-hidden="true">
                  {{ template.icon }}
                </div>
                <div class="dg-template-card__title">{{ template.name }}</div>
                <div class="dg-template-card__desc">
                  {{ template.description }}
                </div>
                <div class="dg-template-card__tags">
                  @if (isFeaturedTemplate(template)) {
                    <span class="dg-chip dg-chip--brand">Recomendada</span>
                  }
                  @for (tag of template.tags.slice(0, 3); track tag) {
                    <span class="dg-chip">{{ tag }}</span>
                  }
                </div>
                <span class="dg-template-card__cta">Abrir en editor →</span>
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
              class="dg-btn-secondary"
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
  private readonly templatesSection =
    viewChild<ElementRef<HTMLElement>>('templatesSection');
  private readonly templatesService = inject(TemplatesRegistryService);
  private readonly assistantService = inject(AssistantContextService);
  private readonly route = inject(ActivatedRoute);

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
    const typeId = this.route.snapshot.queryParamMap.get('type');
    if (typeId) {
      const match = this.documentTypes.find((t) => t.id === typeId);
      if (match) {
        this.selectDocumentType(match);
      }
    }
  }

  /** Teclado en tarjetas tipo botón: Enter/Espacio sin scroll por Espacio. */
  onDocumentTypeCardKeydown(event: KeyboardEvent, type: DocumentType): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.selectDocumentType(type);
  }

  selectDocumentType(type: DocumentType) {
    this.selectedType = type;
    this.templates = this.templatesService.getForDocumentType(type.id);

    queueMicrotask(() => {
      this.templatesSection()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  isFeaturedTemplate(template: DocumentTemplate): boolean {
    if (!this.selectedType) {
      return false;
    }
    const featuredIds = new Set([
      'quote-corporate-josanz',
      'proposal-corporate-josanz',
    ]);
    if (featuredIds.has(template.id)) {
      return true;
    }
    const tag = this.selectedType.id === 'quote' ? 'presupuesto' : 'propuesta';
    return (
      this.selectedType.id === 'quote' || this.selectedType.id === 'proposal'
        ? template.tags.includes(tag) && template.id !== 'empty'
        : false
    );
  }

  clearSelectedType(): void {
    this.selectedType = null;
    this.templates = [];
  }

  editorQueryParams(templateId: string): { type: string; template: string } {
    const t = this.selectedType;
    return {
      type: t?.id ?? '',
      template: templateId,
    };
  }
}
