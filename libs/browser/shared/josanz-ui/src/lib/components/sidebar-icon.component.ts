import { Component, Input } from '@angular/core';
import type { JosanzSidebarIconKey } from './sidebar';
import { JOSANZ_SIDEBAR_ICON_DEFS } from './sidebar-icon-definitions';

@Component({
  selector: 'josanz-sidebar-icon',
  standalone: true,
  template: `
    <svg
      class="josanz-sidebar__icon"
      [attr.viewBox]="definition.viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path [attr.d]="definition.d" fill="currentColor" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        color: inherit;
      }

      .josanz-sidebar__icon {
        display: block;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        color: inherit;
      }
    `,
  ],
})
export class JosanzSidebarIconComponent {
  @Input({ required: true }) icon!: JosanzSidebarIconKey;

  get definition() {
    return JOSANZ_SIDEBAR_ICON_DEFS[this.icon];
  }
}
