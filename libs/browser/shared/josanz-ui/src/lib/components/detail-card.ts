import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-card.html',
  styleUrl: './detail-card.css',
})
export class DetailCardComponent {
  @Input() imageUrl?: string;
  @Input() title!: string;
  @Input() badgeText?: string;
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() data: string[] = [];
  @Input() tags: string[] = [];
}
