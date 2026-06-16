import {
  Component,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableConfig {
  rows: number;
  cols: number;
  hasHeader: boolean;
  hasStripedRows: boolean;
  alignment: 'left' | 'center' | 'right';
  bordered: boolean;
  compact: boolean;
  style: 'corporate' | 'neutral';
}

const DEFAULT_CONFIG: TableConfig = {
  rows: 4,
  cols: 4,
  hasHeader: true,
  hasStripedRows: true,
  alignment: 'left',
  bordered: true,
  compact: false,
  style: 'corporate',
};

@Component({
  selector: 'app-table-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .table-builder-panel {
        background: linear-gradient(
          135deg,
          #fff5f5 0%,
          #fef2f2 48%,
          #fff 100%
        );
        border: 1px solid #fecaca;
        border-radius: 16px;
        padding: 1.5rem;
      }

      .table-preview {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 1rem;
        box-shadow: 0 4px 14px rgba(122, 0, 0, 0.06);
      }

      .table-preview table {
        width: 100%;
        border-collapse: collapse;
      }

      .table-preview.corporate th {
        background: #7a0000;
        color: white;
        border-color: #5b0000;
      }

      .table-preview.neutral th {
        background: #1e293b;
        color: white;
      }

      .table-preview th {
        padding: 10px 12px;
        font-weight: 600;
        font-size: 0.8rem;
        text-align: left;
      }

      .table-preview.compact th,
      .table-preview.compact td {
        padding: 4px 8px;
        font-size: 0.75rem;
      }

      .table-preview td {
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        font-size: 0.8rem;
        background: white;
        color: #334155;
      }

      .table-preview.bordered th,
      .table-preview.bordered td {
        border: 1px solid #cbd5e1;
      }

      .table-preview.striped tr:nth-child(even) td {
        background: #fafafa;
      }

      .table-preview tr:hover td {
        background: #fff5f5;
      }

      .grid-size-control {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .grid-size-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #fecaca;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.15s;
        color: #7a0000;
      }

      .grid-size-btn:hover {
        background: #7a0000;
        color: white;
        border-color: #7a0000;
      }

      .grid-visualizer {
        display: inline-grid;
        gap: 2px;
        padding: 8px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }

      .grid-cell {
        width: 16px;
        height: 16px;
        border: 1px solid #d1d5db;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.1s;
      }

      .grid-cell.active {
        background: #7a0000;
        border-color: #7a0000;
      }

      .grid-cell.header {
        background: #5b0000;
        border-color: #5b0000;
      }

      .form-group {
        margin-bottom: 0.75rem;
      }

      .form-group label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #7a0000;
        margin-bottom: 0.25rem;
      }

      .alignment-options,
      .style-options {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }

      .alignment-option,
      .style-option {
        flex: 1;
        min-width: 4.5rem;
        padding: 0.375rem;
        border: 1px solid #fecaca;
        border-radius: 6px;
        text-align: center;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.15s;
        background: white;
      }

      .alignment-option:hover,
      .style-option:hover {
        border-color: #7a0000;
      }

      .alignment-option.active,
      .style-option.active {
        border-color: #7a0000;
        background: #fff5f5;
        color: #7a0000;
        font-weight: 600;
      }

      .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8rem;
        cursor: pointer;
        color: #374151;
      }

      .checkbox-group input {
        accent-color: #7a0000;
      }
    `,
  ],
  template: `
    <div class="table-builder-panel">
      <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 class="text-sm font-semibold text-[#5b0000]">
            Tabla corporativa
          </h3>
          <p class="text-xs text-slate-600 mt-0.5">
            Estilos alineados con preview y PDF Josanz (.doc-table)
          </p>
        </div>
        <button
          type="button"
          (click)="insertTable()"
          class="px-3 py-1.5 bg-[#7a0000] text-white text-sm font-medium rounded-lg hover:bg-[#5b0000] transition-colors"
        >
          Insertar tabla
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-4">
          <div class="form-group">
            <label>Estilo</label>
            <div class="style-options">
              @for (style of tableStyles; track style.id) {
                <div
                  class="style-option"
                  [class.active]="tableConfig().style === style.id"
                  (click)="tableConfig.update((c) => ({ ...c, style: style.id }))"
                >
                  {{ style.label }}
                </div>
              }
            </div>
          </div>

          <div class="form-group">
            <label>Tamaño</label>
            <div class="grid-size-control">
              <div class="flex items-center gap-2">
                <span class="text-xs text-[#7a0000]">Filas:</span>
                <button type="button" class="grid-size-btn" (click)="decrementRow()">−</button>
                <span class="text-sm font-semibold w-6 text-center">{{ tableConfig().rows }}</span>
                <button type="button" class="grid-size-btn" (click)="incrementRow()">+</button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-[#7a0000]">Cols:</span>
                <button type="button" class="grid-size-btn" (click)="decrementCol()">−</button>
                <span class="text-sm font-semibold w-6 text-center">{{ tableConfig().cols }}</span>
                <button type="button" class="grid-size-btn" (click)="incrementCol()">+</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Selecciona filas y columnas (clic)</label>
            <div
              class="grid-visualizer"
              [style.grid-template-columns]="'repeat(' + gridPickerSize + ', 1fr)'"
            >
              @for (row of gridPickerRows; track row) {
                @for (col of gridPickerCols; track col) {
                  <div
                    class="grid-cell"
                    [class.active]="row <= tableConfig().rows && col <= tableConfig().cols"
                    [class.header]="row === 1 && tableConfig().hasHeader"
                    (click)="selectGridSize(row, col)"
                    [attr.title]="row + ' × ' + col"
                  ></div>
                }
              }
            </div>
            <p class="text-xs text-[#7a0000] mt-1">
              {{ tableConfig().rows }} filas × {{ tableConfig().cols }} columnas
            </p>
          </div>

          <div class="form-group">
            <label>Alineación</label>
            <div class="alignment-options">
              @for (align of alignments; track align.id) {
                <div
                  class="alignment-option"
                  [class.active]="tableConfig().alignment === align.id"
                  (click)="tableConfig.update((c) => ({ ...c, alignment: align.id }))"
                >
                  {{ align.label }}
                </div>
              }
            </div>
          </div>

          <div class="form-group">
            <label>Opciones</label>
            <div class="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  [ngModel]="tableConfig().hasHeader"
                  (ngModelChange)="patchConfig({ hasHeader: $event })"
                />
                Encabezado
              </label>
              <label>
                <input
                  type="checkbox"
                  [ngModel]="tableConfig().hasStripedRows"
                  (ngModelChange)="patchConfig({ hasStripedRows: $event })"
                />
                Rayas alternas
              </label>
              <label>
                <input
                  type="checkbox"
                  [ngModel]="tableConfig().bordered"
                  (ngModelChange)="patchConfig({ bordered: $event })"
                />
                Bordes
              </label>
              <label>
                <input
                  type="checkbox"
                  [ngModel]="tableConfig().compact"
                  (ngModelChange)="patchConfig({ compact: $event })"
                />
                Compacta
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-[#7a0000] mb-2 block">Vista previa</label>
          <div
            class="table-preview"
            [class.corporate]="tableConfig().style === 'corporate'"
            [class.neutral]="tableConfig().style === 'neutral'"
            [class.striped]="tableConfig().hasStripedRows"
            [class.bordered]="tableConfig().bordered"
            [class.compact]="tableConfig().compact"
          >
            <table>
              @if (tableConfig().hasHeader) {
                <thead>
                  <tr>
                    @for (col of colIndices; track col) {
                      <th [style.text-align]="tableConfig().alignment">
                        Columna {{ col + 1 }}
                      </th>
                    }
                  </tr>
                </thead>
              }
              <tbody>
                @for (row of bodyRowIndices; track row) {
                  <tr>
                    @for (col of colIndices; track col) {
                      <td [style.text-align]="tableConfig().alignment">
                        Dato {{ row + 1 }}-{{ col + 1 }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TableBuilderComponent {
  readonly gridPickerSize = 8;
  readonly gridPickerRows = Array.from({ length: 8 }, (_, i) => i + 1);
  readonly gridPickerCols = this.gridPickerRows;
  tableConfig = signal<TableConfig>({ ...DEFAULT_CONFIG });
  insert = signal(false);

  readonly alignments = [
    { id: 'left' as const, label: 'Izq.' },
    { id: 'center' as const, label: 'Centro' },
    { id: 'right' as const, label: 'Der.' },
  ];

  readonly tableStyles = [
    { id: 'corporate' as const, label: 'Josanz' },
    { id: 'neutral' as const, label: 'Neutro' },
  ];

  get colIndices(): number[] {
    return Array.from({ length: this.tableConfig().cols }, (_, i) => i);
  }

  get bodyRowIndices(): number[] {
    const c = this.tableConfig();
    const count = c.hasHeader ? Math.max(c.rows - 1, 1) : c.rows;
    return Array.from({ length: count }, (_, i) => i);
  }

  patchConfig(partial: Partial<TableConfig>): void {
    this.tableConfig.update((c) => ({ ...c, ...partial }));
  }

  incrementRow(): void {
    this.tableConfig.update((c) => ({ ...c, rows: Math.min(c.rows + 1, 20) }));
  }

  decrementRow(): void {
    this.tableConfig.update((c) => ({
      ...c,
      rows: Math.max(c.rows - 1, 1),
    }));
  }

  incrementCol(): void {
    this.tableConfig.update((c) => ({ ...c, cols: Math.min(c.cols + 1, 10) }));
  }

  decrementCol(): void {
    this.tableConfig.update((c) => ({ ...c, cols: Math.max(c.cols - 1, 1) }));
  }

  selectGridSize(rows: number, cols: number): void {
    this.tableConfig.update((c) => ({
      ...c,
      rows: Math.max(1, Math.min(rows, 20)),
      cols: Math.max(1, Math.min(cols, 10)),
    }));
  }

  insertTable(): void {
    this.insert.set(true);
    setTimeout(() => this.insert.set(false), 100);
  }

  private tableClassNames(): string {
    const c = this.tableConfig();
    return [
      'doc-table',
      c.style === 'corporate' ? 'doc-table--corporate' : 'doc-table--neutral',
      c.hasStripedRows ? 'doc-table--striped' : '',
      c.bordered ? 'doc-table--bordered' : '',
      c.compact ? 'doc-table--compact' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  exportToMarkdown(): string {
    const c = this.tableConfig();
    let md = '\n';

    const headerCells = Array.from(
      { length: c.cols },
      (_, i) => `Columna ${i + 1}`,
    );
    md += '| ' + headerCells.join(' | ') + ' |\n';
    md += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';

    const dataRows = c.hasHeader ? Math.max(c.rows - 1, 1) : c.rows;
    for (let i = 0; i < dataRows; i++) {
      const cells = Array.from(
        { length: c.cols },
        (_, j) => `Dato ${i + 1}-${j + 1}`,
      );
      md += '| ' + cells.join(' | ') + ' |\n';
    }

    md += '\n';
    return md;
  }

  exportToHtml(): string {
    const c = this.tableConfig();
    const classNames = this.tableClassNames();
    let html = `\n<table class="${classNames}">\n`;

    if (c.hasHeader) {
      html += '  <thead class="doc-table-head">\n    <tr class="doc-table-row">\n';
      for (let i = 0; i < c.cols; i++) {
        html += `      <th class="doc-table-header" style="text-align: ${c.alignment};">Columna ${i + 1}</th>\n`;
      }
      html += '    </tr>\n  </thead>\n';
    }

    html += '  <tbody class="doc-table-body">\n';
    const dataRows = c.hasHeader ? Math.max(c.rows - 1, 1) : c.rows;
    for (let i = 0; i < dataRows; i++) {
      html += '    <tr class="doc-table-row">\n';
      for (let j = 0; j < c.cols; j++) {
        html += `      <td class="doc-table-cell" style="text-align: ${c.alignment};">Dato ${i + 1}-${j + 1}</td>\n`;
      }
      html += '    </tr>\n';
    }
    html += '  </tbody>\n</table>\n';

    return html;
  }

  getConfig(): TableConfig {
    return this.tableConfig();
  }

  setConfig(config: Partial<TableConfig>): void {
    this.tableConfig.update((c) => ({ ...c, ...config }));
  }
}
