import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ExportPdfRequest {
  title: string;
  html: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentPdfApiService {
  private readonly http = inject(HttpClient);

  async exportPdf(request: ExportPdfRequest): Promise<Blob> {
    return firstValueFrom(
      this.http.post('/api/document-generator/export/pdf', request, {
        responseType: 'blob',
      }),
    );
  }
}
