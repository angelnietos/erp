import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import type { CoverConfig } from './cover-editor.component';
import type { SignatureConfig } from './signature-editor.component';
import type { HeaderFooterConfig } from './header-footer-editor.component';
import type { WatermarkConfig } from './watermark-dialog.component';
import type { CoverEditorComponent } from './cover-editor.component';
import type { SignatureEditorComponent } from './signature-editor.component';
import type { HeaderFooterEditorComponent } from './header-footer-editor.component';
import type { TableBuilderComponent } from './table-builder.component';
import type { ImageInsertComponent } from './image-insert.component';
import type { WatermarkDialogComponent } from './watermark-dialog.component';
import type { DocumentToolsModalComponent } from './document-tools-modal.component';

@Component({
  selector: 'app-document-tools-modal-host',
  standalone: true,
  template: `<ng-container #host />`,
})
export class DocumentToolsModalHostComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly hostVcr = viewChild('host', { read: ViewContainerRef });

  private modalRef: ComponentRef<DocumentToolsModalComponent> | null = null;
  private modulePromise: Promise<
    typeof import('./document-tools-modal.component')
  > | null = null;

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
  readonly headerFooterConfig = input<Partial<HeaderFooterConfig>>({
    enabled: false,
  });
  readonly watermarkConfig = input<Partial<WatermarkConfig>>({ enabled: false });

  readonly closeAll = output<void>();
  readonly coverConfigChange = output<CoverConfig>();
  readonly signatureConfigChange = output<SignatureConfig>();
  readonly headerFooterConfigChange = output<HeaderFooterConfig>();
  readonly watermarkConfigChange = output<WatermarkConfig>();
  readonly insertCover = output<void>();
  readonly insertSignature = output<void>();
  readonly insertTable = output<void>();
  readonly insertImage = output<void>();
  readonly insertWatermark = output<void>();

  get coverEditor(): CoverEditorComponent | undefined {
    return this.modalRef?.instance.coverEditor;
  }

  get signatureEditor(): SignatureEditorComponent | undefined {
    return this.modalRef?.instance.signatureEditor;
  }

  get headerFooterEditor(): HeaderFooterEditorComponent | undefined {
    return this.modalRef?.instance.headerFooterEditor;
  }

  get tableBuilder(): TableBuilderComponent | undefined {
    return this.modalRef?.instance.tableBuilder;
  }

  get imageInsert(): ImageInsertComponent | undefined {
    return this.modalRef?.instance.imageInsert;
  }

  get watermarkEditor(): WatermarkDialogComponent | undefined {
    return this.modalRef?.instance.watermarkEditor;
  }

  constructor() {
    effect(() => {
      if (!this.active()) {
        return;
      }
      void this.ensureMounted();
    });

    effect(() => {
      if (!this.modalRef) {
        return;
      }
      this.active();
      this.modalTitle();
      this.modalSubtitle();
      this.showCoverEditor();
      this.showSignatureEditor();
      this.showHeaderFooterEditor();
      this.showTableBuilder();
      this.showImageInsert();
      this.showWatermarkEditor();
      this.coverConfig();
      this.signatureConfig();
      this.headerFooterConfig();
      this.watermarkConfig();
      this.syncInputs();
    });

    this.destroyRef.onDestroy(() => {
      this.modalRef?.destroy();
      this.modalRef = null;
    });
  }

  private async ensureMounted(): Promise<void> {
    if (this.modalRef) {
      this.syncInputs();
      return;
    }

    this.modulePromise ??= import('./document-tools-modal.component');
    const mod = await this.modulePromise;
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    const host = this.hostVcr();
    if (!host || this.modalRef) {
      return;
    }

    this.modalRef = host.createComponent(mod.DocumentToolsModalComponent);
    this.wireOutputs();
    this.syncInputs();
    this.cdr.markForCheck();
  }

  private wireOutputs(): void {
    const instance = this.modalRef?.instance;
    if (!instance) {
      return;
    }

    instance.closeAll.subscribe(() => this.closeAll.emit());
    instance.coverConfigChange.subscribe((value) =>
      this.coverConfigChange.emit(value),
    );
    instance.signatureConfigChange.subscribe((value) =>
      this.signatureConfigChange.emit(value),
    );
    instance.headerFooterConfigChange.subscribe((value) =>
      this.headerFooterConfigChange.emit(value),
    );
    instance.watermarkConfigChange.subscribe((value) =>
      this.watermarkConfigChange.emit(value),
    );
    instance.insertCover.subscribe(() => this.insertCover.emit());
    instance.insertSignature.subscribe(() => this.insertSignature.emit());
    instance.insertTable.subscribe(() => this.insertTable.emit());
    instance.insertImage.subscribe(() => this.insertImage.emit());
    instance.insertWatermark.subscribe(() => this.insertWatermark.emit());
  }

  private syncInputs(): void {
    const ref = this.modalRef;
    if (!ref) {
      return;
    }

    ref.setInput('active', this.active());
    ref.setInput('modalTitle', this.modalTitle());
    ref.setInput('modalSubtitle', this.modalSubtitle());
    ref.setInput('showCoverEditor', this.showCoverEditor());
    ref.setInput('showSignatureEditor', this.showSignatureEditor());
    ref.setInput('showHeaderFooterEditor', this.showHeaderFooterEditor());
    ref.setInput('showTableBuilder', this.showTableBuilder());
    ref.setInput('showImageInsert', this.showImageInsert());
    ref.setInput('showWatermarkEditor', this.showWatermarkEditor());
    ref.setInput('coverConfig', this.coverConfig());
    ref.setInput('signatureConfig', this.signatureConfig());
    ref.setInput('headerFooterConfig', this.headerFooterConfig());
    ref.setInput('watermarkConfig', this.watermarkConfig());
    ref.changeDetectorRef.markForCheck();
  }
}
