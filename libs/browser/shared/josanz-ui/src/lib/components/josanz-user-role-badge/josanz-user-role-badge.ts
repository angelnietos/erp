import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  josanzUserRoleBadgeLabel,
  resolveJosanzUserRoleBadge,
  type JosanzUserRoleBadge,
} from '../../utils/resolve-josanz-user-role-badge';

@Component({
  selector: 'josanz-user-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (badge; as kind) {
      <span
        class="josanz-user-role-badge"
        [class.josanz-user-role-badge--superadmin]="kind === 'superadmin'"
        [class.josanz-user-role-badge--admin]="kind === 'admin'"
        [attr.title]="badgeLabel(kind)"
      >
        <span class="josanz-user-role-badge__icon" aria-hidden="true">
          @if (kind === 'superadmin') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.2l5-.7L12 3z" />
              <path d="M8 18h8" />
              <path d="M9.5 21h5" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l7 3v6c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9V6l7-3z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
        </span>
        <span class="josanz-user-role-badge__label">{{ badgeLabel(kind) }}</span>
      </span>
    }
  `,
  styleUrl: './josanz-user-role-badge.css',
})
export class JosanzUserRoleBadgeComponent {
  @Input() roles: readonly string[] | null = null;

  get badge(): JosanzUserRoleBadge | null {
    return resolveJosanzUserRoleBadge(this.roles);
  }

  badgeLabel(kind: JosanzUserRoleBadge): string {
    return josanzUserRoleBadgeLabel(kind);
  }
}
