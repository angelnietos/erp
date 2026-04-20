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
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

      .formatting-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border-bottom: 1px solid #e2e8f0;
        background: #fafafa;
        flex-wrap: wrap;
      }

      .format-btn {
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        color: #374151;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .format-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .format-btn.active {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #1d4ed8;
      }

      .format-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbar-separator {
        width: 1px;
        height: 20px;
        background: #d1d5db;
        margin: 0 8px;
      }

      .editor-area {
        min-height: 400px;
        position: relative;
      }

      textarea.editor {
        width: 100%;
        min-height: 400px;
        border: none;
        padding: 16px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        resize: vertical;
        outline: none;
        background: transparent;
      }

      .rich-editor {
        width: 100%;
        min-height: 400px;
        border: none;
        padding: 16px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        outline: none;
        overflow-y: auto;
      }

      .rich-editor:empty:before {
        content: attr(placeholder);
        color: #9ca3af;
        pointer-events: none;
      }

      .rich-editor:focus {
        outline: none;
      }

      .spreadsheet-view {
        padding: 16px;
      }

      .spreadsheet-grid {
        width: 100%;
        border-collapse: collapse;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
      }

      .spreadsheet-grid th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
      }

      .spreadsheet-grid td {
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        min-width: 120px;
        background: white;
      }

      .spreadsheet-grid tr:nth-child(even) td {
        background: #f8fafc;
      }

      .spreadsheet-grid td:focus {
        background: #eff6ff;
        outline: 2px solid #3b82f6;
        outline-offset: -2px;
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

      .word-count {
        position: absolute;
        bottom: 8px;
        right: 16px;
        font-size: 12px;
        color: #9ca3af;
        background: white;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        border-top: 1px solid #e2e8f0;
        background: #fafafa;
        font-size: 12px;
        color: #6b7280;
      }

      .keyboard-shortcuts {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        margin: 8px 16px;
        font-size: 12px;
        color: #6b7280;
      }

      .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
      }

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .shortcut-key {
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 11px;
        color: #374151;
      }

      /* Rich text formatting styles */
      .rich-editor b,
      .rich-editor strong {
        font-weight: 700;
      }

      .rich-editor i,
      .rich-editor em {
        font-style: italic;
      }

      .rich-editor u {
        text-decoration: underline;
      }

      .rich-editor s,
      .rich-editor strike {
        text-decoration: line-through;
      }

      .rich-editor h1 {
        font-size: 24px;
        font-weight: 700;
        margin: 16px 0 8px 0;
        line-height: 1.2;
      }

      .rich-editor h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 14px 0 6px 0;
        line-height: 1.3;
      }

      .rich-editor h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 12px 0 6px 0;
        line-height: 1.4;
      }

      .rich-editor blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 16px;
        margin: 16px 0;
        color: #1e40af;
        font-style: italic;
      }

      .rich-editor code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 13px;
        color: #dc2626;
      }

      .rich-editor pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'JetBrains Mono', Consolas, monospace;
        font-size: 13px;
        margin: 16px 0;
      }

      .rich-editor ul {
        padding-left: 24px;
        margin: 8px 0;
      }

      .rich-editor ol {
        padding-left: 24px;
        margin: 8px 0;
      }

      .rich-editor li {
        margin: 4px 0;
      }

      .rich-editor a {
        color: #2563eb;
        text-decoration: underline;
      }

      .rich-editor a:hover {
        color: #1d4ed8;
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

      @if (showFormattingToolbar) {
        <div class="formatting-toolbar">
          <button
            class="format-btn"
            (click)="formatText('bold')"
            [class.active]="isFormatActive('bold')"
            title="Negrita (Ctrl+B)"
          >
            <b>B</b>
          </button>
          <button
            class="format-btn"
            (click)="formatText('italic')"
            [class.active]="isFormatActive('italic')"
            title="Cursiva (Ctrl+I)"
          >
            <i>I</i>
          </button>
          <button
            class="format-btn"
            (click)="formatText('underline')"
            [class.active]="isFormatActive('underline')"
            title="Subrayado (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            class="format-btn"
            (click)="formatText('strikethrough')"
            [class.active]="isFormatActive('strikethrough')"
            title="Tachado"
          >
            <s>S</s>
          </button>

          <div class="toolbar-separator"></div>

          <button
            class="format-btn"
            (click)="formatText('h1')"
            title="Título 1"
          >
            H1
          </button>
          <button
            class="format-btn"
            (click)="formatText('h2')"
            title="Título 2"
          >
            H2
          </button>
          <button
            class="format-btn"
            (click)="formatText('h3')"
            title="Título 3"
          >
            H3
          </button>

          <div class="toolbar-separator"></div>

          <button
            class="format-btn"
            (click)="formatText('bulletList')"
            title="Lista con viñetas"
          >
            • List
          </button>
          <button
            class="format-btn"
            (click)="formatText('numberedList')"
            title="Lista numerada"
          >
            1. List
          </button>
          <button
            class="format-btn"
            (click)="formatText('blockquote')"
            title="Cita"
          >
            ❝ Quote
          </button>
          <button
            class="format-btn"
            (click)="formatText('code')"
            title="Código"
          >
            &#96; Code &#96;
          </button>

          <div class="toolbar-separator"></div>

          <button
            class="format-btn"
            (click)="insertTable()"
            title="Insertar tabla"
          >
            📊
          </button>
          <button
            class="format-btn"
            (click)="insertTableFromCSV()"
            title="Importar tabla desde CSV"
          >
            📥 CSV
          </button>
          <button
            class="format-btn"
            (click)="insertLink()"
            title="Insertar enlace"
          >
            🔗
          </button>
          <button
            class="format-btn"
            (click)="insertImage()"
            title="Insertar imagen"
          >
            🖼️
          </button>
        </div>
      }

      <div class="editor-area">
        @if (currentMode() === 'markdown') {
          <textarea
            class="editor"
            [value]="content()"
            (input)="updateContent($any($event.target).value)"
            (keydown)="handleKeyDown($event)"
            placeholder="Escribe tu contenido en Markdown, HTML o texto plano..."
          ></textarea>
        }
        @if (currentMode() === 'text') {
          <div
            class="rich-editor"
            contenteditable="true"
            [innerHTML]="content()"
            (input)="updateContent($any($event.target).innerHTML)"
            (keydown)="handleKeyDown($event)"
            placeholder="Escribe tu texto aquí..."
          ></div>
        }
        @if (currentMode() === 'spreadsheet') {
          <div class="spreadsheet-view">
            <table class="spreadsheet-grid">
              <thead>
                <tr>
                  @for (
                    header of spreadsheetHeaders();
                    track header;
                    let i = $index
                  ) {
                    <th>{{ header }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of spreadsheetData(); track row; let i = $index) {
                  <tr>
                    @for (cell of row; track cell; let j = $index) {
                      <td
                        [contentEditable]="true"
                        (blur)="updateCell(i, j, $any($event.target).innerText)"
                        (keydown)="handleCellKeyDown($event, i, j)"
                      >
                        {{ cell }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
            <div
              style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;"
            >
              <button
                class="format-btn"
                (click)="addRow()"
                title="Añadir fila al final"
              >
                ➕ Fila
              </button>
              <button
                class="format-btn"
                (click)="addColumn()"
                title="Añadir columna al final"
              >
                ➕ Columna
              </button>
              <button
                class="format-btn"
                (click)="exportToCSV()"
                title="Exportar a CSV"
              >
                📤 CSV
              </button>
              <button
                class="format-btn"
                (click)="clearTable()"
                title="Limpiar tabla"
              >
                🗑️ Limpiar
              </button>
              <button
                class="format-btn"
                (click)="sortTable()"
                title="Ordenar tabla"
              >
                🔄 Ordenar
              </button>
            </div>
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
          <div
            class="rich-editor"
            contenteditable="true"
            [innerHTML]="content()"
            (input)="updateContent($any($event.target).innerHTML)"
            (keydown)="handleKeyDown($event)"
            placeholder="Escribe cualquier cosa. DOCS 2.0 detecta el formato automaticamente."
          ></div>
        }

        <div class="word-count">{{ wordCount() }} palabras</div>
      </div>

      <div class="status-bar">
        <span>Modo: {{ currentModeName }}</span>
        <span>Última modificación: {{ lastModified() }}</span>
      </div>

      @if (showKeyboardShortcuts()) {
        <div class="keyboard-shortcuts">
          <strong>Atajos de teclado:</strong>
          <div class="shortcuts-grid">
            <div class="shortcut-item">
              <span>Negrita</span>
              <span class="shortcut-key">Ctrl+B</span>
            </div>
            <div class="shortcut-item">
              <span>Cursiva</span>
              <span class="shortcut-key">Ctrl+I</span>
            </div>
            <div class="shortcut-item">
              <span>Subrayado</span>
              <span class="shortcut-key">Ctrl+U</span>
            </div>
            <div class="shortcut-item">
              <span>Guardar</span>
              <span class="shortcut-key">Ctrl+S</span>
            </div>
            <div class="shortcut-item">
              <span>Deshacer</span>
              <span class="shortcut-key">Ctrl+Z</span>
            </div>
            <div class="shortcut-item">
              <span>Rehacer</span>
              <span class="shortcut-key">Ctrl+Y</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UniversalEditorComponent {
  private readonly universalDocument = inject(UniversalDocumentService);

  readonly currentMode = signal<EditorMode>('auto');
  readonly content = signal('');
  readonly detectedFormat = signal<string | null>(null);
  readonly spreadsheetData = signal<string[][]>([]);
  readonly spreadsheetHeaders = signal<string[]>(['A', 'B', 'C', 'D', 'E']);
  readonly wordCount = signal(0);
  readonly lastModified = signal(new Date().toLocaleTimeString());
  readonly showKeyboardShortcuts = signal(false);

  readonly availableModes: { id: EditorMode; name: string; icon: string }[] = [
    { id: 'auto', name: 'Automático', icon: '🤖' },
    { id: 'markdown', name: 'Markdown', icon: '📑' },
    { id: 'spreadsheet', name: 'Tablas', icon: '📊' },
    { id: 'text', name: 'Texto', icon: '📃' },
    { id: 'pdf', name: 'PDF', icon: '📄' },
  ];

  get currentModeName(): string {
    return (
      this.availableModes.find((m) => m.id === this.currentMode())?.name ||
      'Desconocido'
    );
  }

  get showFormattingToolbar(): boolean {
    return this.currentMode() === 'text' || this.currentMode() === 'auto';
  }

  setMode(mode: EditorMode): void {
    this.currentMode.set(mode);

    if (mode === 'spreadsheet' && this.spreadsheetData().length === 0) {
      this.parseSpreadsheet();
    }
  }

  updateContent(value: string): void {
    this.content.set(value);
    this.updateWordCount(value);
    this.updateLastModified();
    this.autoDetectFormat(value);
  }

  setContent(value: string): void {
    this.content.set(value);
    this.updateWordCount(value);
    this.updateLastModified();
    this.autoDetectFormat(value);
  }

  getContent(): string {
    return this.content();
  }

  updateCell(row: number, col: number, value: string): void {
    const data = [...this.spreadsheetData()];
    if (!data[row]) data[row] = [];
    data[row][col] = value;
    this.spreadsheetData.set(data);
    this.updateLastModified();
  }

  private updateWordCount(content: string): void {
    // Remove HTML tags for word count in rich text mode
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const words = textContent ? textContent.split(/\s+/).length : 0;
    this.wordCount.set(words);
  }

  private updateLastModified(): void {
    this.lastModified.set(new Date().toLocaleTimeString());
  }

  formatText(format: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    let formattedText = '';
    let tagName = '';

    switch (format) {
      case 'bold':
        tagName = 'strong';
        break;
      case 'italic':
        tagName = 'em';
        break;
      case 'underline':
        tagName = 'u';
        break;
      case 'strikethrough':
        tagName = 's';
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'bulletList':
        formattedText = selectedText
          .split('\n')
          .map((line) => `- ${line}`)
          .join('\n');
        break;
      case 'numberedList':
        formattedText = selectedText
          .split('\n')
          .map((line, i) => `${i + 1}. ${line}`)
          .join('\n');
        break;
      case 'blockquote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
    }

    if (tagName) {
      formattedText = `<${tagName}>${selectedText}</${tagName}>`;
    }

    if (formattedText) {
      range.deleteContents();
      const textNode = document.createTextNode(formattedText);
      range.insertNode(textNode);

      // Update content signal
      const editor =
        range.commonAncestorContainer.parentElement?.closest('.rich-editor');
      if (editor) {
        this.updateContent(editor.innerHTML);
      }
    }
  }

  isFormatActive(format: string): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const element = range.commonAncestorContainer;

    if (element.nodeType === Node.TEXT_NODE) {
      const parent = element.parentElement;
      if (parent) {
        switch (format) {
          case 'bold':
            return (
              parent.tagName === 'STRONG' || parent.style.fontWeight === 'bold'
            );
          case 'italic':
            return (
              parent.tagName === 'EM' || parent.style.fontStyle === 'italic'
            );
          case 'underline':
            return (
              parent.tagName === 'U' ||
              parent.style.textDecoration === 'underline'
            );
          case 'strikethrough':
            return (
              parent.tagName === 'S' ||
              parent.style.textDecoration === 'line-through'
            );
        }
      }
    }

    return false;
  }

  insertTable(rows = 3, cols = 3): void {
    let tableHtml = '<table>\n';

    // Header row
    tableHtml += '<thead>\n<tr>\n';
    for (let j = 0; j < cols; j++) {
      tableHtml += `<th>Columna ${j + 1}</th>\n`;
    }
    tableHtml += '</tr>\n</thead>\n';

    // Data rows
    tableHtml += '<tbody>\n';
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>\n';
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td>Dato ${i + 1}-${j + 1}</td>\n`;
      }
      tableHtml += '</tr>\n';
    }
    tableHtml += '</tbody>\n</table>';

    this.insertHtmlAtCursor(tableHtml);
  }

  insertTableFromCSV(): void {
    const csvText = prompt(
      'Pega los datos CSV aquí (separados por comas o punto y coma):',
    );
    if (!csvText) return;

    try {
      // Detect separator
      const separator = csvText.includes(';') ? ';' : ',';
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(separator).map((h) => h.trim());
      const data = lines
        .slice(1)
        .map((line) => line.split(separator).map((cell) => cell.trim()));

      let tableHtml = '<table>\n<thead>\n<tr>\n';
      headers.forEach((header) => {
        tableHtml += `<th>${this.escapeHtml(header)}</th>\n`;
      });
      tableHtml += '</tr>\n</thead>\n<tbody>\n';

      data.forEach((row) => {
        tableHtml += '<tr>\n';
        row.forEach((cell) => {
          tableHtml += `<td>${this.escapeHtml(cell)}</td>\n`;
        });
        tableHtml += '</tr>\n';
      });
      tableHtml += '</tbody>\n</table>';

      this.insertHtmlAtCursor(tableHtml);
    } catch {
      alert(
        'Error al procesar los datos CSV. Asegúrate de que el formato sea correcto.',
      );
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  insertLink(): void {
    const url = prompt('Introduce la URL del enlace:');
    if (url) {
      const text = window.getSelection()?.toString() || 'enlace';
      const linkHtml = `<a href="${url}" target="_blank">${text}</a>`;
      this.insertHtmlAtCursor(linkHtml);
    }
  }

  insertImage(): void {
    const url = prompt('Introduce la URL de la imagen:');
    if (url) {
      const alt = prompt('Texto alternativo de la imagen:') || '';
      const imageHtml = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;">`;
      this.insertHtmlAtCursor(imageHtml);
    }
  }

  private insertHtmlAtCursor(html: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const fragment = document.createDocumentFragment();

    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    range.insertNode(fragment);

    // Update content
    const editor =
      range.commonAncestorContainer.parentElement?.closest('.rich-editor');
    if (editor) {
      this.updateContent(editor.innerHTML);
    }
  }

  addRow(): void {
    const data = [...this.spreadsheetData()];
    const newRow = new Array(this.spreadsheetHeaders().length).fill('');
    data.push(newRow);
    this.spreadsheetData.set(data);
  }

  addColumn(): void {
    const headers = [...this.spreadsheetHeaders()];
    const nextLetter = String.fromCharCode(
      headers[headers.length - 1].charCodeAt(0) + 1,
    );
    headers.push(nextLetter);
    this.spreadsheetHeaders.set(headers);

    const data = [...this.spreadsheetData()];
    data.forEach((row) => row.push(''));
    this.spreadsheetData.set(data);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          this.formatText('bold');
          break;
        case 'i':
          event.preventDefault();
          this.formatText('italic');
          break;
        case 'u':
          event.preventDefault();
          this.formatText('underline');
          break;
        case 's':
          event.preventDefault();
          // Save functionality can be added here
          break;
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            // Redo
          } else {
            // Undo
          }
          break;
        case 'y':
          event.preventDefault();
          // Redo
          break;
      }
    }

    // Toggle keyboard shortcuts with F1
    if (event.key === 'F1') {
      event.preventDefault();
      this.showKeyboardShortcuts.set(!this.showKeyboardShortcuts());
    }
  }

  exportToCSV(): void {
    const headers = this.spreadsheetHeaders();
    const data = this.spreadsheetData();

    let csv = headers.join(',') + '\n';
    data.forEach((row) => {
      csv +=
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'table.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  clearTable(): void {
    if (confirm('¿Estás seguro de que quieres limpiar toda la tabla?')) {
      this.spreadsheetData.set([]);
      this.spreadsheetHeaders.set(['A', 'B', 'C', 'D', 'E']);
    }
  }

  sortTable(): void {
    const column = prompt(
      'Introduce el número de columna para ordenar (1-based):',
    );
    if (!column) return;

    const colIndex = parseInt(column) - 1;
    if (
      isNaN(colIndex) ||
      colIndex < 0 ||
      colIndex >= this.spreadsheetHeaders().length
    ) {
      alert('Número de columna inválido');
      return;
    }

    const data = [...this.spreadsheetData()];
    data.sort((a, b) => {
      const aVal = a[colIndex] || '';
      const bVal = b[colIndex] || '';
      return aVal.localeCompare(bVal);
    });

    this.spreadsheetData.set(data);
  }

  handleCellKeyDown(event: KeyboardEvent, row: number, col: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const nextRow = row + 1;
      if (nextRow >= this.spreadsheetData().length) {
        this.addRow();
      }
      // Focus next row (implementation would need DOM access)
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const nextCol = col + 1;
      if (nextCol >= this.spreadsheetHeaders().length) {
        this.addColumn();
      }
      // Focus next column (implementation would need DOM access)
    } else if (event.key === 'Delete' && event.ctrlKey) {
      event.preventDefault();
      this.deleteRow(row);
    }
  }

  deleteRow(rowIndex: number): void {
    const data = [...this.spreadsheetData()];
    data.splice(rowIndex, 1);
    this.spreadsheetData.set(data);
  }

  deleteColumn(colIndex: number): void {
    const headers = [...this.spreadsheetHeaders()];
    headers.splice(colIndex, 1);
    this.spreadsheetHeaders.set(headers);

    const data = [...this.spreadsheetData()];
    data.forEach((row) => row.splice(colIndex, 1));
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
