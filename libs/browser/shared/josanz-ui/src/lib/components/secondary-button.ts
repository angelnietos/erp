import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { josanzCornerInner, type JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-secondary-button',
  standalone: true,
  imports: [],
  templateUrl: './secondary-button.html',
  styleUrl: './secondary-button.css',
})
export class SecondaryButtonComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Excel';
  @Input() type: 'excel' | 'pdf' | 'cancel' = 'excel';
  /** Override del shape; si no se pasa, usa el shape del tema activo. */
  @Input() shape?: JosanzControlShape;
  /** Color del texto y del icono (SVG usa `currentColor`). */
  @Input() customColor?: string;
  @Input() fullWidth = false;
  @Output() btnClick = new EventEmitter<void>();

  readonly cornerClass = (): string =>
    josanzCornerInner(this.shape ?? this.themeService.currentTheme().defaultShape);

  readonly textColor = (): string =>
    this.customColor ?? this.themeService.currentTheme().atmosphere.text;

  onClick() {
    this.btnClick.emit();
  }
}
