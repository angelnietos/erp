import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerField, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-secondary-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secondary-button.html',
  styleUrl: './secondary-button.css',
})
export class SecondaryButtonComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Excel';
  @Input() type: 'excel' | 'pdf' | 'cancel' = 'excel';
  /** Esquinas del botón (misma semántica que `josanz-button`). */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Color del texto y del icono (SVG usa `currentColor`). */
  @Input() customColor?: string;
  @Output() btnClick = new EventEmitter<void>();

  readonly cornerClass = (): string => josanzCornerField(this.shape);

  readonly textColor = (): string =>
    this.customColor ?? this.themeService.currentTheme().atmosphere.text;

  onClick() {
    this.btnClick.emit();
  }
}
