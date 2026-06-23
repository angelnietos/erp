import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'gcrm-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gcrm-panel.component.html',
  styleUrl: './gcrm-panel.component.css',
})
export class GcrmPanelComponent {
  @Input() title = '';
  @Input() padding: 'none' | 'sm' | 'md' = 'md';
}
