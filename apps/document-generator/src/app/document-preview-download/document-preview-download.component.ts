import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfGenerationService } from '../services/pdf-generation.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pdfService: PdfGenerationService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    // For now, assume document is passed via query params or service
    // In real app, would fetch from service
    this.document = history.state.document || {
      id,
      type: 'documentation',
      title: 'Documento',
    };
    this.generatePdf();
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
