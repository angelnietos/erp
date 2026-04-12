import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
              Documentos Generados
            </h1>
            <p class="text-secondary text-lg">
              Gestiona y descarga tus documentos PDF profesionales
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
            <button
              routerLink="/documents/bot"
              class="inline-flex items-center px-4 py-2 border border-soft rounded-xl text-sm font-medium text-primary bg-secondary hover:bg-tertiary hover:border-vibrant transition-all duration-200"
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
              Asistente IA
            </button>
            <button
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
              Crear Nuevo Documento
            </button>
          </div>
        </div>
      </div>

      <!-- Documents Grid -->
      <div
        *ngIf="documents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let doc of documents"
          class="group bg-surface rounded-2xl shadow-lg hover:shadow-2xl border border-soft hover:border-vibrant transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <!-- Header -->
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

            <!-- Content Preview -->
            <div class="space-y-3 mb-6">
              <div class="flex items-center text-sm text-secondary">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{{ doc.client }}</span>
              </div>
              <div class="flex items-center text-sm text-secondary">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 012 0z"
                  />
                </svg>
                <span>{{ doc.date | date: 'mediumDate' }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <button
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
              </button>
              <button
                (click)="downloadDocument(doc)"
                class="inline-flex items-center px-4 py-2 bg-success text-bg-secondary rounded-lg hover:shadow-lg transition-all duration-200 shadow-md"
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
      </div>

      <!-- Empty State -->
      <div
        *ngIf="documents.length === 0"
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
            No hay documentos generados aún
          </h3>
          <p class="text-secondary mb-8 text-lg">
            Comienza creando tu primer documento PDF profesional con la ayuda de
            nuestro asistente IA
          </p>
          <div class="space-y-4">
            <button
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
              Crear Primer Documento
            </button>
            <div class="text-center">
              <button
                routerLink="/documents/bot"
                class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
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
                O prueba nuestro Asistente IA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentListComponent {
  documents: any[] = []; // TODO: Replace with actual data service

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

  downloadDocument(doc: any) {
    // TODO: Implement download functionality
    console.log('Downloading document:', doc);
  }
}
