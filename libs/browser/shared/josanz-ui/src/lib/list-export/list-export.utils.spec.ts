import {
  buildCatalogListExportPayload,
  buildCsvContent,
  buildExportFilterMeta,
  buildSqlScript,
  csvCell,
  slugifyExportName,
} from './list-export.utils';
import type { JosanzCatalogListConfig } from '../components/josanz-catalog-list/josanz-catalog-list';

describe('list-export.utils', () => {
  const baseConfig: JosanzCatalogListConfig = {
    title: 'Eventos',
    primaryBtnLabel: 'Añadir',
    statusColumnLabel: 'Estado',
    rowLabels: ['Fecha', 'Cliente'],
    titleColumnLabel: 'ID',
  };

  it('slugifyExportName normalizes accents', () => {
    expect(slugifyExportName('Albaránés')).toBe('albaranes');
  });

  it('buildCatalogListExportPayload uses filtered rows and headers', () => {
    const payload = buildCatalogListExportPayload(
      baseConfig,
      [
        {
          id: 'EV-1',
          title: 'EV-1',
          pillLabel: 'Confirmado',
          pillVariant: 'confirmado',
          values: ['01/07/2026', 'Cliente A'],
        },
      ],
      (row) => row.values ?? [],
      { search: 'cliente', typology: 'Hoteles' },
    );

    expect(payload.headers).toEqual(['ID', 'Fecha', 'Cliente', 'Estado']);
    expect(payload.rows).toEqual([['EV-1', '01/07/2026', 'Cliente A', 'Confirmado']]);
    expect(payload.filename).toMatch(/^josanz-eventos-/);
    expect(payload.meta?.some((m) => m.label === 'Búsqueda')).toBe(true);
    expect(payload.meta?.some((m) => m.label === 'Tipología')).toBe(true);
  });

  it('buildExportFilterMeta skips empty filters', () => {
    const meta = buildExportFilterMeta({ typology: 'Todos' }, 3);
    expect(meta.find((m) => m.label === 'Tipología')).toBeUndefined();
    expect(meta[0]).toEqual({ label: 'Filas exportadas', value: '3' });
  });

  it('buildCsvContent includes BOM and headers', () => {
    const csv = buildCsvContent({
      title: 'Eventos',
      filename: 'josanz-eventos',
      headers: ['ID', 'Estado'],
      rows: [['EV-1', 'Confirmado']],
      meta: [{ label: 'Filas exportadas', value: '1' }],
    });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('ID,Estado');
    expect(csv).toContain('EV-1,Confirmado');
  });

  it('csvCell escapes commas and quotes', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('buildSqlScript creates table and inserts', () => {
    const sql = buildSqlScript({
      title: 'Clientes',
      filename: 'josanz-clientes',
      headers: ['Nombre', 'Email'],
      rows: [['Acme', 'a@acme.com']],
    });

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS export_clientes');
    expect(sql).toContain("INSERT INTO export_clientes");
    expect(sql).toContain("'Acme'");
  });
});
