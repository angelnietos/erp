import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { josanzCornerAvatar, type JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatarComponent {
  /** Nav bar (40px) vs form placeholder (64px, sin hover de clic). */
  @Input() size: 'sm' | 'lg' = 'sm';
  /** `rounded` = suavizado, `pill` = círculo, `square` = casi cuadrado. */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Fondo del avatar; el icono usa `currentColor` derivado del mismo tono. */
  @Input() customColor?: string;

  shellClass(): string {
    const shape = josanzCornerAvatar(this.shape);
    if (this.size === 'lg') {
      return `${shape} flex items-center justify-center transition-all group w-[64px] h-[64px] min-w-[64px] min-h-[64px] flex-shrink-0 border-2 border-[#C8DCF5]`;
    }
    return `${shape} flex items-center justify-center transition-all group w-[40px] h-[40px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(222,237,255,0.8)] active:scale-95`;
  }

  shellStyle(): Record<string, string> {
    return {
      backgroundColor: this.customColor ?? '#DEEDFF',
    };
  }

  iconTone(): string {
    return this.customColor ?? '#5B5FC7';
  }
}
