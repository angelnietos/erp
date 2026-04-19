import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder shell for future theme tooling; keeps a stable selector in apps. */
@Component({
  selector: 'lib-theme-manager',
  standalone: true,
  imports: [],
  templateUrl: './theme-manager.html',
  styleUrl: './theme-manager.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeManager {}
