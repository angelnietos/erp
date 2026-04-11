import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent } from '@josanz-erp/shared-ui-kit';
import { PdfGenerationService } from '../services/pdf-generation.service';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <nav class="mb-4">
        <a
          routerLink="/documents/list"
          class="text-blue-600 hover:text-blue-800"
          >Documentos</a
        >
        >
        <span class="text-gray-600 ml-2">Vista Previa</span>
      </nav>

      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Vista Previa del Documento
          </h1>
          <p class="text-gray-600">Revisa el contenido antes de descargar</p>
        </div>

        <div class="flex space-x-3">
          <ui-button (click)="downloadDocument()" variant="primary">
            Descargar PDF
          </ui-button>
          <ui-button (click)="goBack()" variant="outline"> Volver </ui-button>
        </div>
      </div>

      <ui-card>
        <div class="space-y-6">
          <!-- Header del documento -->
          <div class="border-b pb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">
                {{ document?.title || 'Documento' }}
              </h2>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                [class]="getTypeBadgeClass(document?.type)"
              >
                {{ getTypeLabel(document?.type) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
            <div *ngIf="document?.type === 'quote'" class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Presupuesto del Proyecto
                </h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="font-medium text-gray-700">Proyecto:</span>
                      <p class="text-gray-900 mt-1">
                        {{ document?.projectName }}
                      </p>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700"
                        >Monto Total:</span
                      >
                      <p
                        class="text-gray-900 mt-1 text-lg font-semibold text-green-600"
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
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-gray-900 whitespace-pre-wrap">
                    {{ document?.description }}
                  </p>
                </div>
              </div>
            </div>

            <div *ngIf="document?.type === 'documentation'" class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                  Contenido del Documento
                </h3>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div
                    class="prose prose-sm max-w-none"
                    [innerHTML]="document?.content"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ui-card>
    </div>
  `,
})
export class DocumentPreviewComponent implements OnInit {
  document: any = null;

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

  getTypeLabel(type: string): string {
    switch (type) {
      case 'quote':
        return 'Presupuesto';
      case 'documentation':
        return 'Documentación';
      default:
        return type;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'quote':
        return 'bg-blue-100 text-blue-800';
      case 'documentation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  downloadDocument() {
    if (this.document?.pdfBytes) {
      const bytes = new Uint8Array(this.document.pdfBytes);
      const filename = `${this.document.title || 'document'}.pdf`;
      this.pdfService.downloadPdf(bytes, filename);
    } else {
      console.error('No PDF data available');
    }
  }

  goBack() {
    this.router.navigate(['/documents/list']);
  }
}
