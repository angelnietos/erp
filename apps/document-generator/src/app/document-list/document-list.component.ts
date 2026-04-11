import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  UiCardComponent,
  UiButtonComponent,
  UiTableComponent,
} from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiCardComponent, UiButtonComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <nav class="mb-4">
        <span class="text-gray-600">Documentos</span>
      </nav>

      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Documentos Generados
          </h1>
          <p class="text-gray-600">Gestiona y descarga tus documentos PDF</p>
        </div>

        <ui-button routerLink="/documents/create" variant="primary">
          Crear Nuevo Documento
        </ui-button>
      </div>

      <ui-card *ngIf="documents.length > 0">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let doc of documents" class="hover:bg-gray-50">
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="getTypeBadgeClass(doc.type)"
                  >
                    {{ getTypeLabel(doc.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ doc.client }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ doc.date | date: 'short' }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                >
                  <ui-button
                    variant="outline"
                    size="sm"
                    [routerLink]="['/documents/preview', doc.id]"
                  >
                    Ver
                  </ui-button>
                  <ui-button
                    variant="outline"
                    size="sm"
                    color="success"
                    (click)="downloadDocument(doc)"
                  >
                    Descargar
                  </ui-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ui-card>

      <ui-card *ngIf="documents.length === 0">
        <div class="text-center py-12">
          <div
            class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-12 h-12 text-gray-400"
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No hay documentos generados aún
          </h3>
          <p class="text-gray-500 mb-6">
            Comienza creando tu primer documento PDF
          </p>
          <ui-button routerLink="/documents/create" variant="primary">
            Crear Primer Documento
          </ui-button>
        </div>
      </ui-card>
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
