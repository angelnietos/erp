import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerInner, type JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-secondary-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secondary-button.html',
  styleUrl: './secondary-button.css',
})
export class SecondaryButtonComponent {
  @Input() label = 'Excel';
  @Input() type: 'excel' | 'pdf' | 'cancel' = 'excel';
  /** Esquinas del botón (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color del texto y del icono (SVG usa `currentColor`). */
  @Input() customColor?: string;
  @Output() btnClick = new EventEmitter<void>();

  readonly cornerClass = (): string => josanzCornerInner(this.shape);

  readonly textColor = (): string => this.customColor ?? '#053746';

  onClick() {
    this.btnClick.emit();
  }
}
