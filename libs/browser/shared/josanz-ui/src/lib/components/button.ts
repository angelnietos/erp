import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  @Input() label = 'Añadir';
  @Input() showIcon = true;
  @Input() disabled = false;
  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
