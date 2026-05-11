import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
}
