import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfGenerationService } from '../services/pdf-generation.service';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule],
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
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Vista Previa del Documento</h1>
        <div class="space-x-2">
          <button
            (click)="downloadDocument()"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Descargar PDF
          </button>
          <button
            (click)="goBack()"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>

      <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="border-b pb-4 mb-6">
          <h2 class="text-xl font-semibold">
            {{ document?.title || 'Documento' }}
          </h2>
          <p class="text-gray-600">Cliente: {{ document?.client }}</p>
          <p class="text-gray-600">Fecha: {{ document?.date | date }}</p>
        </div>

        <div class="prose max-w-none">
          <!-- Aquí se mostraría el contenido del documento -->
          <div *ngIf="document?.type === 'quote'" class="space-y-4">
            <h3>Presupuesto del Proyecto</h3>
            <p><strong>Proyecto:</strong> {{ document?.projectName }}</p>
            <p>
              <strong>Monto Total:</strong>
              {{ document?.totalAmount | currency }}
            </p>
            <p><strong>Descripción:</strong></p>
            <p>{{ document?.description }}</p>
          </div>

          <div *ngIf="document?.type === 'documentation'" class="space-y-4">
            <div [innerHTML]="document?.content"></div>
          </div>
        </div>
      </div>
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
