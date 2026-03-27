import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'i-lucide',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="i-lucide" [attr.data-icon]="name" aria-hidden="true"></span>`,
  styles: [`
    .i-lucide {
      display: inline-block;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      opacity: 0.8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ILucideComponent {
  @Input() name = '';
}

