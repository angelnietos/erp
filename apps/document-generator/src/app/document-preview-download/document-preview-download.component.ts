import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { DocumentPersistenceService } from '../services/document-persistence.service';

/** Documento para generar PDF (mismo shape que la vista previa). */
interface PreviewDownloadDocument {
  id?: string;
  type?: string;
  title?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-document-preview-download',
  imports: [CommonModule],
  templateUrl: './document-preview-download.html',
  styleUrl: './document-preview-download.css',
})
export class DocumentPreviewDownloadComponent implements OnInit {
  document: PreviewDownloadDocument | null = null;
  pdfUrl: string | null = null;
  isGenerating = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pdfService = inject(PdfGenerationService);
  private readonly persistence = inject(DocumentPersistenceService);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    let doc = history.state?.['document'] as Record<string, unknown> | undefined;
    if (!doc && id) {
      try {
        await this.persistence.whenReady();
        const fromDb = await this.persistence.getPayload(id);
        if (fromDb) {
          doc = fromDb as Record<string, unknown>;
        }
      } catch {
        /* sin IndexedDB */
      }
    }
    this.document = (doc as PreviewDownloadDocument | undefined) ?? {
      id,
      type: 'documentation',
      title: 'Documento',
    };
    void this.generatePdf();
  }

  async generatePdf() {
    const doc = this.document;
    if (!doc) return;

    this.isGenerating = true;
    try {
      let pdfBlob: Blob;
      const kind = typeof doc.type === 'string' ? doc.type : 'documentation';
      switch (kind) {
        case 'quote':
          pdfBlob = await this.pdfService.generateQuotePdf(doc);
          break;
        case 'proposal':
          pdfBlob = await this.pdfService.generateProposalPdf(doc);
          break;
        case 'documentation':
          pdfBlob = await this.pdfService.generateDocumentationPdf(doc);
          break;
        case 'architecture':
          pdfBlob = await this.pdfService.generateArchitecturePdf(doc);
          break;
        default:
          pdfBlob = await this.pdfService.generateMarkdownPdf(doc);
      }

      this.pdfUrl = URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  downloadPdf() {
    if (this.pdfUrl) {
      const a = document.createElement('a');
      a.href = this.pdfUrl;
      a.download = `${this.document?.title ?? 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  goBack() {
    const id = this.document?.id;
    if (id) {
      void this.router.navigate(['/documents/preview', id]);
    } else {
      void this.router.navigate(['/documents/list']);
    }
  }
}
