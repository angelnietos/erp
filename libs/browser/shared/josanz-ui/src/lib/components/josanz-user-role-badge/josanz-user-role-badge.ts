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
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.1 5h5.6l-4.5 4.4 1.7 5.5-4.5-3.3-4.5 3.3 1.7-5.5L.8 7h5.6L12 2z" />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.8 3.2V7c0 3.3-2.7 6.7-6 8l-.5.2V12" />
              <path d="M12 2l-2.8 3.2V7c0 3.3 2.7 6.7 6 8l.5.2V12" />
              <path d="M8 13.5l2 2 4-4" />
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
