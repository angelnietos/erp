import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type GcrmInlineMessageVariant = 'success' | 'error' | 'info';

@Component({
  selector: 'gcrm-inline-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gcrm-inline-message.component.html',
  styleUrl: './gcrm-inline-message.component.css',
})
export class GcrmInlineMessageComponent {
  @Input() variant: GcrmInlineMessageVariant = 'info';

  ariaRole(): 'alert' | 'status' {
    return this.variant === 'error' ? 'alert' : 'status';
  }
}
