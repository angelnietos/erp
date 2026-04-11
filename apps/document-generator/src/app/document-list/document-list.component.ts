import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <nav class="mb-4">
        <span class="text-gray-600">Documentos</span>
      </nav>
      <h1 class="text-2xl font-bold mb-4">Documentos Generados</h1>
      <div class="mb-4">
        <button
          routerLink="/documents/create"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Nuevo Documento
        </button>
      </div>
      <div class="bg-white shadow rounded-lg">
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
            <!-- Aquí se mostrarían los documentos -->
            <tr *ngFor="let doc of documents">
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ doc.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.client }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ doc.date | date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900 mr-2"
                  [routerLink]="['/documents/preview', doc.id]"
                >
                  Ver
                </button>
                <button class="text-red-600 hover:text-red-900">
                  Descargar
                </button>
              </td>
            </tr>
            <tr *ngIf="documents.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                No hay documentos generados aún.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DocumentListComponent {
  documents: any[] = []; // TODO: Replace with actual data service
}
