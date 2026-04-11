import { Component } from '@angular/core';
import { UIAIChatComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'app-documents-bot',
  standalone: true,
  imports: [UIAIChatComponent],
  template: ` <ui-ai-assistant feature="documents"></ui-ai-assistant> `,
})
export class DocumentsBotComponent {}
