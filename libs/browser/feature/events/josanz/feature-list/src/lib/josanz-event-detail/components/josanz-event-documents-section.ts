import { Component, Input, inject } from '@angular/core';
import { DocumentItemComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';
import type { EventUploadTarget } from '../josanz-event-detail.types';

@Component({
  selector: 'josanz-event-documents-section',
  standalone: true,
  imports: [DocumentItemComponent],
  template: `
    <section
      class="josanz-event-section"
      [class.josanz-event-section--figma-empty]="files().length === 0"
      [class.josanz-event-section--inspiration]="uploadTarget === 'inspiration'"
    >
      <h3 class="josanz-event-section__title">{{ title }}</h3>

      @for (file of files(); track file.id) {
      <josanz-document-item
        [name]="file.name"
        [showView]="true"
        [showDownload]="true"
        [showDelete]="true"
        (delete)="state.removeFile(uploadTarget, file.id)"
      ></josanz-document-item>
      }

      @if (files().length > 0) {
      <div class="josanz-event-section__add">
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.openUploadModal(uploadTarget)">
          Añadir +
        </button>
      </div>
      } @else {
      <div class="josanz-event-section__empty-action">
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.openUploadModal(uploadTarget)">
          Añadir +
        </button>
      </div>
      }
    </section>
  `,
})
export class JosanzEventDocumentsSectionComponent {
  readonly state = inject(JosanzEventDetailState);

  @Input({ required: true }) title!: string;
  @Input({ required: true }) uploadTarget!: EventUploadTarget;

  files() {
    switch (this.uploadTarget) {
      case 'inspiration':
        return this.state.inspirationFiles();
      case 'delivery':
        return this.state.deliveryNotes();
      case 'invoice':
        return this.state.invoices();
      case 'report':
        return this.state.reportFiles();
    }
  }
}
