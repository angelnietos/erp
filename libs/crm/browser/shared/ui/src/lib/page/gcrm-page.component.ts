import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'gcrm-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gcrm-page.component.html',
  styleUrl: './gcrm-page.component.css',
})
export class GcrmPageComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
