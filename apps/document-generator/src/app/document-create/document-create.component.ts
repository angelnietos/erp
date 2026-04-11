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
import {
  UiCardComponent,
  UiButtonComponent,
  UiInputComponent,
  UiSelectComponent,
  UiTextareaComponent,
  SelectMapperPipe,
} from '@josanz-erp/shared-ui-kit';

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-document-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiCardComponent,
    UiButtonComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
  ],
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

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Crear Nuevo Documento
        </h1>
        <p class="text-gray-600">
          Selecciona el tipo de documento y completa la información necesaria
        </p>
      </div>

      <ui-card class="mb-6">
        <div class="space-y-6">
          <!-- Selección de Tipo de Documento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Documento *
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                *ngFor="let type of documentTypes"
                (click)="selectDocumentType(type)"
                class="border-2 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                [class.border-blue-500]="selectedType?.id === type.id"
                [class.bg-blue-50]="selectedType?.id === type.id"
              >
                <h3 class="font-medium text-gray-900">{{ type.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ type.description }}</p>
              </div>
            </div>
          </div>

          <!-- Formulario -->
          <form
            *ngIf="selectedType"
            [formGroup]="documentForm"
            (ngSubmit)="generateDocument()"
            class="space-y-6"
          >
            <!-- Campos comunes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ui-select
                label="Cliente *"
                formControlName="clientId"
                [options]="clientOptions"
                placeholder="Seleccionar cliente"
              ></ui-select>

              <ui-input
                label="Fecha"
                type="date"
                formControlName="date"
              ></ui-input>
            </div>

            <!-- Campos específicos según tipo -->
            <div *ngIf="selectedType?.id === 'quote'">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información del Presupuesto
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ui-input
                  label="Proyecto"
                  formControlName="projectName"
                  placeholder="Nombre del proyecto"
                ></ui-input>

                <ui-input
                  label="Monto Total"
                  type="number"
                  formControlName="totalAmount"
                  placeholder="0.00"
                ></ui-input>
              </div>

              <div class="mt-6">
                <ui-textarea
                  label="Descripción"
                  formControlName="description"
                  [rows]="4"
                  placeholder="Descripción detallada del presupuesto..."
                ></ui-textarea>
              </div>
            </div>

            <div *ngIf="selectedType?.id === 'documentation'">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información de la Documentación
              </h3>
              <div class="space-y-6">
                <ui-input
                  label="Título del Documento *"
                  formControlName="title"
                  placeholder="Título del documento"
                ></ui-input>

                <ui-textarea
                  label="Contenido"
                  formControlName="content"
                  [rows]="8"
                  placeholder="Contenido del documento..."
                ></ui-textarea>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-4 pt-6 border-t">
              <ui-button variant="outline" (click)="goBack()">
                Cancelar
              </ui-button>

              <ui-button
                type="submit"
                [disabled]="documentForm.invalid"
                [loading]="isGenerating"
              >
                {{ isGenerating ? 'Generando...' : 'Generar Documento' }}
              </ui-button>
            </div>
          </form>
        </div>
      </ui-card>
    </div>
  `,
})
export class DocumentCreateComponent {
  selectedType: DocumentType | null = null;
  documentForm: FormGroup;
  isGenerating = false;

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

  clientOptions = this.clients.map((client) => ({
    label: client.name,
    value: client.id,
  }));

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

  goBack() {
    this.router.navigate(['/documents/list']);
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
