import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { DocumentPersistenceService } from '../services/document-persistence.service';

@Component({
  selector: 'app-document-preview-download',
  imports: [CommonModule],
  templateUrl: './document-preview-download.html',
  styleUrl: './document-preview-download.css',
})
export class DocumentPreviewDownloadComponent implements OnInit {
  document: any;
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
    this.document = doc || {
      id,
      type: 'documentation',
      title: 'Documento',
    };
    void this.generatePdf();
  }

  async generatePdf() {
    if (!this.document) return;

    this.isGenerating = true;
    try {
      let pdfBlob: Blob;
      switch (this.document.type) {
        case 'quote':
          pdfBlob = await this.pdfService.generateQuotePdf(this.document);
          break;
        case 'proposal':
          pdfBlob = await this.pdfService.generateProposalPdf(this.document);
          break;
        case 'documentation':
          pdfBlob = await this.pdfService.generateDocumentationPdf(
            this.document,
          );
          break;
        case 'architecture':
          pdfBlob = await this.pdfService.generateArchitecturePdf(
            this.document,
          );
          break;
        default:
          pdfBlob = await this.pdfService.generateMarkdownPdf(this.document);
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
      a.download = `${this.document.title || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  goBack() {
    this.router.navigate(['/documents/preview', this.document.id]);
  }
}
