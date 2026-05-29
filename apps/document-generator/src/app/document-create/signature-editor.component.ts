import { Component, signal, computed, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SignatureConfig {
  enabled: boolean;
  name: string;
  title: string;
  company: string;
  date: string;
  location: string;
  showLine: boolean;
  showDate: boolean;
  showLocation: boolean;
  signatureImageUrl: string;
  layout: 'horizontal' | 'vertical' | 'compact';
}

const DEFAULT_SIGNATURE_CONFIG: SignatureConfig = {
  enabled: false,
  name: '',
  title: '',
  company: '',
  date: '',
  location: '',
  showLine: true,
  showDate: true,
  showLocation: true,
  signatureImageUrl: '',
  layout: 'horizontal',
};

@Component({
  selector: 'app-signature-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .signature-editor-panel {
        background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
        border: 1px solid #fde68a;
        border-radius: 16px;
        padding: 1.5rem;
      }

      .signature-preview {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        min-height: 180px;
      }

      .signature-layout-horizontal {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
      }

      .signature-layout-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .signature-layout-compact {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
      }

      .signature-block {
        flex: 1;
        text-align: center;
      }

      .signature-line {
        border-top: 1px solid #374151;
        margin-bottom: 0.5rem;
        min-width: 180px;
      }

      .signature-name {
        font-weight: 600;
        color: #111827;
        font-size: 0.95rem;
      }

      .signature-title {
        color: #6b7280;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .signature-meta {
        color: #9ca3af;
        font-size: 0.75rem;
        margin-top: 0.5rem;
      }

      .signature-image {
        max-width: 150px;
        max-height: 60px;
        object-fit: contain;
        margin-bottom: 0.5rem;
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
        background: #f59e0b;
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
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #92400e;
        margin-bottom: 0.375rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-group input[type='text'],
      .form-group input[type='url'] {
        width: 100%;
        padding: 0.625rem 0.75rem;
        border: 1px solid #fde68a;
        border-radius: 8px;
        font-size: 0.875rem;
        background: white;
        transition: border-color 0.15s;
      }

      .form-group input:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
      }

      .layout-options {
        display: flex;
        gap: 0.5rem;
      }

      .layout-option {
        flex: 1;
        padding: 0.5rem;
        border: 2px solid #fde68a;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        font-size: 0.75rem;
        transition: all 0.15s;
        background: white;
      }

      .layout-option:hover {
        border-color: #f59e0b;
      }

      .layout-option.active {
        border-color: #f59e0b;
        background: #fffbeb;
        color: #92400e;
      }
    `,
  ],
  template: `
    <div class="signature-editor-panel">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-amber-900">Firma Digital</h3>
          <p class="text-xs text-amber-700 mt-0.5">Añade bloques de firma al final del documento</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-amber-700">Activar</span>
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
              <label>Nombre</label>
              <input
                type="text"
                [ngModel]="config().name"
                (ngModelChange)="update({ name: $event })"
                placeholder="Nombre del firmante"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label>Cargo</label>
                <input
                  type="text"
                  [ngModel]="config().title"
                  (ngModelChange)="update({ title: $event })"
                  placeholder="Cargo o puesto"
                />
              </div>
              <div class="form-group">
                <label>Empresa</label>
                <input
                  type="text"
                  [ngModel]="config().company"
                  (ngModelChange)="update({ company: $event })"
                  placeholder="Nombre de empresa"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label>Fecha</label>
                <input
                  type="text"
                  [ngModel]="config().date"
                  (ngModelChange)="update({ date: $event })"
                  placeholder="Fecha de firma"
                />
              </div>
              <div class="form-group">
                <label>Lugar</label>
                <input
                  type="text"
                  [ngModel]="config().location"
                  (ngModelChange)="update({ location: $event })"
                  placeholder="Ciudad"
                />
              </div>
            </div>

            <div class="form-group">
              <label>URL de imagen de firma (opcional)</label>
              <input
                type="url"
                [ngModel]="config().signatureImageUrl"
                (ngModelChange)="update({ signatureImageUrl: $event })"
                placeholder="https://ejemplo.com/firma.png"
              />
            </div>

            <div class="form-group">
              <label>Disposición</label>
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

            <div class="flex flex-wrap gap-4 pt-2">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="config().showLine"
                  (ngModelChange)="update({ showLine: $event })"
                  class="rounded"
                />
                Línea de firma
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
                  [ngModel]="config().showLocation"
                  (ngModelChange)="update({ showLocation: $event })"
                  class="rounded"
                />
                Mostrar lugar
              </label>
            </div>
          </div>

          <div class="lg:sticky lg:top-4 lg:self-start">
            <label class="text-xs font-medium text-amber-700 mb-2 block">Vista previa</label>
            <div class="signature-preview">
              @switch (config().layout) {
                @case ('horizontal') {
                  <div class="signature-layout-horizontal">
                    <div class="signature-block">
                      @if (config().signatureImageUrl) {
                        <img [src]="config().signatureImageUrl" class="signature-image" alt="Firma" />
                      }
                      @if (config().showLine) {
                        <div class="signature-line"></div>
                      }
                      <div class="signature-name">{{ config().name || 'Nombre del firmante' }}</div>
                      @if (config().title) {
                        <div class="signature-title">{{ config().title }}</div>
                      }
                      @if (config().company) {
                        <div class="signature-title">{{ config().company }}</div>
                      }
                      <div class="signature-meta">
                        @if (config().showLocation && config().location) {
                          <span>{{ config().location }}</span>
                          @if (config().showDate && config().date) {
                            <span>, </span>
                          }
                        }
                        @if (config().showDate && config().date) {
                          <span>{{ config().date }}</span>
                        }
                      </div>
                    </div>
                    <div class="signature-block">
                      @if (config().signatureImageUrl) {
                        <img [src]="config().signatureImageUrl" class="signature-image" alt="Firma" />
                      }
                      @if (config().showLine) {
                        <div class="signature-line"></div>
                      }
                      <div class="signature-name">{{ config().name || 'Nombre del firmante' }}</div>
                      @if (config().title) {
                        <div class="signature-title">{{ config().title }}</div>
                      }
                      @if (config().company) {
                        <div class="signature-title">{{ config().company }}</div>
                      }
                      <div class="signature-meta">
                        @if (config().showLocation && config().location) {
                          <span>{{ config().location }}</span>
                          @if (config().showDate && config().date) {
                            <span>, </span>
                          }
                        }
                        @if (config().showDate && config().date) {
                          <span>{{ config().date }}</span>
                        }
                      </div>
                    </div>
                  </div>
                }
                @case ('vertical') {
                  <div class="signature-layout-vertical">
                    @if (config().signatureImageUrl) {
                      <img [src]="config().signatureImageUrl" class="signature-image" alt="Firma" />
                    }
                    @if (config().showLine) {
                      <div class="signature-line" style="width: 200px;"></div>
                    }
                    <div class="signature-name">{{ config().name || 'Nombre del firmante' }}</div>
                    @if (config().title) {
                      <div class="signature-title">{{ config().title }}</div>
                    }
                    @if (config().company) {
                      <div class="signature-title">{{ config().company }}</div>
                    }
                    <div class="signature-meta">
                      @if (config().showLocation && config().location) {
                        <span>{{ config().location }}</span>
                        @if (config().showDate && config().date) {
                          <span>, </span>
                        }
                      }
                      @if (config().showDate && config().date) {
                        <span>{{ config().date }}</span>
                      }
                    </div>
                  </div>
                }
                @case ('compact') {
                  <div class="signature-layout-compact">
                    <div class="signature-block" style="text-align: left;">
                      @if (config().signatureImageUrl) {
                        <img [src]="config().signatureImageUrl" class="signature-image" style="max-width: 100px;" alt="Firma" />
                      }
                      @if (config().showLine) {
                        <div class="signature-line" style="min-width: 120px;"></div>
                      }
                      <div class="signature-name" style="font-size: 0.85rem;">{{ config().name || 'Nombre' }}</div>
                      <div class="signature-title" style="font-size: 0.7rem;">{{ config().title }}</div>
                    </div>
                    <div style="text-align: right; font-size: 0.75rem; color: #9ca3af;">
                      @if (config().showLocation && config().location) {
                        <div>{{ config().location }}</div>
                      }
                      @if (config().showDate && config().date) {
                        <div>{{ config().date }}</div>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SignatureEditorComponent {
  config = signal<SignatureConfig>({ ...DEFAULT_SIGNATURE_CONFIG });

  configChanged = output<SignatureConfig>();

  @Input() set initialConfig(value: Partial<SignatureConfig> | undefined) {
    if (value) {
      this.setConfig(value);
    }
  }

  readonly layouts = [
    { id: 'horizontal' as const, label: 'Horizontal' },
    { id: 'vertical' as const, label: 'Vertical' },
    { id: 'compact' as const, label: 'Compacto' },
  ];

  toggleEnabled(): void {
    this.config.update((c) => {
      const next = { ...c, enabled: !c.enabled };
      this.configChanged.emit(next);
      return next;
    });
  }

  update(partial: Partial<SignatureConfig>): void {
    this.config.update((c) => {
      const next = { ...c, ...partial };
      this.configChanged.emit(next);
      return next;
    });
  }

  getConfig(): SignatureConfig {
    return this.config();
  }

  setConfig(config: Partial<SignatureConfig>): void {
    this.config.update((c) => ({ ...c, ...config }));
  }

  exportToHtml(): string {
    const c = this.config();
    if (!c.enabled) return '';

    const signatureBlock = `
<div style="text-align: center; ${c.layout === 'horizontal' ? 'flex: 1;' : ''}">
  ${c.signatureImageUrl ? `<img src="${c.signatureImageUrl}" style="max-width: 150px; max-height: 60px; object-fit: contain; margin-bottom: 8px;" alt="Firma"/>` : ''}
  ${c.showLine ? '<div style="border-top: 1px solid #374151; margin: 0 auto 8px; min-width: 180px;"></div>' : ''}
  <div style="font-weight: 600; color: #111827; font-size: 0.95rem;">${c.name || 'Nombre del firmante'}</div>
  ${c.title ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.title}</div>` : ''}
  ${c.company ? `<div style="color: #6b7280; font-size: 0.8rem;">${c.company}</div>` : ''}
  <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 8px;">
    ${[c.showLocation && c.location ? c.location : '', c.showDate && c.date ? c.date : ''].filter(Boolean).join(', ')}
  </div>
</div>`;

    if (c.layout === 'horizontal') {
      return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; gap: 40px;">
    ${signatureBlock}
    ${signatureBlock}
  </div>
</div>`;
    }

    if (c.layout === 'vertical') {
      return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
  ${signatureBlock}
</div>`;
    }

    return `
<div class="pdf-signatures" style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    ${signatureBlock}
    <div style="text-align: right; font-size: 0.75rem; color: #9ca3af;">
      ${c.showLocation && c.location ? `<div>${c.location}</div>` : ''}
      ${c.showDate && c.date ? `<div>${c.date}</div>` : ''}
    </div>
  </div>
</div>`;
  }
}
