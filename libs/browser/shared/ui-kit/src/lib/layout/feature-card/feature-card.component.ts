import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../../button/button.component';
import { UiBadgeComponent } from '../../badge/badge.component';

@Component({
  selector: 'ui-feature-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent, UiBadgeComponent],
  template: `
    <div class="feature-card" (click)="cardClicked.emit()">
      <div class="card-header">
        <div class="header-main">
          <div class="item-avatar" *ngIf="avatarInitials">
            <div class="avatar-bg" [style.background]="avatarBackground">
              {{ avatarInitials }}
            </div>
            <div class="avatar-status" *ngIf="status" [class]="status"></div>
          </div>
          <div class="header-info">
             <div class="title-row">
                <h3 class="item-name">{{ name }}</h3>
                <lucide-icon *ngIf="isFavorite" name="star" size="14" class="favorite-icon"></lucide-icon>
             </div>
             <div class="badges-row" *ngIf="badgeLabel || subtitle">
                <ui-badge *ngIf="badgeLabel" [variant]="badgeVariant" size="sm">{{ badgeLabel }}</ui-badge>
                <span class="subtitle" *ngIf="subtitle">{{ subtitle }}</span>
             </div>
          </div>
        </div>
        <div class="card-actions">
           <ui-button
              variant="ghost"
              size="sm"
              icon="Pencil"
              (click)="$event.stopPropagation(); editClicked.emit()"
              class="edit-btn"
            >
            </ui-button>
        </div>
      </div>

      <div class="card-body">
         <ng-content></ng-content>
      </div>

      <div class="card-footer" *ngIf="footerItems && footerItems.length > 0">
         <div class="footer-item" *ngFor="let item of footerItems">
            <lucide-icon [name]="item.icon" size="14"></lucide-icon>
            <span>{{ item.label }}</span>
         </div>
         <div class="footer-extra">
            <ng-content select="[footer-extra]"></ng-content>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-card {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .feature-card:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.2);
      border-color: var(--brand);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
    }

    .header-main {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex: 1;
    }

    .item-avatar {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-bg {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.3);
    }

    .avatar-status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--text-muted);
      border: 3px solid var(--surface);
    }

    .avatar-status.active { background: var(--success); box-shadow: 0 0 10px var(--success); }
    .avatar-status.warning { background: var(--warning); }
    .avatar-status.danger { background: var(--danger); }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .item-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .favorite-icon {
      color: #fbbf24;
      fill: #fbbf24;
      flex-shrink: 0;
    }

    .badges-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .card-actions {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .feature-card:hover .card-actions {
      opacity: 1;
    }

    .card-body {
      padding: 0 1.5rem 1rem 1.5rem;
      flex: 1;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-soft);
      background: var(--surface-secondary);
      opacity: 0.8;
    }

    .footer-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .footer-extra {
       display: flex;
       align-items: center;
       gap: 0.5rem;
    }

    @media (max-width: 480px) {
       .avatar-bg {
          width: 48px;
          height: 48px;
          font-size: 1rem;
       }
    }
  `]
})
export class UiFeatureCardComponent {
  @Input() name = '';
  @Input() subtitle = '';
  @Input() avatarInitials = '';
  @Input() avatarBackground = 'linear-gradient(135deg, var(--brand), var(--brand-secondary))';
  @Input() status?: 'active' | 'warning' | 'danger' | 'offline';
  @Input() badgeLabel = '';
  @Input() badgeVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' = 'secondary';
  @Input() isFavorite = false;
  @Input() footerItems: { icon: string, label: string }[] = [];

  @Output() cardClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<void>();
}
