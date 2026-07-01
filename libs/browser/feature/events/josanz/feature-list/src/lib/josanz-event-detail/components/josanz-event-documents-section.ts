import { Component, Input, inject } from '@angular/core';
import { DocumentItemComponent, SecondaryButtonComponent } from '@josanz-erp/josanz-ui';
import { JosanzEventDetailState } from '../josanz-event-detail.state';
import type { EventUploadTarget } from '../josanz-event-detail.types';

@Component({
  selector: 'josanz-event-documents-section',
  standalone: true,
  imports: [DocumentItemComponent, SecondaryButtonComponent],
  template: `
    <section class="josanz-event-section">
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

      <div class="josanz-event-section__add" [class.josanz-event-section__add--center]="files().length === 0">
        <josanz-secondary-button label="Añadir +" (btnClick)="state.openUploadModal(uploadTarget)"></josanz-secondary-button>
      </div>
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
