import { Component, signal, inject, viewChild, ElementRef, computed } from '@angular/core';
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
}

const DEFAULT_CONFIG: TableConfig = {
  rows: 3,
  cols: 3,
  hasHeader: true,
  hasStripedRows: true,
  alignment: 'left',
  bordered: false,
  compact: false,
};

@Component({
  selector: 'app-table-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .table-builder-panel {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1px solid #bbf7d0;
        border-radius: 16px;
        padding: 1.5rem;
      }

      .table-preview {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .table-preview table {
        width: 100%;
        border-collapse: collapse;
      }

      .table-preview th {
        background: #16a34a;
        color: white;
        padding: 8px 12px;
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
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        font-size: 0.8rem;
        background: white;
      }

      .table-preview.bordered th,
      .table-preview.bordered td {
        border: 1px solid #cbd5e1;
      }

      .table-preview.striped tr:nth-child(even) td {
        background: #f9fafb;
      }

      .table-preview tr:hover td {
        background: #f0fdf4;
      }

      .grid-size-control {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .grid-size-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.15s;
        color: #166534;
      }

      .grid-size-btn:hover {
        background: #16a34a;
        color: white;
        border-color: #16a34a;
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
        background: #16a34a;
        border-color: #16a34a;
      }

      .grid-cell.header {
        background: #15803d;
        border-color: #15803d;
      }

      .form-group {
        margin-bottom: 0.75rem;
      }

      .form-group label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #166534;
        margin-bottom: 0.25rem;
      }

      .alignment-options {
        display: flex;
        gap: 0.375rem;
      }

      .alignment-option {
        flex: 1;
        padding: 0.375rem;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        text-align: center;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.15s;
        background: white;
      }

      .alignment-option:hover {
        border-color: #16a34a;
      }

      .alignment-option.active {
        border-color: #16a34a;
        background: #f0fdf4;
        color: #166534;
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
        accent-color: #16a34a;
      }

      table-style-options {
        display: flex;
        gap: 0.375rem;
      }
    `,
  ],
  template: `
    <div class="table-builder-panel">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-green-900">Tabla Personalizada</h3>
        <button
          (click)="insertTable()"
          class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Insertar Tabla
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-4">
          <div class="form-group">
            <label>Tamaño</label>
            <div class="grid-size-control">
              <div class="flex items-center gap-2">
                <span class="text-xs text-green-700">Filas:</span>
                <button class="grid-size-btn" (click)="decrementRow()">−</button>
                <span class="text-sm font-semibold w-6 text-center">{{ tableConfig().rows }}</span>
                <button class="grid-size-btn" (click)="incrementRow()">+</button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-green-700">Cols:</span>
                <button class="grid-size-btn" (click)="decrementCol()">−</button>
                <span class="text-sm font-semibold w-6 text-center">{{ tableConfig().cols }}</span>
                <button class="grid-size-btn" (click)="incrementCol()">+</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Selecciona el tamaño visualmente</label>
            <div class="grid-visualizer" [style.grid-template-columns]="'repeat(' + Math.min(tableConfig().cols, 6) + ', 1fr)'">
              @for (row of [].constructor(Math.min(tableConfig().rows, 6)); track row; let rowIndex = $index) {
                @for (col of [].constructor(Math.min(tableConfig().cols, 6)); track col; let colIndex = $index) {
                  <div
                    class="grid-cell"
                    [class.active]="rowIndex > 0 || tableConfig().hasHeader === false"
                    [class.header]="rowIndex === 0 && tableConfig().hasHeader"
                  ></div>
                }
              }
            </div>
          </div>

          <div class="form-group">
            <label>Alineación del texto</label>
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
                  [(ngModel)]="tableConfig().hasHeader"
                />
                Fila de encabezado
              </label>
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="tableConfig().hasStripedRows"
                />
                Rayas alternas
              </label>
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="tableConfig().bordered"
                />
                Bordes
              </label>
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="tableConfig().compact"
                />
                Compacta
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-green-700 mb-2 block">Vista previa</label>
          <div
            class="table-preview"
            [class.striped]="tableConfig().hasStripedRows"
            [class.bordered]="tableConfig().bordered"
            [class.compact]="tableConfig().compact"
          >
            <table>
              @if (tableConfig().hasHeader) {
                <thead>
                  <tr>
                    @for (col of [].constructor(tableConfig().cols); track col) {
                      <th [style.text-align]="tableConfig().alignment">Columna {{ col + 1 }}</th>
                    }
                  </tr>
                </thead>
              }
              <tbody>
                @for (row of [].constructor(tableConfig().hasHeader ? tableConfig().rows - 1 : tableConfig().rows); track row) {
                  <tr>
                    @for (col of [].constructor(tableConfig().cols); track col) {
                      <td [style.text-align]="tableConfig().alignment">Dato {{ row + 1 }}-{{ col + 1 }}</td>
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
  protected readonly Math = Math;
  tableConfig = signal<TableConfig>({ ...DEFAULT_CONFIG });

  insert = signal(false);

  readonly alignments = [
    { id: 'left' as const, label: 'Izq.' },
    { id: 'center' as const, label: 'Centro' },
    { id: 'right' as const, label: 'Der.' },
  ];

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

  insertTable(): void {
    this.insert.set(true);
    setTimeout(() => this.insert.set(false), 100);
  }

  exportToMarkdown(): string {
    const c = this.tableConfig();
    let md = '\n';

    const headerCells = Array.from({ length: c.cols }, (_, i) => `Columna ${i + 1}`);
    md += '| ' + headerCells.join(' | ') + ' |\n';
    md += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';

    const dataRows = c.hasHeader ? c.rows - 1 : c.rows;
    for (let i = 0; i < dataRows; i++) {
      const cells = Array.from({ length: c.cols }, (_, j) => `Dato ${i + 1}-${j + 1}`);
      md += '| ' + cells.join(' | ') + ' |\n';
    }

    md += '\n';
    return md;
  }

  exportToHtml(): string {
    const c = this.tableConfig();
    let html = '\n<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">\n';

    if (c.hasHeader) {
      html += '  <thead>\n    <tr>\n';
      for (let i = 0; i < c.cols; i++) {
        html += `      <th style="background: #16a34a; color: white; padding: ${c.compact ? '4px 8px' : '10px 12px'}; text-align: ${c.alignment}; font-weight: 600; border: 1px solid ${c.bordered ? '#cbd5e1' : 'transparent'};">Columna ${i + 1}</th>\n`;
      }
      html += '    </tr>\n  </thead>\n';
    }

    html += '  <tbody>\n';
    const dataRows = c.hasHeader ? c.rows - 1 : c.rows;
    for (let i = 0; i < dataRows; i++) {
      const bgColor = c.hasStripedRows && i % 2 !== 0 ? '#f9fafb' : '#ffffff';
      html += '    <tr>\n';
      for (let j = 0; j < c.cols; j++) {
        html += `      <td style="padding: ${c.compact ? '4px 8px' : '10px 12px'}; text-align: ${c.alignment}; background: ${bgColor}; border: 1px solid ${c.bordered ? '#cbd5e1' : '#e5e7eb'};">Dato ${i + 1}-${j + 1}</td>\n`;
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
