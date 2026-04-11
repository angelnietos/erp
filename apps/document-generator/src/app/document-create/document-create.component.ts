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

            <!-- Propuesta Comercial -->
            <div *ngIf="selectedType?.id === 'proposal'">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información de la Propuesta
              </h3>
              <div class="space-y-6">
                <ui-input
                  label="Título de la Propuesta *"
                  formControlName="title"
                  placeholder="Título de la propuesta comercial"
                ></ui-input>

                <ui-textarea
                  label="Resumen Ejecutivo"
                  formControlName="executiveSummary"
                  [rows]="4"
                  placeholder="Resumen ejecutivo de la propuesta..."
                ></ui-textarea>

                <ui-textarea
                  label="Objetivos"
                  formControlName="objectives"
                  [rows]="3"
                  placeholder="Objetivos principales del proyecto..."
                ></ui-textarea>

                <ui-textarea
                  label="Alcance del Proyecto"
                  formControlName="scope"
                  [rows]="4"
                  placeholder="Alcance detallado del proyecto..."
                ></ui-textarea>

                <ui-textarea
                  label="Entregables"
                  formControlName="deliverables"
                  [rows]="4"
                  placeholder="Lista de entregables y resultados..."
                ></ui-textarea>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ui-input
                    label="Cronograma"
                    formControlName="timeline"
                    placeholder="Duración estimada del proyecto"
                  ></ui-input>

                  <ui-input
                    label="Precios"
                    formControlName="pricing"
                    placeholder="Información de precios"
                  ></ui-input>
                </div>

                <ui-textarea
                  label="Términos y Condiciones"
                  formControlName="terms"
                  [rows]="4"
                  placeholder="Términos y condiciones de la propuesta..."
                ></ui-textarea>
              </div>
            </div>

            <!-- Documentación Técnica -->
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

            <!-- Documentación Arquitectónica -->
            <div *ngIf="selectedType?.id === 'architecture'">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información Arquitectónica
              </h3>
              <div class="space-y-6">
                <ui-input
                  label="Título del Documento *"
                  formControlName="title"
                  placeholder="Título de la documentación arquitectónica"
                ></ui-input>

                <ui-textarea
                  label="Resumen del Sistema"
                  formControlName="systemOverview"
                  [rows]="4"
                  placeholder="Descripción general del sistema..."
                ></ui-textarea>

                <div class="space-y-4">
                  <label class="block text-sm font-medium text-gray-700">
                    Diagrama de Arquitectura (Mermaid)
                  </label>
                  <textarea
                    formControlName="architectureDiagram"
                    rows="8"
                    placeholder="graph TD
    A[Cliente] --> B[API Gateway]
    B --> C[Servicio de Autenticación]
    B --> D[Servicio de Documentos]
    C --> E[Base de Datos]
    D --> E

    subgraph 'Sistema de Gestión'
    C
    D
    end"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  ></textarea>
                  <p class="text-xs text-gray-500">
                    Usa sintaxis Mermaid para crear diagramas. Ejemplos: graph
                    TD, flowchart LR, etc.
                  </p>
                </div>

                <ui-textarea
                  label="Componentes del Sistema"
                  formControlName="components"
                  [rows]="4"
                  placeholder="Lista y descripción de componentes principales..."
                ></ui-textarea>

                <div class="space-y-4">
                  <label class="block text-sm font-medium text-gray-700">
                    Diagrama de Flujo de Datos (Mermaid)
                  </label>
                  <textarea
                    formControlName="dataFlow"
                    rows="6"
                    placeholder="sequenceDiagram
    participant Usuario
    participant API
    participant BaseDatos

    Usuario->>API: Solicitud de datos
    API->>BaseDatos: Consulta
    BaseDatos-->>API: Resultados
    API-->>Usuario: Respuesta"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  ></textarea>
                </div>

                <ui-textarea
                  label="APIs y Endpoints"
                  formControlName="apis"
                  [rows]="4"
                  placeholder="Documentación de APIs, endpoints, métodos HTTP..."
                ></ui-textarea>

                <ui-textarea
                  label="Tecnologías Utilizadas"
                  formControlName="technologies"
                  [rows]="3"
                  placeholder="Stack tecnológico, frameworks, bibliotecas..."
                ></ui-textarea>

                <ui-textarea
                  label="Estrategia de Despliegue"
                  formControlName="deployment"
                  [rows]="4"
                  placeholder="Arquitectura de despliegue, entornos, escalabilidad..."
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
      // Campos para propuestas
      executiveSummary: [''],
      objectives: [''],
      scope: [''],
      deliverables: [''],
      timeline: [''],
      pricing: [''],
      terms: [''],
      // Campos para arquitectura
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
            pdfBytes =
              await this.pdfService.generateDocumentationPdf(documentData);
            break;
          case 'architecture':
            pdfBytes =
              await this.pdfService.generateArchitecturePdf(documentData);
            break;
          default:
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
