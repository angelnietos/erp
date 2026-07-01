import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { JosanzListExportFormat, JosanzListExportPayload } from './list-export.types';
import { buildCsvContent, buildSqlScript, triggerBlobDownload } from './list-export.utils';

async function assertXlsxBlob(blob: Blob): Promise<void> {
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (head[0] === 0x50 && head[1] === 0x4b) {
    return;
  }

  let message = 'La API no devolvió un Excel válido.';
  const text = (await blob.text()).trim();
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // keep default message
    }
  }
  throw new Error(message);
}

@Injectable({ providedIn: 'root' })
export class JosanzListExportService {
  private readonly http = inject(HttpClient);

  async export(payload: JosanzListExportPayload, format: JosanzListExportFormat): Promise<void> {
    switch (format) {
      case 'xlsx':
        await this.exportXlsx(payload);
        return;
      case 'csv':
        this.exportCsv(payload);
        return;
      case 'sql':
        this.exportSql(payload);
        return;
      default:
        throw new Error(`Formato de exportación no soportado: ${format}`);
    }
  }

  private async exportXlsx(payload: JosanzListExportPayload): Promise<void> {
    const blob = await firstValueFrom(
      this.http.post(
        '/api/reports/export/xlsx',
        {
          title: payload.title.slice(0, 200),
          headers: payload.headers,
          rows: payload.rows,
          meta: payload.meta,
          sheetName: payload.sheetName,
          filename: payload.filename,
        },
        { responseType: 'blob' },
      ),
    );
    await assertXlsxBlob(blob);
    triggerBlobDownload(blob, `${payload.filename}.xlsx`);
  }

  private exportCsv(payload: JosanzListExportPayload): void {
    const blob = new Blob([buildCsvContent(payload)], {
      type: 'text/csv;charset=utf-8',
    });
    triggerBlobDownload(blob, `${payload.filename}.csv`);
  }

  private exportSql(payload: JosanzListExportPayload): void {
    const blob = new Blob([buildSqlScript(payload)], {
      type: 'application/sql;charset=utf-8',
    });
    triggerBlobDownload(blob, `${payload.filename}.sql`);
  }
}
