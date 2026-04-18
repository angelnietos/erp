import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../../button/button.component';

@Component({
  selector: 'ui-feature-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent],
  template: `
    <div class="feature-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-box" [style.background]="iconBackground">
            <lucide-icon [name]="icon" size="32"></lucide-icon>
          </div>
          <div class="text-box">
            <h1 class="main-title">{{ title }}</h1>
            @if (subtitle) {
              <p class="subtitle">{{ subtitle }}</p>
            }
          </div>
        </div>
        <div class="actions-section">
          <ng-content select="[actions]">
            @if (actionLabel) {
            <ui-button
              variant="solid"
              size="md"
              [icon]="actionIcon"
              (clicked)="actionClicked.emit()"
              class="primary-action"
            >
              {{ actionLabel }}
            </ui-button>
            }
          </ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border-soft);
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    /* Glass effect */
    .header-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-hover), transparent);
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-box {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px -8px var(--brand-glow);
      flex-shrink: 0;
    }

    .main-title {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
      font-weight: 500;
    }

    .primary-action {
      display: block;
      transition: all 0.4s var(--ease-out-expo) !important;
    }
    
    .primary-action:hover {
      transform: translateY(-3px) scale(1.02) !important;
    }

    /* Babooni: cabecera tipo Biosstel (título marca, CTA oscuro, menos “hero” gaming) */
    :host-context(html[data-erp-tenant='babooni']) .feature-header {
      margin-bottom: 1.25rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .header-content {
      padding: 1.15rem 1.35rem;
      border-radius: 14px;
    }

    :host-context(html[data-erp-tenant='babooni']) .main-title {
      font-size: clamp(1.25rem, 1.2vw + 0.85rem, 1.625rem);
      font-weight: 700;
      color: var(--brand, #004b93);
      background: none;
      -webkit-text-fill-color: var(--brand, #004b93);
      background-clip: unset;
    }

    :host-context(html[data-erp-tenant='babooni']) .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    :host-context(html[data-erp-tenant='babooni']) .icon-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
    }

    :host-context(html[data-erp-tenant='babooni']) ::ng-deep ui-button.primary-action .btn {
      background: color-mix(in srgb, var(--text-primary, #080808) 92%, var(--theme-surface) 8%);
      border-color: color-mix(in srgb, var(--text-primary, #080808) 88%, var(--border-soft) 12%);
      color: var(--theme-surface, #fffefe);
      text-transform: none;
      letter-spacing: 0.03em;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 4px 7px 0 rgba(221, 221, 221, 0.45);
    }

    :host-context(html[data-erp-tenant='babooni']) ::ng-deep ui-button.primary-action .btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.06);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
        padding: 1.5rem;
      }
      
      .main-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class UiFeatureHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = 'layout';
  @Input() iconBackground = 'linear-gradient(135deg, var(--brand), var(--brand-secondary))';
  @Input() actionLabel = '';
  @Input() actionIcon = 'CirclePlus';
  
  @Output() actionClicked = new EventEmitter<void>();
}
