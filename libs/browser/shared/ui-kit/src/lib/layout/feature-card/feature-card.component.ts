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
    <div
      class="feature-card"
      role="button"
      tabindex="0"
      [attr.aria-label]="name ? 'Abrir: ' + name : 'Abrir tarjeta'"
      (click)="cardClicked.emit()"
      (keydown.enter)="cardClicked.emit()"
      (keydown.space)="$event.preventDefault(); cardClicked.emit()"
    >
      <div class="card-header">
        <div class="header-main">
          @if (avatarInitials) {
          <div class="item-avatar">
            <div class="avatar-bg" [style.background]="avatarBackground">
              {{ avatarInitials }}
            </div>
            @if (status) {
            <div class="avatar-status" [class]="status"></div>
            }
          </div>
          }
          <div class="header-info">
             <div class="title-row">
                <h3 class="item-name">{{ name }}</h3>
                @if (isFavorite) {
                <lucide-icon name="star" size="14" class="favorite-icon" aria-hidden="true"></lucide-icon>
                }
             </div>
             @if (badgeLabel || subtitle) {
             <div class="badges-row">
                @if (badgeLabel) {
                <ui-badge [variant]="badgeVariant" size="sm">{{ badgeLabel }}</ui-badge>
                }
                @if (subtitle) {
                <span class="subtitle">{{ subtitle }}</span>
                }
             </div>
             }
          </div>
        </div>
      </div>

      <div class="card-body">
         <ng-content></ng-content>
      </div>

      @if ((footerItems && footerItems.length > 0) || showEdit || showDelete || showDuplicate) {
      <div class="card-footer">
         <div class="footer-main">
            @for (item of footerItems; track $index) {
            <div class="footer-item">
               <lucide-icon [name]="item.icon" size="14" aria-hidden="true"></lucide-icon>
               <span>{{ item.label }}</span>
            </div>
            }
            <div class="footer-extra">
               <ng-content select="[footer-extra]"></ng-content>
            </div>
         </div>

         <div class="footer-actions">
            @if (showDuplicate) {
            <ui-button
              class="action-btn action-btn--duplicate"
              variant="ghost"
              size="sm"
              icon="Copy"
              (click)="$event.stopPropagation(); duplicateClicked.emit()"
              [title]="name ? 'Duplicar ' + name : 'Duplicar'"
              [aria-label]="name ? 'Duplicar ' + name : 'Duplicar elemento'"
            ></ui-button>
            }
            @if (showEdit) {
            <ui-button
              class="action-btn action-btn--edit edit-btn"
              variant="ghost"
              size="sm"
              icon="Pencil"
              (click)="$event.stopPropagation(); editClicked.emit()"
              [title]="name ? 'Editar ' + name : 'Editar'"
              [aria-label]="name ? 'Editar ' + name : 'Editar elemento'"
            ></ui-button>
            }
            @if (showDelete) {
            <ui-button
              class="action-btn action-btn--delete delete-btn"
              variant="ghost"
              size="sm"
              icon="Trash2"
              (click)="$event.stopPropagation(); deleteClicked.emit()"
              [title]="name ? 'Eliminar ' + name : 'Eliminar'"
              [aria-label]="name ? 'Eliminar ' + name : 'Eliminar elemento'"
            ></ui-button>
            }
         </div>
      </div>
      }
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

    .feature-card:focus-visible {
      outline: none;
      border-color: color-mix(in srgb, var(--brand) 55%, var(--border-soft));
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--brand) 35%, transparent),
        0 12px 32px -8px rgba(0, 0, 0, 0.22);
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
      min-height: 64px;
    }

    .footer-main {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .footer-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.02em;
    }

    .footer-actions {
      display: flex;
      gap: 0.25rem;
      margin-left: 1rem;
      transition: all 0.2s ease;
    }

    /* Iconos alineados con tokens de tema (no gris fijo) */
    .footer-actions ::ng-deep .action-btn .btn.btn-shape-ghost {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      padding: 0;
      border-radius: 8px;
      color: color-mix(in srgb, var(--brand) 78%, var(--text-primary) 22%) !important;
      background: color-mix(in srgb, var(--brand) 7%, var(--surface-secondary) 93%) !important;
      border: 1px solid color-mix(in srgb, var(--brand) 16%, var(--border-soft) 84%) !important;
    }

    .footer-actions ::ng-deep .action-btn--delete .btn.btn-shape-ghost {
      color: color-mix(in srgb, var(--danger) 78%, var(--text-primary) 22%) !important;
      background: color-mix(in srgb, var(--danger) 7%, var(--surface-secondary) 93%) !important;
      border-color: color-mix(in srgb, var(--danger) 18%, var(--border-soft) 82%) !important;
    }

    .footer-actions ::ng-deep .action-btn--duplicate .btn.btn-shape-ghost:hover,
    .footer-actions ::ng-deep .action-btn--edit .btn.btn-shape-ghost:hover {
      color: var(--brand) !important;
      background: color-mix(in srgb, var(--brand) 12%, transparent) !important;
      border-color: color-mix(in srgb, var(--brand) 28%, var(--border-soft) 72%) !important;
    }

    .footer-actions ::ng-deep .action-btn--delete .btn.btn-shape-ghost:hover {
      color: var(--danger) !important;
      background: color-mix(in srgb, var(--danger) 12%, transparent) !important;
      border-color: color-mix(in srgb, var(--danger) 30%, var(--border-soft) 70%) !important;
    }

    @media (max-width: 480px) {
       .card-footer { flex-direction: column; gap: 1rem; align-items: flex-start; }
       .footer-actions { margin-left: 0; width: 100%; justify-content: flex-end; }
    }

    /* Babooni: tarjetas tipo Figma Biosstel (borde flotante, sombra sutil suave, redondeo premium) */
    :host-context(html[data-erp-tenant='babooni']) .feature-card {
      border-radius: 20px;
      border: 1px solid color-mix(in srgb, var(--border-soft) 40%, transparent);
      box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    :host-context(html[data-erp-tenant='babooni']) .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px color-mix(in srgb, var(--brand) 15%, transparent);
      border-color: color-mix(in srgb, var(--brand) 25%, transparent);
      background: rgba(255, 255, 255, 0.95);
    }

    :host-context(html[data-erp-tenant='babooni']) .avatar-bg {
      border-radius: 12px;
      width: 48px;
      height: 48px;
      font-size: 1.1rem;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    :host-context(html[data-erp-tenant='babooni']) .item-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0c0c0c;
      letter-spacing: -0.01em;
    }

    :host-context(html[data-erp-tenant='babooni']) .subtitle {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-muted);
      opacity: 0.85;
    }

    :host-context(html[data-erp-tenant='babooni']) .card-header {
      padding: 1.25rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .card-body {
      padding: 0 1.25rem 1rem 1.25rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .card-footer {
      padding: 0.85rem 1.25rem;
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid color-mix(in srgb, var(--border-soft) 30%, transparent);
      min-height: auto;
    }

    :host-context(html[data-erp-tenant='babooni']) .footer-item {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      .feature-card,
      .feature-card:hover {
        transform: none;
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
  
  // Action toggles
  @Input() showEdit = true;
  @Input() showDelete = false;
  @Input() showDuplicate = false;

  @Output() cardClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();
  @Output() duplicateClicked = new EventEmitter<void>();
}
