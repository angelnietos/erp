import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentExportOrchestratorService } from '../services/document-export-orchestrator.service';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { DocumentPersistenceService } from '../services/document-persistence.service';
import { readPdfBackgroundSettings } from '../utils/document-preview-css';

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
  documentNotFound = false;
  pdfUrl: string | null = null;
  isGenerating = false;
  pdfError: string | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exportOrchestrator = inject(DocumentExportOrchestratorService);
  private readonly pdfService = inject(PdfGenerationService);
  private readonly persistence = inject(DocumentPersistenceService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.revokePdfObjectUrl());
  }

  private revokePdfObjectUrl(): void {
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
    }
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    let doc = history.state?.['document'] as
      | Record<string, unknown>
      | undefined;
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
    this.document = (doc as PreviewDownloadDocument | undefined) ?? null;
    if (!this.document?.id && !this.hasPersistedContent(this.document)) {
      this.documentNotFound = true;
      this.pdfError =
        'No encontramos este documento en el historial de este navegador.';
      return;
    }
    void this.generatePdf();
  }

  private hasPersistedContent(doc: PreviewDownloadDocument | null): boolean {
    if (!doc) return false;
    const content = typeof doc['content'] === 'string' ? doc['content'].trim() : '';
    if (content) return true;
    const pdfBytes = doc['pdfBytes'];
    return Array.isArray(pdfBytes) && pdfBytes.length > 0;
  }

  async generatePdf() {
    const doc = this.document;
    if (!doc || this.documentNotFound) return;

    this.pdfError = null;
    this.isGenerating = true;
    this.revokePdfObjectUrl();
    try {
      const background = readPdfBackgroundSettings(doc);
      const withStyles = {
        ...doc,
        customCss:
          typeof doc['customCss'] === 'string' ? doc['customCss'] : undefined,
        pdfBackgroundMode: background.pdfBackgroundMode,
        pdfBackgroundColor: background.pdfBackgroundColor,
        pdfBackgroundImageUrl: background.pdfBackgroundImageUrl,
        documentPaperColor: background.documentPaperColor,
        documentTextColor: background.documentTextColor,
        documentMutedColor: background.documentMutedColor,
        documentAccentColor: background.documentAccentColor,
        documentBorderColor: background.documentBorderColor,
      };
      let pdfBlob: Blob;
      const content =
        typeof doc['content'] === 'string' ? doc['content'].trim() : '';
      const kind = typeof doc.type === 'string' ? doc.type : 'documentation';

      if (content) {
        pdfBlob = await this.exportOrchestrator.exportPdfFromPersisted(
          withStyles as Record<string, unknown>,
          String(doc.title ?? 'Documento'),
        );
      } else {
        switch (kind) {
          case 'quote':
            pdfBlob = await this.pdfService.generateQuotePdf(withStyles);
            break;
          case 'proposal':
            pdfBlob = await this.pdfService.generateProposalPdf(withStyles);
            break;
          case 'documentation':
          case 'architecture':
            pdfBlob = await this.pdfService.generateDocumentationPdf(withStyles);
            break;
          default:
            pdfBlob = await this.pdfService.generateMarkdownPdf(withStyles);
        }
      }

      this.pdfUrl = URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.pdfError =
        'No se pudo generar la vista previa del PDF. Revisa los datos e inténtalo de nuevo.';
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
