import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type GcrmBadgeVariant =
  | 'neutral'
  | 'warning'
  | 'info'
  | 'success'
  | 'danger';

@Component({
  selector: 'gcrm-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gcrm-badge.component.html',
  styleUrl: './gcrm-badge.component.css',
})
export class GcrmBadgeComponent {
  @Input() variant: GcrmBadgeVariant = 'neutral';
}
