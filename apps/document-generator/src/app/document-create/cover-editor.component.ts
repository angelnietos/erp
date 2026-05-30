import { Component, inject, signal, computed, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { exportCoverConfigToHtml } from '../utils/document-export-html';

export interface CoverConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  logoUrl: string;
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  backgroundImageUrl: string;
  textColor: string;
  showDivider: boolean;
  showDate: boolean;
  showAuthor: boolean;
  layout: 'centered' | 'left-aligned' | 'minimal' | 'bold';
  titleFontSize: string;
  subtitleFontSize: string;
}

const DEFAULT_COVER_CONFIG: CoverConfig = {
  enabled: false,
  title: '',
  subtitle: '',
  author: '',
  date: '',
  logoUrl: '',
  backgroundType: 'gradient',
  backgroundColor: '#7a0000',
  gradientFrom: '#420000',
  gradientTo: '#7a0000',
  backgroundImageUrl: '',
  textColor: '#ffffff',
  showDivider: true,
  showDate: true,
  showAuthor: true,
  layout: 'centered',
  titleFontSize: '2.25rem',
  subtitleFontSize: '1rem',
};

@Component({
  selector: 'app-cover-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styles: [
    `
      .cover-editor-panel {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
      }

      .cover-editor-preview {
        aspect-ratio: 210/297;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .cover-layout-centered {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 3rem 2rem;
        text-align: center;
      }

      .cover-layout-left-aligned {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
        padding: 2rem;
        text-align: left;
      }

      .cover-layout-minimal {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        text-align: center;
      }

      .cover-layout-bold {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        padding: 2rem;
        text-align: center;
      }

      .cover-title {
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 1rem;
        letter-spacing: -0.03em;
      }

      .cover-subtitle {
        font-weight: 400;
        opacity: 0.9;
        margin-bottom: 1.5rem;
      }

      .cover-divider {
        width: 80px;
        height: 4px;
        border-radius: 999px;
        margin: 1.5rem auto;
        background: currentColor;
        opacity: 0.5;
      }

      .cover-meta {
        font-size: 0.875rem;
        opacity: 0.85;
        margin-top: auto;
      }

      .cover-logo {
        max-width: 120px;
        max-height: 60px;
        object-fit: contain;
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 0.375rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-group input[type='text'],
      .form-group input[type='url'],
      .form-group select {
        width: 100%;
        padding: 0.625rem 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.875rem;
        background: white;
        transition: border-color 0.15s;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .color-input-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .color-input-row input[type='color'] {
        width: 40px;
        height: 36px;
        padding: 0;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .layout-option {
        padding: 0.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        font-size: 0.75rem;
        transition: all 0.15s;
      }

      .layout-option:hover {
        border-color: #3b82f6;
      }

      .layout-option.active {
        border-color: #3b82f6;
        background: #eff6ff;
        color: #1d4ed8;
      }

      .background-type-tabs {
        display: flex;
        gap: 0.25rem;
        background: #f1f5f9;
        padding: 0.25rem;
        border-radius: 8px;
      }

      .background-type-tab {
        flex: 1;
        padding: 0.5rem;
        text-align: center;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .background-type-tab.active {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        color: #0f172a;
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
    `,
  ],
  template: `
    <div class="cover-editor-panel">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-slate-800">Portada del Documento</h3>
          <p class="text-xs text-slate-500 mt-0.5">Personaliza la primera página de tu PDF</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Activar</span>
          <div
            class="toggle-switch"
            [class.active]="config().enabled"
            (click)="toggleEnabled()"
          ></div>
        </div>
      </div>

      @if (config().enabled) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="space-y-4">
            <div class="form-group">
              <label>Título</label>
              <input
                type="text"
                [ngModel]="config().title"
                (ngModelChange)="update({ title: $event })"
                placeholder="Título del documento"
              />
            </div>

            <div class="form-group">
              <label>Subtítulo</label>
              <input
                type="text"
                [ngModel]="config().subtitle"
                (ngModelChange)="update({ subtitle: $event })"
                placeholder="Subtítulo opcional"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label>Tamaño del título</label>
                <select
                  [ngModel]="config().titleFontSize"
                  (ngModelChange)="update({ titleFontSize: $event })"
                >
                  <option value="1.75rem">Pequeño</option>
                  <option value="2rem">Mediano</option>
                  <option value="2.25rem">Grande</option>
                  <option value="2.75rem">Extra grande</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tamaño del subtítulo</label>
                <select
                  [ngModel]="config().subtitleFontSize"
                  (ngModelChange)="update({ subtitleFontSize: $event })"
                >
                  <option value="0.95rem">Pequeño</option>
                  <option value="1rem">Medio</option>
                  <option value="1.1rem">Grande</option>
                  <option value="1.25rem">Extra grande</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label>Autor</label>
                <input
                  type="text"
                  [ngModel]="config().author"
                  (ngModelChange)="update({ author: $event })"
                  placeholder="Nombre del autor"
                />
              </div>
              <div class="form-group">
                <label>Fecha</label>
                <input
                  type="text"
                  [ngModel]="config().date"
                  (ngModelChange)="update({ date: $event })"
                  placeholder="Fecha"
                />
              </div>
            </div>

            <div class="form-group">
              <label>URL del Logo (opcional)</label>
              <input
                type="url"
                [ngModel]="config().logoUrl"
                (ngModelChange)="update({ logoUrl: $event })"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>

            <div class="form-group">
              <label>Diseño de portada</label>
              <div class="layout-options">
                @for (layout of layouts; track layout.id) {
                  <div
                    class="layout-option"
                    [class.active]="config().layout === layout.id"
                    (click)="update({ layout: layout.id })"
                  >
                    {{ layout.label }}
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Fondo</label>
              <div class="background-type-tabs">
                @for (type of backgroundTypes; track type.id) {
                  <div
                    class="background-type-tab"
                    [class.active]="config().backgroundType === type.id"
                    (click)="update({ backgroundType: type.id })"
                  >
                    {{ type.label }}
                  </div>
                }
              </div>
            </div>

            @if (config().backgroundType === 'solid') {
              <div class="form-group">
                <label>Color de fondo</label>
                <div class="color-input-row">
                  <input
                    type="color"
                    [ngModel]="config().backgroundColor"
                    (ngModelChange)="update({ backgroundColor: $event })"
                  />
                  <input
                    type="text"
                    class="flex-1"
                    [ngModel]="config().backgroundColor"
                    (ngModelChange)="update({ backgroundColor: $event })"
                  />
                </div>
              </div>
            }

            @if (config().backgroundType === 'gradient') {
              <div class="form-group">
                <label>Gradiente</label>
                <div class="color-input-row">
                  <input
                    type="color"
                    [ngModel]="config().gradientFrom"
                    (ngModelChange)="update({ gradientFrom: $event })"
                    title="Color inicial"
                  />
                  <input
                    type="color"
                    [ngModel]="config().gradientTo"
                    (ngModelChange)="update({ gradientTo: $event })"
                    title="Color final"
                  />
                </div>
              </div>
            }

            @if (config().backgroundType === 'image') {
              <div class="form-group">
                <label>URL de imagen de fondo</label>
                <input
                  type="url"
                  [ngModel]="config().backgroundImageUrl"
                  (ngModelChange)="update({ backgroundImageUrl: $event })"
                  placeholder="https://ejemplo.com/fondo.png"
                />
              </div>
            }

            <div class="form-group">
              <label>Color de texto</label>
              <div class="color-input-row">
                <input
                  type="color"
                  [ngModel]="config().textColor"
                  (ngModelChange)="update({ textColor: $event })"
                />
                <input
                  type="text"
                  class="flex-1"
                  [ngModel]="config().textColor"
                  (ngModelChange)="update({ textColor: $event })"
                />
              </div>
            </div>

            <div class="flex flex-wrap gap-4 pt-2">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="config().showDivider"
                  (ngModelChange)="update({ showDivider: $event })"
                  class="rounded"
                />
                Mostrar separador
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="config().showDate"
                  (ngModelChange)="update({ showDate: $event })"
                  class="rounded"
                />
                Mostrar fecha
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="config().showAuthor"
                  (ngModelChange)="update({ showAuthor: $event })"
                  class="rounded"
                />
                Mostrar autor
              </label>
            </div>
          </div>

          <div class="lg:sticky lg:top-4 lg:self-start">
            <label class="text-xs font-medium text-slate-500 mb-2 block">Vista previa</label>
            <div
              class="cover-editor-preview"
              [style.background]="coverBackgroundStyle"
            >
              <div [class]="'cover-layout-' + config().layout">
                @if (config().logoUrl) {
                  <img [src]="config().logoUrl" class="cover-logo" alt="Logo" />
                }

                <h1
                  class="cover-title"
                  [style.color]="config().textColor"
                  [style.font-size]="config().titleFontSize"
                >
                  {{ config().title || 'Título del documento' }}
                </h1>

                @if (config().subtitle) {
                  <p
                    class="cover-subtitle"
                    [style.color]="config().textColor"
                    [style.font-size]="config().subtitleFontSize"
                  >
                    {{ config().subtitle }}
                  </p>
                }

                @if (config().showDivider) {
                  <div
                    class="cover-divider"
                    [style.background]="config().textColor"
                  ></div>
                }

                <div
                  class="cover-meta"
                  [style.color]="config().textColor"
                >
                  @if (config().showAuthor && config().author) {
                    <span>{{ config().author }}</span>
                  }
                  @if (config().showDate && config().date) {
                    @if (config().showAuthor && config().author) {
                      <span> · </span>
                    }
                    <span>{{ config().date }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CoverEditorComponent {
  config = signal<CoverConfig>({ ...DEFAULT_COVER_CONFIG });

  configChanged = output<CoverConfig>();

  @Input() set initialConfig(value: Partial<CoverConfig> | undefined) {
    if (value) {
      this.setConfig(value);
    }
  }

  readonly layouts = [
    { id: 'centered' as const, label: 'Centrado' },
    { id: 'left-aligned' as const, label: 'Alineado Izq.' },
    { id: 'minimal' as const, label: 'Minimalista' },
    { id: 'bold' as const, label: 'Negrita' },
  ];

  readonly backgroundTypes = [
    { id: 'gradient' as const, label: 'Gradiente' },
    { id: 'solid' as const, label: 'Sólido' },
    { id: 'image' as const, label: 'Imagen' },
  ];

  get titleFontSize(): string {
    switch (this.config().layout) {
      case 'bold':
        return '2.5rem';
      case 'centered':
        return '2.25rem';
      case 'left-aligned':
        return '2rem';
      case 'minimal':
        return '1.75rem';
      default:
        return '2rem';
    }
  }

  get subtitleFontSize(): string {
    switch (this.config().layout) {
      case 'bold':
        return '1.125rem';
      default:
        return '1rem';
    }
  }

  get coverBackgroundStyle(): string {
    const c = this.config();
    switch (c.backgroundType) {
      case 'gradient':
        return `linear-gradient(135deg, ${c.gradientFrom} 0%, ${c.gradientTo} 100%)`;
      case 'solid':
        return c.backgroundColor;
      case 'image':
        if (c.backgroundImageUrl) {
          return `url("${c.backgroundImageUrl}") center/cover no-repeat`;
        }
        return c.backgroundColor;
      default:
        return `linear-gradient(135deg, ${c.gradientFrom} 0%, ${c.gradientTo} 100%)`;
    }
  }

  toggleEnabled(): void {
    this.config.update((c) => {
      const next = { ...c, enabled: !c.enabled };
      this.configChanged.emit(next);
      return next;
    });
  }

  update(partial: Partial<CoverConfig>): void {
    this.config.update((c) => {
      const next = { ...c, ...partial };
      this.configChanged.emit(next);
      return next;
    });
  }

  getConfig(): CoverConfig {
    return this.config();
  }

  setConfig(config: Partial<CoverConfig>): void {
    this.config.update((c) => ({ ...c, ...config }));
  }

  exportToMarkdown(): string {
    const c = this.config();
    if (!c.enabled) return '';

    return `\n---\n\n<div class="cover">\n<div class="cover-inner cover-layout-${c.layout}">\n${c.logoUrl ? `<img src="${c.logoUrl}" class="cover-logo" />\n` : ''}<h1 class="cover-title" style="font-size: ${c.titleFontSize};">${c.title}</h1>\n${c.subtitle ? `<p class="cover-subtitle" style="font-size: ${c.subtitleFontSize};">${c.subtitle}</p>\n` : ''}${c.showDivider ? '<div class="cover-divider"></div>\n' : ''}<div class="cover-meta">\n${c.showAuthor && c.author ? `<span>${c.author}</span>\n` : ''}${c.showDate && c.date ? `<span>${c.date}</span>\n` : ''}</div>\n</div>\n</div>\n\n---\n`;
  }

  exportToHtml(): string {
    return exportCoverConfigToHtml(this.config());
  }
}
