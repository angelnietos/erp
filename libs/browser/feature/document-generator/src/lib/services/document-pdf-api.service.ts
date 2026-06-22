import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { assertValidPdfBlob } from '../utils/pdf-blob.util';

export interface ExportPdfRequest {
  title: string;
  html: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentPdfApiService {
  private readonly http = inject(HttpClient);

  async exportPdf(request: ExportPdfRequest): Promise<Blob> {
    const blob = await firstValueFrom(
      this.http
        .post('/api/document-generator/export/pdf', request, {
          responseType: 'blob',
          observe: 'response',
        })
        .pipe(
          map((res) => {
            const body = res.body;
            if (!body) {
              throw new Error('Respuesta vacía al generar el PDF.');
            }
            const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
            if (
              contentType.includes('application/json') ||
              contentType.includes('text/html')
            ) {
              throw new Error('El servidor devolvió un error en lugar del PDF.');
            }
            return body;
          }),
        ),
    );
    await assertValidPdfBlob(blob);
    return blob;
  }
}
