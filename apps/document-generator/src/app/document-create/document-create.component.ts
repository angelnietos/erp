import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PdfGenerationService } from '../services/pdf-generation.service';

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <nav class="mb-4">
        <a
          routerLink="/documents/list"
          class="text-blue-600 hover:text-blue-800"
          >Documentos</a
        >
        >
        <span class="text-gray-600 ml-2">Crear Nuevo</span>
      </nav>
      <h1 class="text-2xl font-bold mb-6">Crear Nuevo Documento</h1>

      <!-- Paso 1: Selección de tipo -->
      <div *ngIf="currentStep === 1" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">
          Seleccionar Tipo de Documento
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            *ngFor="let type of documentTypes"
            (click)="selectDocumentType(type)"
            class="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
            [class.border-blue-500]="selectedType?.id === type.id"
          >
            <h3 class="font-medium">{{ type.name }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ type.description }}</p>
          </div>
        </div>
        <div class="mt-6">
          <button
            (click)="nextStep()"
            [disabled]="!selectedType"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>

      <!-- Paso 2: Formulario -->
      <div *ngIf="currentStep === 2" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Completar Información</h2>
        <form
          [formGroup]="documentForm"
          (ngSubmit)="generateDocument()"
          class="space-y-6"
        >
          <!-- Campos comunes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                formControlName="clientId"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                <option *ngFor="let client of clients" [value]="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                formControlName="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Campos específicos según tipo -->
          <div *ngIf="selectedType?.id === 'quote'">
            <h3 class="text-lg font-medium mb-4">
              Información del Presupuesto
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Proyecto
                </label>
                <input
                  type="text"
                  formControlName="projectName"
                  placeholder="Nombre del proyecto"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Monto Total
                </label>
                <input
                  type="number"
                  formControlName="totalAmount"
                  placeholder="0.00"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                formControlName="description"
                rows="4"
                placeholder="Descripción del presupuesto..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div *ngIf="selectedType?.id === 'documentation'">
            <h3 class="text-lg font-medium mb-4">
              Información de la Documentación
            </h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="Título del documento"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Contenido
                </label>
                <textarea
                  formControlName="content"
                  rows="8"
                  placeholder="Contenido del documento..."
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="flex justify-between">
            <button
              type="button"
              (click)="previousStep()"
              class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Anterior
            </button>
            <button
              type="submit"
              [disabled]="documentForm.invalid"
              class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Generar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DocumentCreateComponent {
  currentStep = 1;
  selectedType: DocumentType | null = null;
  documentForm: FormGroup;

  documentTypes: DocumentType[] = [
    {
      id: 'quote',
      name: 'Presupuesto',
      description: 'Generar presupuesto para proyectos',
    },
    {
      id: 'documentation',
      name: 'Documentación',
      description: 'Crear documentos técnicos o informativos',
    },
  ];

  clients = [
    { id: '1', name: 'Cliente A' },
    { id: '2', name: 'Cliente B' },
  ]; // TODO: Load from service

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pdfService: PdfGenerationService,
  ) {
    this.documentForm = this.fb.group({
      clientId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0]],
      // Campos específicos
      projectName: [''],
      totalAmount: [''],
      description: [''],
      title: [''],
      content: [''],
    });
  }

  selectDocumentType(type: DocumentType) {
    this.selectedType = type;
  }

  nextStep() {
    if (this.selectedType) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    this.currentStep = 1;
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
        if (this.selectedType?.id === 'quote') {
          pdfBytes = await this.pdfService.generateQuotePdf(documentData);
        } else {
          pdfBytes =
            await this.pdfService.generateDocumentationPdf(documentData);
        }

        // Store PDF data temporarily (in a real app, save to server)
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
        // TODO: Show error message to user
      }
    }
  }
}
