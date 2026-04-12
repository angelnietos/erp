import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
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

declare const marked: { parse: (content: string) => string };

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
    `,
  ],
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-slate-600">
        <button
          routerLink="/documents/list"
          class="hover:text-slate-900 transition-colors"
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
        <span class="text-slate-900 font-medium">Crear Nuevo</span>
      </nav>

      <!-- Header -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
      >
        <div class="text-center max-w-2xl mx-auto">
          <div
            class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
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
            class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3"
          >
            Crear Nuevo Documento
          </h1>
          <p class="text-slate-600 text-lg">
            Selecciona el tipo de documento que deseas crear y deja que nuestro
            asistente IA te guíe
          </p>
        </div>
      </div>

      <!-- Document Type Selection -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
      >
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-2">
            ¿Qué tipo de documento necesitas?
          </h2>
          <p class="text-slate-600">
            Elige el tipo que mejor se adapte a tus necesidades
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
              [class.border-blue-500]="selectedType?.id === type.id"
              [class.bg-gradient-to-br]="selectedType?.id === type.id"
              [class.from-blue-50]="selectedType?.id === type.id"
              [class.to-indigo-50]="selectedType?.id === type.id"
              [class.border-slate-200]="selectedType?.id !== type.id"
              [class.hover:border-slate-300]="selectedType?.id !== type.id"
            >
              <div class="flex items-start justify-between mb-4">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-indigo-100 flex items-center justify-center transition-all duration-300"
                >
                  @if (type.id === 'quote') {
                    <svg
                      class="w-6 h-6 text-slate-600 group-hover:text-blue-600"
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
                      class="w-6 h-6 text-slate-600 group-hover:text-blue-600"
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
                      class="w-6 h-6 text-slate-600 group-hover:text-blue-600"
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
                      class="w-6 h-6 text-slate-600 group-hover:text-blue-600"
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
                    class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
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
                  class="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors"
                >
                  {{ type.name }}
                </h3>
                <p class="text-slate-600 leading-relaxed">
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
                <span
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                >
                  🤖 Asistente IA
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Form Section -->
        @if (selectedType) {
          <div
            class="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
          >
            <div class="mb-8">
              <div class="flex items-center space-x-3 mb-4">
                <div
                  class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-white"
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
                  <h2 class="text-2xl font-bold text-slate-900">
                    Información del Documento
                  </h2>
                  <p class="text-slate-600">
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
              <div
                class="bg-slate-50 rounded-xl p-6 border border-slate-200/50"
              >
                <h3
                  class="text-lg font-semibold text-slate-900 mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-slate-600"
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
                      class="block text-sm font-medium text-slate-700"
                      >Cliente *</label
                    >
                    <select
                      id="clientId"
                      formControlName="clientId"
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                      class="block text-sm font-medium text-slate-700"
                      >Fecha</label
                    >
                    <input
                      id="date"
                      type="date"
                      formControlName="date"
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                    class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
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
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                }

                <!-- Plantillas Rápidas -->
                <div class="space-y-3">
                  <div class="block text-sm font-medium text-slate-700">
                    Plantillas predefinidas
                  </div>
                  <div
                    class="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="templates-label"
                  >
                    @for (template of templates; track template.id) {
                      <button
                        type="button"
                        (click)="loadTemplate(template)"
                        class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all"
                      >
                        {{ template.name }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Barra de Herramientas Markdown -->
                <div
                  class="bg-slate-100 rounded-xl p-2 flex flex-wrap gap-1 border border-slate-200"
                >
                  <button
                    type="button"
                    (click)="insertMarkdown('**', '**')"
                    title="Negrita (Ctrl+B)"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('*', '*')"
                    title="Cursiva (Ctrl+I)"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all italic"
                  >
                    I
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('# ', '')"
                    title="Encabezado 1"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('## ', '')"
                    title="Encabezado 2"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('### ', '')"
                    title="Encabezado 3"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    H3
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('- ', '')"
                    title="Lista"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    • Lista
                  </button>
                  <button
                    type="button"
                    (click)="insertMarkdown('> ', '')"
                    title="Cita"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    " Cita
                  </button>
                  <button
                    type="button"
                    (click)="insertCode()"
                    title="Código"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all font-mono text-xs"
                  >
                    &lt;&gt;
                  </button>
                  <button
                    type="button"
                    (click)="insertCodeBlock()"
                    title="Bloque de código"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all font-mono text-xs"
                  >
                    {{ '{}' }}
                  </button>
                  <div class="w-px bg-slate-300 mx-1"></div>
                  <button
                    type="button"
                    (click)="insertMarkdown('[', '](url)')"
                    title="Enlace"
                    class="px-3 py-1.5 rounded-lg hover:bg-white transition-all"
                  >
                    🔗
                  </button>

                  <div
                    class="ml-auto flex items-center gap-3 text-xs text-slate-500"
                  >
                    @if (autoSaved) {
                      <span class="text-green-600 flex items-center gap-1">
                        <span
                          class="w-1.5 h-1.5 bg-green-500 rounded-full"
                        ></span>
                        Guardado automatico
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
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                      <span class="px-2 py-1 bg-slate-100 rounded"
                        >Atajos: Ctrl+B Ctrl+I Ctrl+S</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Editor Markdown -->
                    <div class="space-y-2">
                      <div
                        class="text-xs font-medium text-slate-500 flex justify-between"
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
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white font-mono text-sm resize-vertical"
                        (input)="updatePreview()"
                        (keydown)="handleKeydown($event)"
                        [class.h-screen]="fullscreenMode"
                      ></textarea>
                    </div>

                    <!-- Vista Previa Live -->
                    <div class="space-y-2">
                      <div class="text-xs font-medium text-slate-500">
                        Vista Previa
                      </div>
                      <div
                        class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 min-h-[350px] max-h-[500px] overflow-auto markdown-preview shadow-inner"
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
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white font-mono text-sm"
                      ></textarea>
                    </div>
                  </div>
                }
              </div>

              <div
                class="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-4"
              >
                <button
                  (click)="goBack()"
                  class="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
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
                  Volver Atrás
                </button>
                <div class="flex items-center space-x-4">
                  <button
                    type="button"
                    (click)="exportMarkdown()"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div class="flex flex-col gap-3">
                      <div class="text-sm text-slate-500 mb-1">
                        Importar archivo:
                      </div>
                      <input
                        type="file"
                        #fileInput
                        hidden
                        (change)="importDocument($event)"
                        accept=".md,.txt,.pdf,.docx,.xlsx,.html"
                      />
                      <div class="flex gap-2 flex-wrap">
                        <button
                          (click)="fileInput.click()"
                          class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          📥 Importar Archivo
                        </button>
                        <button
                          (click)="exportDocument('markdown')"
                          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          📑 MD
                        </button>
                        <button
                          (click)="exportDocument('pdf')"
                          class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          📄 PDF
                        </button>
                        <button
                          (click)="exportDocument('xlsx')"
                          class="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          📊 Excel
                        </button>
                        <button
                          (click)="exportDocument('html')"
                          class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          🌐 HTML
                        </button>
                        <button
                          (click)="exportDocument('txt')"
                          class="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          📃 TXT
                        </button>
                      </div>
                    </div>
                  </button>
                  <button
                    routerLink="/documents/bot"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
                      />
                    </svg>
                    Consultar Asistente
                  </button>
                  <button
                    routerLink="/documents/analysis"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Analizar Propuesta
                  </button>
                  <button
                    type="submit"
                    [disabled]="documentForm.invalid || isGenerating"
                    class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    @if (!isGenerating) {
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 0 01-2-2V5a2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 0 01.293.707V19a2 0 01-2 2z"
                        />
                      </svg>
                    }
                    @if (isGenerating) {
                      <svg
                        class="w-5 h-5 mr-2 animate-spin"
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
                    @if (isGenerating) {
                      <svg
                        class="w-5 h-5 mr-2 animate-spin"
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

                    {{
                      isGenerating
                        ? 'Generando Documento...'
                        : 'Generar Documento PDF / Excel / HTML'
                    }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class DocumentCreateComponent implements OnInit {
  selectedType: DocumentType | null = null;
  documentForm: FormGroup;
  isGenerating = false;
  previewHtml = '';
  wordCount = 0;
  characterCount = 0;
  autoSaved = false;
  fullscreenMode = false;

  templates = [
    { id: 'empty', name: 'Vacío', content: '' },
    {
      id: 'structure',
      name: 'Estructura básica',
      content:
        '# Título del documento\n\n## Introducción\n\n## Desarrollo\n\n## Conclusiones',
    },
    {
      id: 'technical',
      name: 'Documento técnico',
      content:
        '# Documento Técnico\n\n## Resumen Ejecutivo\n\n## Descripción General\n\n## Arquitectura\n\n## Detalles Técnicos\n\n## Apéndices',
    },
    {
      id: 'report',
      name: 'Informe',
      content:
        '# Informe\n\n## Fecha\n\n## Resumen\n\n## Detalles\n\n## Recomendaciones',
    },
  ];

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
  ];

  clientOptions = this.clients.map((client) => ({
    label: client.name,
    value: client.id,
  }));

  readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly pdfService = inject(PdfGenerationService);
  readonly assistantService = inject(AssistantContextService);
  readonly universalDocument = inject(UniversalDocumentService);

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

  selectDocumentType(type: DocumentType) {
    this.selectedType = type;
  }

  goBack() {
    this.router.navigate(['/documents/list']);
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
  }

  updatePreview() {
    const content = this.documentForm.get('content')?.value || '';
    try {
      this.previewHtml = marked.parse(content);
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

  loadTemplate(template: { id: string; name: string; content: string }) {
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

  exportMarkdown() {
    const content = this.documentForm.get('content')?.value || '';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (this.documentForm.get('title')?.value || 'documento') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportDocument(format: string) {
    const content = this.documentForm.get('content')?.value || '';
    const title = this.documentForm.get('title')?.value || 'documento';

    if (format === 'pdf') {
      // ✅ GENERAR PDF REAL CON FORMATO CORRECTO
      await this.pdfService.generateMarkdownPdf({
        content: content,
        title: title,
      });
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
      try {
        const formValue = this.documentForm.value;
        const client = this.clients.find((c) => c.id === formValue.clientId);

        const documentData = {
          ...formValue,
          client: client?.name || 'Cliente',
          type: this.selectedType?.id,
        };

        let pdfBytes: Uint8Array;
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

        const documentId = Date.now().toString();
        localStorage.setItem(
          `document_${documentId}`,
          JSON.stringify({
            ...documentData,
            pdfBytes: Array.from(pdfBytes),
          }),
        );

        this.router.navigate(['/documents/preview', documentId]);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }
}
