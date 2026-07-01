import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { JosanzListExportFormat, JosanzListExportPayload } from './list-export.types';
import { buildCsvContent, buildSqlScript, triggerBlobDownload } from './list-export.utils';

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
