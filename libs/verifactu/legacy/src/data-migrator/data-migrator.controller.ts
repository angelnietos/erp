import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';

// Carga la lib del migrador desde el build (dist) o desde source en desarrollo
function loadDataMigrator(): {
  exportToExcel: (rows: Record<string, unknown>[], columns: { key: string; header: string; path?: string }[], options?: { sheetName?: string }) => Buffer;
  exportToCsv: (rows: Record<string, unknown>[], columns: { key: string; header: string; path?: string }[], options?: { separator?: string; includeBom?: boolean }) => string;
  importFromExcel: (buffer: Buffer, options?: { sheetIndex?: number; sheetName?: string; dataStartRow?: number }) => Record<string, unknown>[];
  importFromCsv: (content: string, options?: { separator?: string }) => Record<string, unknown>[];
  mapRows: (rows: Record<string, unknown>[], mapping: { sourceColumn: string; targetKey: string; transform?: string }[]) => Record<string, unknown>[];
  getAdapter: (entity: string) => { entity: string; columns: unknown[]; legacyMapping?: unknown[] } | undefined;
  getSupportedEntities: () => string[];
} {
  const candidates = [
    path.join(__dirname, '..', '..', '..', '..', 'dist', 'libs', 'data-migrator', 'data-migrator', 'src'),
    path.join(__dirname, '..', '..', '..', 'libs', 'data-migrator', 'data-migrator', 'src'),
  ];
  for (const p of candidates) {
    try {
      const lib = require(p);
      if (lib.exportToExcel && lib.getAdapter) return lib;
    } catch {
      continue;
    }
  }
  throw new Error('Data migrator library not found. Run: nx build data-migrator-data-migrator');
}

@Controller('migrator')
export class DataMigratorController {
  @Get('entities')
  getEntities(): { entities: string[] } {
    const lib = loadDataMigrator();
    return { entities: lib.getSupportedEntities() };
  }

  @Get('adapters/:entity')
  getAdapter(@Param('entity') entity: string) {
    const lib = loadDataMigrator();
    const adapter = lib.getAdapter(entity);
    if (!adapter) throw new BadRequestException(`Unknown entity: ${entity}`);
    return adapter;
  }

  @Post('export/excel')
  async exportExcel(
    @Body() body: { entity: string; data: Record<string, unknown>[] },
    @Res() res: Response,
  ) {
    const lib = loadDataMigrator();
    const adapter = lib.getAdapter(body.entity);
    if (!adapter) throw new BadRequestException(`Unknown entity: ${body.entity}`);
    const buffer = lib.exportToExcel(
      body.data ?? [],
      adapter.columns as { key: string; header: string; path?: string }[],
      { sheetName: body.entity },
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${body.entity}-export.xlsx"`);
    res.send(buffer);
  }

  @Post('export/csv')
  async exportCsv(
    @Body() body: { entity: string; data: Record<string, unknown>[] },
    @Res() res: Response,
  ) {
    const lib = loadDataMigrator();
    const adapter = lib.getAdapter(body.entity);
    if (!adapter) throw new BadRequestException(`Unknown entity: ${body.entity}`);
    const csv = lib.exportToCsv(
      body.data ?? [],
      adapter.columns as { key: string; header: string; path?: string }[],
      { includeBom: true },
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${body.entity}-export.csv"`);
    res.send(csv);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: { buffer?: Buffer } | undefined,
    @Body() body: { entity: string; applyMapping?: boolean },
    @Res() res: Response,
  ) {
    if (!file?.buffer) throw new BadRequestException('File required');
    const lib = loadDataMigrator();
    const adapter = lib.getAdapter(body.entity);
    if (!adapter) throw new BadRequestException(`Unknown entity: ${body?.entity ?? 'entity'}`);
    const rows = lib.importFromExcel(file.buffer, { dataStartRow: 0 });
    const mapping = adapter.legacyMapping as { sourceColumn: string; targetKey: string; transform?: string }[] | undefined;
    const data = mapping?.length && body.applyMapping !== false
      ? lib.mapRows(rows, mapping)
      : rows;
    return res.json({ data, totalRows: data.length });
  }

  @Post('import/csv')
  async importCsv(
    @Body() body: { entity: string; content: string; applyMapping?: boolean },
    @Res() res: Response,
  ) {
    if (!body.content) throw new BadRequestException('content required');
    const lib = loadDataMigrator();
    const adapter = lib.getAdapter(body.entity);
    if (!adapter) throw new BadRequestException(`Unknown entity: ${body.entity}`);
    const rows = lib.importFromCsv(body.content);
    const mapping = adapter.legacyMapping as { sourceColumn: string; targetKey: string; transform?: string }[] | undefined;
    const data = mapping?.length && body.applyMapping !== false
      ? lib.mapRows(rows, mapping)
      : rows;
    return res.json({ data, totalRows: data.length });
  }
}
