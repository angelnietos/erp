import { Component, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoverEditorComponent,
  type CoverConfig,
} from './cover-editor.component';
import {
  SignatureEditorComponent,
  type SignatureConfig,
} from './signature-editor.component';
import {
  HeaderFooterEditorComponent,
  type HeaderFooterConfig,
} from './header-footer-editor.component';
import {
  WatermarkDialogComponent,
  type WatermarkConfig,
} from './watermark-dialog.component';
import { TableBuilderComponent } from './table-builder.component';
import { ImageInsertComponent } from './image-insert.component';

@Component({
  selector: 'app-document-tools-modal',
  standalone: true,
  imports: [
    CommonModule,
    CoverEditorComponent,
    SignatureEditorComponent,
    HeaderFooterEditorComponent,
    WatermarkDialogComponent,
    TableBuilderComponent,
    ImageInsertComponent,
  ],
  template: `
    @if (active()) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center dg-overlay backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="modalTitle()"
      >
        <div
          class="dg-modal rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div
            class="dg-modal__header px-6 py-4 flex justify-between items-center"
          >
            <div>
              <h2 class="text-base font-bold text-primary">
                {{ modalTitle() }}
              </h2>
              <p class="dg-modal__subtitle text-xs mt-0.5">
                {{ modalSubtitle() }}
              </p>
            </div>
            <button
              type="button"
              class="p-2 rounded-full transition-colors text-muted hover:text-primary"
              style="background: transparent"
              (click)="closeAll.emit()"
              aria-label="Cerrar"
            >
              <span class="text-lg leading-none">×</span>
            </button>
          </div>

          <div
            class="flex-1 overflow-y-auto p-6"
            style="background: color-mix(in srgb, var(--bg-tertiary, var(--bg-secondary)) 50%, transparent)"
          >
          @if (showCoverEditor()) {
            <app-cover-editor
              #coverEditorRef
              [initialConfig]="coverConfig()"
              (configChanged)="coverConfigChange.emit($event)"
            ></app-cover-editor>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="dg-btn-secondary text-xs" (click)="closeAll.emit()">
                Cerrar
              </button>
              <button
                type="button"
                class="dg-btn-primary text-xs"
                (click)="insertCover.emit(); closeAll.emit()"
              >
                Insertar en Documento
              </button>
            </div>
          }

          @if (showSignatureEditor()) {
            <app-signature-editor
              #signatureEditorRef
              [initialConfig]="signatureConfig()"
              (configChanged)="signatureConfigChange.emit($event)"
            ></app-signature-editor>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="dg-btn-secondary text-xs" (click)="closeAll.emit()">
                Cerrar
              </button>
              <button
                type="button"
                class="dg-btn-primary text-xs"
                (click)="insertSignature.emit(); closeAll.emit()"
              >
                Insertar en Documento
              </button>
            </div>
          }

          @if (showHeaderFooterEditor()) {
            <app-header-footer-editor
              #headerFooterEditorRef
              [initialConfig]="headerFooterConfig()"
              (configChanged)="headerFooterConfigChange.emit($event)"
            ></app-header-footer-editor>
            <div class="mt-4 flex justify-end">
              <button type="button" class="dg-btn-primary text-xs" (click)="closeAll.emit()">
                Aceptar
              </button>
            </div>
          }

          @if (showTableBuilder()) {
            <app-table-builder #tableBuilderRef></app-table-builder>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="dg-btn-secondary text-xs" (click)="closeAll.emit()">
                Cancelar
              </button>
              <button
                type="button"
                class="dg-btn-primary text-xs"
                (click)="insertTable.emit(); closeAll.emit()"
              >
                Insertar Tabla
              </button>
            </div>
          }

          @if (showImageInsert()) {
            <app-image-insert #imageInsertRef></app-image-insert>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="dg-btn-secondary text-xs" (click)="closeAll.emit()">
                Cancelar
              </button>
              <button
                type="button"
                class="dg-btn-primary text-xs"
                (click)="insertImage.emit(); closeAll.emit()"
              >
                Insertar Imagen
              </button>
            </div>
          }

          @if (showWatermarkEditor()) {
            <app-watermark-dialog
              #watermarkEditorRef
              [initialConfig]="watermarkConfig()"
              (configChanged)="watermarkConfigChange.emit($event)"
            ></app-watermark-dialog>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="dg-btn-secondary text-xs" (click)="closeAll.emit()">
                Cerrar
              </button>
              <button
                type="button"
                class="dg-btn-primary text-xs"
                (click)="insertWatermark.emit(); closeAll.emit()"
              >
                Insertar marca de agua
              </button>
            </div>
          }
          </div>
        </div>
      </div>
    }
  `,
})
export class DocumentToolsModalComponent {
  readonly active = input(false);
  readonly modalTitle = input('');
  readonly modalSubtitle = input('');
  readonly showCoverEditor = input(false);
  readonly showSignatureEditor = input(false);
  readonly showHeaderFooterEditor = input(false);
  readonly showTableBuilder = input(false);
  readonly showImageInsert = input(false);
  readonly showWatermarkEditor = input(false);
  readonly coverConfig = input<Partial<CoverConfig>>({ enabled: false });
  readonly signatureConfig = input<Partial<SignatureConfig>>({
    enabled: false,
  });
  readonly headerFooterConfig = input<Partial<HeaderFooterConfig>>({
    enabled: false,
  });
  readonly watermarkConfig = input<Partial<WatermarkConfig>>({
    enabled: false,
  });

  readonly closeAll = output<void>();
  readonly coverConfigChange = output<CoverConfig>();
  readonly signatureConfigChange = output<SignatureConfig>();
  readonly headerFooterConfigChange = output<HeaderFooterConfig>();
  readonly watermarkConfigChange = output<WatermarkConfig>();
  readonly insertCover = output<void>();
  readonly insertSignature = output<void>();
  readonly insertWatermark = output<void>();
  readonly insertTable = output<void>();
  readonly insertImage = output<void>();

  @ViewChild('coverEditorRef') coverEditor?: CoverEditorComponent;
  @ViewChild('signatureEditorRef') signatureEditor?: SignatureEditorComponent;
  @ViewChild('headerFooterEditorRef')
  headerFooterEditor?: HeaderFooterEditorComponent;
  @ViewChild('tableBuilderRef') tableBuilder?: TableBuilderComponent;
  @ViewChild('imageInsertRef') imageInsert?: ImageInsertComponent;
  @ViewChild('watermarkEditorRef') watermarkEditor?: WatermarkDialogComponent;
}
