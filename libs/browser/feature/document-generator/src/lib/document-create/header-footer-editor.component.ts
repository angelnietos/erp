import {
  Component,
  signal,
  inject,
  viewChild,
  ElementRef,
  computed,
  Input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HeaderFooterConfig {
  enabled: boolean;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  showPageNumbers: boolean;
  pageNumberFormat: 'simple' | 'x-of-y' | 'page-x';
  startPageFrom: number;
  showDivider: boolean;
  fontSize: string;
  textColor: string;
  backgroundColor: string;
}

const DEFAULT_CONFIG: HeaderFooterConfig = {
  enabled: false,
  headerLeft: '',
  headerCenter: '',
  headerRight: '',
  footerLeft: '',
  footerCenter: '',
  footerRight: 'Página {page}',
  showPageNumbers: true,
  pageNumberFormat: 'simple',
  startPageFrom: 1,
  showDivider: true,
  fontSize: '9pt',
  textColor: '#64748b',
  backgroundColor: 'transparent',
};

@Component({
  selector: 'app-header-footer-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .hf-editor-panel {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1px solid #bfdbfe;
        border-radius: 16px;
        padding: 1.5rem;
      }

      .hf-preview-page {
        background: white;
        aspect-ratio: 210/297;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        position: relative;
        overflow: hidden;
      }

      .hf-preview-header {
        display: flex;
        justify-content: space-between;
        padding: 12px 20px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 0.65rem;
        color: #64748b;
      }

      .hf-preview-body {
        padding: 30px 20px;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 0.7rem;
      }

      .hf-preview-footer {
        display: flex;
        justify-content: space-between;
        padding: 12px 20px;
        border-top: 1px solid #e2e8f0;
        font-size: 0.65rem;
        color: #64748b;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.15s;
      }

      .toggle-switch.active {
        background: #3b82f6;
      }

      .toggle-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.15s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .toggle-switch.active::after {
        transform: translateX(20px);
      }

      .form-group {
        margin-bottom: 0.875rem;
      }

      .form-group label {
        display: block;
        font-size: 0.7rem;
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-group input[type='text'],
      .form-group input[type='number'],
      .form-group select {
        width: 100%;
        padding: 0.5rem 0.625rem;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        font-size: 0.8rem;
        background: white;
        transition: border-color 0.15s;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .section-title {
        font-size: 0.7rem;
        font-weight: 700;
        color: #1e40af;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding-bottom: 0.375rem;
        border-bottom: 2px solid #bfdbfe;
        margin-bottom: 0.75rem;
      }

      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }

      .variable-chip {
        display: inline-block;
        padding: 2px 6px;
        background: #dbeafe;
        border-radius: 4px;
        font-size: 0.65rem;
        font-family: monospace;
        color: #1e40af;
        cursor: pointer;
        transition: background 0.15s;
        margin: 2px;
      }

      .variable-chip:hover {
        background: #93c5fd;
      }

      .num-format-options {
        display: flex;
        gap: 0.375rem;
      }

      .num-format-option {
        flex: 1;
        padding: 0.375rem;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        text-align: center;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.15s;
        background: white;
      }

      .num-format-option:hover {
        border-color: #3b82f6;
      }

      .num-format-option.active {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #1e40af;
      }
    `,
  ],
  template: `
    <div class="hf-editor-panel">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-blue-900">
            Encabezado y Pie de Página
          </h3>
          <p class="text-xs text-blue-700 mt-0.5">
            Elementos que aparecerán en cada página del PDF
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-blue-700">Activar</span>
          <div
            class="toggle-switch"
            [class.active]="config().enabled"
            (click)="toggleEnabled()"
          ></div>
        </div>
      </div>

      @if (config().enabled) {
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs text-blue-600">Variables disponibles:</span>
            @for (v of variables; track v.code) {
              <span
                class="variable-chip"
                (click)="insertVariable(v.code)"
                [title]="v.label"
              >
                {{ v.code }}
              </span>
            }
          </div>

          <div>
            <div class="section-title">Encabezado</div>
            <div class="grid-3">
              <div class="form-group">
                <label>Izquierda</label>
                <input
                  type="text"
                  [ngModel]="config().headerLeft"
                  (ngModelChange)="update({ headerLeft: $event })"
                  placeholder="Texto..."
                />
              </div>
              <div class="form-group">
                <label>Centro</label>
                <input
                  type="text"
                  [ngModel]="config().headerCenter"
                  (ngModelChange)="update({ headerCenter: $event })"
                  placeholder="Texto..."
                />
              </div>
              <div class="form-group">
                <label>Derecha</label>
                <input
                  type="text"
                  [ngModel]="config().headerRight"
                  (ngModelChange)="update({ headerRight: $event })"
                  placeholder="Texto..."
                />
              </div>
            </div>
          </div>

          <div>
            <div class="section-title">Pie de página</div>
            <div class="grid-3">
              <div class="form-group">
                <label>Izquierda</label>
                <input
                  type="text"
                  [ngModel]="config().footerLeft"
                  (ngModelChange)="update({ footerLeft: $event })"
                  placeholder="Texto..."
                />
              </div>
              <div class="form-group">
                <label>Centro</label>
                <input
                  type="text"
                  [ngModel]="config().footerCenter"
                  (ngModelChange)="update({ footerCenter: $event })"
                  placeholder="Texto..."
                />
              </div>
              <div class="form-group">
                <label>Derecha</label>
                <input
                  type="text"
                  [ngModel]="config().footerRight"
                  (ngModelChange)="update({ footerRight: $event })"
                  placeholder="Texto..."
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label>Formato de número de página</label>
              <div class="num-format-options">
                @for (format of pageFormats; track format.id) {
                  <div
                    class="num-format-option"
                    [class.active]="config().pageNumberFormat === format.id"
                    (click)="update({ pageNumberFormat: format.id })"
                  >
                    {{ format.example }}
                  </div>
                }
              </div>
            </div>
            <div class="form-group">
              <label>Empezar numeración desde</label>
              <input
                type="number"
                [ngModel]="config().startPageFrom"
                (ngModelChange)="update({ startPageFrom: +$event })"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Tamaño de fuente</label>
              <select
                [ngModel]="config().fontSize"
                (ngModelChange)="update({ fontSize: $event })"
              >
                <option value="8pt">8pt (Pequeño)</option>
                <option value="9pt">9pt (Normal)</option>
                <option value="10pt">10pt (Mediano)</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                [ngModel]="config().showPageNumbers"
                (ngModelChange)="update({ showPageNumbers: $event })"
                class="rounded"
              />
              Mostrar número de página
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                [ngModel]="config().showDivider"
                (ngModelChange)="update({ showDivider: $event })"
                class="rounded"
              />
              Mostrar línea separadora
            </label>
          </div>

          <div>
            <label class="text-xs font-medium text-blue-700 mb-2 block"
              >Vista previa</label
            >
            <div class="hf-preview-page">
              <div
                class="hf-preview-header"
                [style.font-size]="config().fontSize"
                [style.color]="config().textColor"
              >
                <span>{{
                  resolveVariables(config().headerLeft) || 'Encabezado izq.'
                }}</span>
                <span>{{
                  resolveVariables(config().headerCenter) || 'Centro'
                }}</span>
                <span>{{
                  resolveVariables(config().headerRight) || 'Encabezado der.'
                }}</span>
              </div>
              <div class="hf-preview-body">Contenido de la página...</div>
              <div
                class="hf-preview-footer"
                [style.font-size]="config().fontSize"
                [style.color]="config().textColor"
              >
                <span>{{
                  resolveVariables(config().footerLeft) || 'Pie izq.'
                }}</span>
                <span>{{
                  resolveVariables(config().footerCenter) || 'Centro'
                }}</span>
                <span>{{
                  resolveVariables(config().footerRight) || pageNumberPreview
                }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HeaderFooterEditorComponent {
  config = signal<HeaderFooterConfig>({ ...DEFAULT_CONFIG });

  configChanged = output<HeaderFooterConfig>();

  @Input() set initialConfig(value: Partial<HeaderFooterConfig> | undefined) {
    if (value) {
      this.setConfig(value);
    }
  }

  readonly variables = [
    { code: '{page}', label: 'Número de página' },
    { code: '{total}', label: 'Total de páginas' },
    { code: '{title}', label: 'Título del documento' },
    { code: '{date}', label: 'Fecha actual' },
    { code: '{author}', label: 'Autor' },
  ];

  readonly pageFormats = [
    { id: 'simple' as const, example: '5' },
    { id: 'x-of-y' as const, example: '5 de 12' },
    { id: 'page-x' as const, example: 'Pág. 5' },
  ];

  previewTitle = 'Mi Documento';
  previewAuthor = 'Autor';

  get pageNumberPreview(): string {
    switch (this.config().pageNumberFormat) {
      case 'simple':
        return String(this.config().startPageFrom);
      case 'x-of-y':
        return `${this.config().startPageFrom} de 12`;
      case 'page-x':
        return `Pág. ${this.config().startPageFrom}`;
      default:
        return String(this.config().startPageFrom);
    }
  }

  toggleEnabled(): void {
    this.config.update((c) => {
      const next = { ...c, enabled: !c.enabled };
      this.configChanged.emit(next);
      return next;
    });
  }

  update(partial: Partial<HeaderFooterConfig>): void {
    this.config.update((c) => {
      const next = { ...c, ...partial };
      this.configChanged.emit(next);
      return next;
    });
  }

  insertVariable(variableCode: string): void {
    const currentActive = this.activeField();
    if (currentActive) {
      this.config.update((c) => ({
        ...c,
        [currentActive]:
          c[currentActive as keyof HeaderFooterConfig] + variableCode,
      }));
    }
  }

  activeField = signal<string | null>(null);

  setActiveField(field: string | null): void {
    this.activeField.set(field);
  }

  getConfig(): HeaderFooterConfig {
    return this.config();
  }

  setConfig(config: Partial<HeaderFooterConfig>): void {
    this.config.update((c) => ({ ...c, ...config }));
  }

  resolveVariables(text: string, title?: string, author?: string): string {
    if (!text) return '';
    return text
      .replace(/\{page\}/g, String(this.config().startPageFrom))
      .replace(/\{total\}/g, '12')
      .replace(/\{title\}/g, title || this.previewTitle)
      .replace(/\{date\}/g, new Date().toLocaleDateString('es-ES'))
      .replace(/\{author\}/g, author || this.previewAuthor);
  }

  exportToCss(): string {
    const c = this.config();
    if (!c.enabled) return '';

    const headerContent = [c.headerLeft, c.headerCenter, c.headerRight]
      .map((t) => this.resolveVariables(t))
      .some(Boolean);

    const footerContent = [c.footerLeft, c.footerCenter, c.footerRight]
      .map((t) => this.resolveVariables(t))
      .some(Boolean);

    if (!headerContent && !footerContent && !c.showPageNumbers) return '';

    return `
@page {
  margin: 25mm 20mm 25mm 20mm;

  @top-left {
    content: "${this.escapeCssString(this.resolveVariables(c.headerLeft))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    ${c.showDivider ? 'border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;' : ''}
  }
  @top-center {
    content: "${this.escapeCssString(this.resolveVariables(c.headerCenter))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    text-align: center;
  }
  @top-right {
    content: "${this.escapeCssString(this.resolveVariables(c.headerRight))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    text-align: right;
  }
  @bottom-left {
    content: "${this.escapeCssString(this.resolveVariables(c.footerLeft))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    ${c.showDivider ? 'border-top: 1px solid #e2e8f0; padding-top: 8px;' : ''}
  }
  @bottom-center {
    content: "${this.escapeCssString(this.resolveVariables(c.footerCenter))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    text-align: center;
  }
  @bottom-right {
    content: "${this.escapeCssString(this.resolveVariables(c.footerRight))}";
    font-size: ${c.fontSize};
    color: ${c.textColor};
    text-align: right;
  }
}

@page :first {
  margin-top: 10mm;
}`;
  }

  private escapeCssString(str: string): string {
    if (!str) return '';
    return str.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
  }
}
