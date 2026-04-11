import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalDocumentService } from '../services/universal-document.service';

export type EditorMode =
  | 'auto'
  | 'text'
  | 'markdown'
  | 'spreadsheet'
  | 'pdf'
  | 'raw';

@Component({
  selector: 'app-universal-editor',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .editor-container {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        background: white;
      }

      .mode-tabs {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
      }

      .tab-btn {
        padding: 10px 16px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 13px;
        color: #64748b;
        border-bottom: 2px solid transparent;
        transition: all 0.15s;
      }

      .tab-btn:hover {
        color: #475569;
        background: #f1f5f9;
      }

      .tab-btn.active {
        color: #2563eb;
        border-bottom-color: #2563eb;
        font-weight: 500;
        background: white;
      }

      .editor-area {
        min-height: 400px;
      }

      textarea.editor {
        width: 100%;
        min-height: 400px;
        border: none;
        padding: 16px;
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 14px;
        line-height: 1.6;
        resize: vertical;
        outline: none;
      }

      .spreadsheet-view {
        padding: 16px;
      }

      .spreadsheet-grid {
        width: 100%;
        border-collapse: collapse;
      }

      .spreadsheet-grid td {
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        min-width: 120px;
      }

      .spreadsheet-grid tr:nth-child(even) {
        background: #f8fafc;
      }

      .pdf-preview {
        padding: 16px;
        text-align: center;
        color: #64748b;
      }

      .mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #eff6ff;
        color: #1d4ed8;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
    `,
  ],
  template: `
    <div class="editor-container">
      <div class="mode-tabs">
        @for (mode of availableModes; track mode.id) {
          <button
            class="tab-btn"
            [class.active]="currentMode() === mode.id"
            (click)="setMode(mode.id)"
          >
            {{ mode.icon }} {{ mode.name }}
          </button>
        }

        <div style="flex: 1"></div>

        <div class="px-3 flex items-center">
          @if (detectedFormat()) {
            <span class="mode-badge"> Detectado: {{ detectedFormat() }} </span>
          }
        </div>
      </div>

      <div class="editor-area">
        @if (currentMode() === 'markdown') {
          <textarea
            class="editor"
            [value]="content()"
            (input)="updateContent($any($event.target).value)"
            placeholder="Escribe tu contenido en Markdown, HTML o texto plano..."
          ></textarea>
        }
        @if (currentMode() === 'text') {
          <textarea
            class="editor"
            [value]="content()"
            (input)="updateContent($any($event.target).value)"
            placeholder="Texto plano"
          ></textarea>
        }
        @if (currentMode() === 'spreadsheet') {
          <div class="spreadsheet-view">
            <table class="spreadsheet-grid">
              <tbody>
                @for (row of spreadsheetData(); track row; let i = $index) {
                  <tr>
                    @for (cell of row; track cell; let j = $index) {
                      <td
                        [contentEditable]="true"
                        (blur)="updateCell(i, j, $any($event.target).innerText)"
                      >
                        {{ cell }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (currentMode() === 'pdf') {
          <div class="pdf-preview">
            <div class="text-4xl mb-4">📄</div>
            <p>Vista previa PDF - Modo de solo lectura</p>
            <p class="text-sm mt-2">
              Cambia a modo Texto o Markdown para editar el contenido extraido
            </p>
          </div>
        }
        @if (currentMode() === 'auto') {
          <textarea
            class="editor"
            [value]="content()"
            (input)="updateContent($any($event.target).value)"
            placeholder="Escribe cualquier cosa. DOCS 2.0 detecta el formato automaticamente."
          ></textarea>
        }
      </div>
    </div>
  `,
})
export class UniversalEditorComponent {
  private readonly universalDocument = inject(UniversalDocumentService);

  readonly currentMode = signal<EditorMode>('auto');
  readonly content = signal('');
  readonly detectedFormat = signal<string | null>(null);
  readonly spreadsheetData = signal<string[][]>([]);

  readonly availableModes: { id: EditorMode; name: string; icon: string }[] = [
    { id: 'auto', name: 'Automático', icon: '🤖' },
    { id: 'markdown', name: 'Markdown', icon: '📑' },
    { id: 'spreadsheet', name: 'Tablas', icon: '📊' },
    { id: 'text', name: 'Texto', icon: '📃' },
    { id: 'pdf', name: 'PDF', icon: '📄' },
  ];

  setMode(mode: EditorMode): void {
    this.currentMode.set(mode);

    if (mode === 'spreadsheet' && this.spreadsheetData().length === 0) {
      this.parseSpreadsheet();
    }
  }

  updateContent(value: string): void {
    this.content.set(value);
    this.autoDetectFormat(value);
  }

  setContent(value: string): void {
    this.content.set(value);
    this.autoDetectFormat(value);
  }

  getContent(): string {
    return this.content();
  }

  updateCell(row: number, col: number, value: string): void {
    const data = [...this.spreadsheetData()];
    data[row][col] = value;
    this.spreadsheetData.set(data);
  }

  private autoDetectFormat(content: string): void {
    if (content.length < 10) {
      this.detectedFormat.set(null);
      return;
    }

    const markdownIndicators = content.match(/#\s|\*\s|\[.*\]\(.*\)|`{3}/g);
    const htmlIndicators = content.match(/<\/?[a-z][\s\S]*>/gi);
    const tableIndicators = content.match(/\|.*\|/g);

    if (tableIndicators && tableIndicators.length > 2) {
      this.detectedFormat.set('Tabla');
      if (this.currentMode() === 'auto') {
        this.parseSpreadsheet();
      }
    } else if (markdownIndicators && markdownIndicators.length > 3) {
      this.detectedFormat.set('Markdown');
    } else if (htmlIndicators && htmlIndicators.length > 2) {
      this.detectedFormat.set('HTML');
    } else {
      this.detectedFormat.set('Texto');
    }
  }

  private parseSpreadsheet(): void {
    const lines = this.content()
      .split('\n')
      .filter((l) => l.includes('|'));
    if (lines.length < 2) {
      this.spreadsheetData.set([
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ]);
      return;
    }

    const data = lines.map((line) =>
      line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0),
    );

    this.spreadsheetData.set(data);
  }
}
