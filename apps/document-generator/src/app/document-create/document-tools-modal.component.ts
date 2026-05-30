import { Component, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoverEditorComponent, type CoverConfig } from './cover-editor.component';
import { SignatureEditorComponent, type SignatureConfig } from './signature-editor.component';
import { HeaderFooterEditorComponent, type HeaderFooterConfig } from './header-footer-editor.component';
import { WatermarkDialogComponent, type WatermarkConfig } from './watermark-dialog.component';
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
    <div
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300"
      [class.opacity-0]="!active()"
      [class.opacity-0]="!active()"
      [class.pointer-events-none]="!active()"
    >
      <div
        class="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform"
        [class.scale-95]="!active()"
        [class.scale-100]="active()"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 class="text-base font-bold text-slate-800">{{ modalTitle() }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ modalSubtitle() }}</p>
          </div>
          <button
            type="button"
            class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            (click)="closeAll.emit()"
          >
            <span class="text-lg">×</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          @if (showCoverEditor()) {
            <app-cover-editor
              #coverEditorRef
              [initialConfig]="coverConfig()"
              (configChanged)="coverConfigChange.emit($event)"
            ></app-cover-editor>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50" (click)="closeAll.emit()">Cerrar</button>
              <button type="button" class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700" (click)="insertCover.emit(); closeAll.emit()">Insertar en Documento</button>
            </div>
          }

          @if (showSignatureEditor()) {
            <app-signature-editor
              #signatureEditorRef
              [initialConfig]="signatureConfig()"
              (configChanged)="signatureConfigChange.emit($event)"
            ></app-signature-editor>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50" (click)="closeAll.emit()">Cerrar</button>
              <button type="button" class="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700" (click)="insertSignature.emit(); closeAll.emit()">Insertar en Documento</button>
            </div>
          }

          @if (showHeaderFooterEditor()) {
            <app-header-footer-editor
              #headerFooterEditorRef
              [initialConfig]="headerFooterConfig()"
              (configChanged)="headerFooterConfigChange.emit($event)"
            ></app-header-footer-editor>
            <div class="mt-4 flex justify-end">
              <button type="button" class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700" (click)="closeAll.emit()">Aceptar</button>
            </div>
          }

          @if (showTableBuilder()) {
            <app-table-builder #tableBuilderRef></app-table-builder>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50" (click)="closeAll.emit()">Cancelar</button>
              <button type="button" class="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700" (click)="insertTable.emit(); closeAll.emit()">Insertar Tabla</button>
            </div>
          }

          @if (showImageInsert()) {
            <app-image-insert #imageInsertRef></app-image-insert>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50" (click)="closeAll.emit()">Cancelar</button>
              <button type="button" class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700" (click)="insertImage.emit(); closeAll.emit()">Insertar Imagen</button>
            </div>
          }

          @if (showWatermarkEditor()) {
            <app-watermark-dialog
              #watermarkEditorRef
              [initialConfig]="watermarkConfig()"
              (configChanged)="watermarkConfigChange.emit($event)"
            ></app-watermark-dialog>
            <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50" (click)="closeAll.emit()">Cerrar</button>
              <button type="button" class="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-lg hover:bg-cyan-700" (click)="insertWatermark.emit(); closeAll.emit()">Insertar marca de agua</button>
            </div>
          }
        </div>
      </div>
    </div>
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
  readonly signatureConfig = input<Partial<SignatureConfig>>({ enabled: false });
  readonly headerFooterConfig = input<Partial<HeaderFooterConfig>>({ enabled: false });
  readonly watermarkConfig = input<Partial<WatermarkConfig>>({ enabled: false });

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
  @ViewChild('headerFooterEditorRef') headerFooterEditor?: HeaderFooterEditorComponent;
  @ViewChild('tableBuilderRef') tableBuilder?: TableBuilderComponent;
  @ViewChild('imageInsertRef') imageInsert?: ImageInsertComponent;
  @ViewChild('watermarkEditorRef') watermarkEditor?: WatermarkDialogComponent;
}
