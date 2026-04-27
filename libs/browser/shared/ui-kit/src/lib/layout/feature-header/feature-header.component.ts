import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../../button/button.component';
import { ThemeService } from '@josanz-erp/shared-data-access';

/** Cabecera de módulo: tarjeta con icono o banda tipo “reportes” (migas + glow de marca). */
export type UiFeatureHeaderLayout = 'card' | 'pageHero';

@Component({
  selector: 'ui-feature-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiButtonComponent],
  template: `
    @if (layout === 'pageHero') {
      <header
        class="page-header page-hero-header"
        [style.border-bottom-color]="theme().primary + '33'"
      >
        <div class="header-breadcrumb">
          <h1
            class="page-title text-uppercase glow-text"
            [style.text-shadow]="'0 0 20px ' + theme().primary + '44'"
          >
            {{ title }}
          </h1>
          @if (breadcrumbLead && breadcrumbTail) {
            <div class="breadcrumb">
              <span class="active" [style.color]="theme().primary">{{
                breadcrumbLead
              }}</span>
              <span class="separator">/</span>
              <span>{{ breadcrumbTail }}</span>
            </div>
            @if (subtitle) {
              <p class="hero-subtitle">{{ subtitle }}</p>
            }
          } @else if (subtitle) {
            <div class="breadcrumb breadcrumb-single">
              <span>{{ subtitle }}</span>
            </div>
          }
        </div>
        <div class="header-actions">
          <ng-content select="[actions]"></ng-content>
          @if (actionLabel) {
            <ui-button
              color="app"
              variant="solid"
              size="md"
              [icon]="actionIcon"
              (clicked)="actionClicked.emit()"
              class="primary-action"
            >
              {{ actionLabel }}
            </ui-button>
          }
        </div>
      </header>
    } @else {
      <div class="feature-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-box" [style.background]="iconBackground">
              <lucide-icon [name]="icon" size="32" aria-hidden="true"></lucide-icon>
            </div>
            <div class="text-box">
              <h1 class="main-title">{{ title }}</h1>
              @if (subtitle) {
                <p class="subtitle">{{ subtitle }}</p>
              }
            </div>
          </div>
          <div class="actions-section">
            <ng-content select="[actions]"></ng-content>
            @if (actionLabel) {
              <ui-button
                color="app"
                variant="solid"
                size="md"
                [icon]="actionIcon"
                (clicked)="actionClicked.emit()"
                class="primary-action"
              >
                {{ actionLabel }}
              </ui-button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* —— pageHero: alineado con reportes / dashboard —— */
    .page-hero-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-hero-header .header-breadcrumb {
      flex: 1;
      min-width: min(100%, 280px);
    }

    .page-hero-header .page-title {
      margin: 0 0 0.25rem 0;
      font-size: clamp(1.25rem, 1.5vw, 1.5rem);
      font-weight: 800;
      letter-spacing: 0.02em;
      font-family: var(--font-display, var(--font-main));
    }

    .page-hero-header .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-top: 0.25rem;
      text-transform: uppercase;
    }

    .page-hero-header .breadcrumb-single span {
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .page-hero-header .hero-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      letter-spacing: 0.01em;
      line-height: 1.4;
      max-width: 52rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .page-hero-header .hero-subtitle {
      font-size: 0.8125rem;
    }

    .page-hero-header .separator {
      opacity: 0.5;
    }

    .page-hero-header .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* CTA principal: mismo criterio que el resto de acciones tipo “NUEVO …” del ERP */
    .page-hero-header ::ng-deep ui-button.primary-action .btn {
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
    }

    :host-context(html[data-erp-tenant='babooni']) .page-hero-header .page-title {
      font-size: clamp(1.5rem, 1.2vw + 1rem, 2rem);
      font-weight: 700;
      text-transform: none;
      letter-spacing: -0.02em;
      text-shadow: none !important;
      -webkit-text-fill-color: var(--text-primary);
      color: var(--text-primary);
      margin-bottom: 0.15rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .page-hero-header .breadcrumb {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      gap: 6px;
    }

    :host-context(html[data-erp-tenant='babooni']) .page-hero-header .breadcrumb-single span {
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: none;
    }

    .feature-header {
      margin-bottom: 1rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border-soft);
      box-shadow:
        0 4px 16px -8px rgba(0, 0, 0, 0.4),
        0 0 0 1px color-mix(in srgb, var(--brand) 10%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(12px) saturate(1.1);
      -webkit-backdrop-filter: blur(12px) saturate(1.1);
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
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--brand) 55%, transparent),
        transparent
      );
      opacity: 0.55;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow:
        0 6px 20px -8px var(--brand-glow),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border: 1px solid color-mix(in srgb, #fff 18%, transparent);
      flex-shrink: 0;
      transition:
        transform 0.3s var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
        box-shadow 0.3s ease;
    }

    .header-content:hover .icon-box {
      transform: translateY(-1px);
      box-shadow:
        0 10px 24px -8px var(--brand-glow),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }

    .main-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-primary);
      background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.01em;
    }

    .subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0.15rem 0 0 0;
      font-weight: 500;
      line-height: 1.4;
      max-width: 48rem;
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
      color: var(--text-primary);
      background: none;
      -webkit-text-fill-color: var(--text-primary);
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

    /**
     * Babooni: el CTA “NUEVO …” usa el color de marca (--brand vía .btn-color-app),
     * sin forzar negro; solo tipografía y radio acordes al tema.
     */
    :host-context(html[data-erp-tenant='babooni']) ::ng-deep ui-button.primary-action .btn {
      text-transform: none;
      letter-spacing: 0.03em;
      font-weight: 600;
      border-radius: var(--btn-radius, var(--radius-md, 8px));
    }

    :host-context(html[data-erp-tenant='babooni']) ::ng-deep ui-button.primary-action .btn:hover {
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

    @media (prefers-reduced-motion: reduce) {
      .header-content:hover .icon-box {
        transform: none;
      }
      .primary-action,
      .primary-action:hover {
        transform: none !important;
      }
    }
  `]
})
export class UiFeatureHeaderComponent {
  private readonly themeService = inject(ThemeService);

  /** `pageHero`: banda con título en mayúsculas + migas (estilo reportes). `card`: tarjeta con icono. */
  @Input() layout: UiFeatureHeaderLayout = 'pageHero';

  /** Primera parte de la miga (color marca). Requiere `breadcrumbTail`. */
  @Input() breadcrumbLead = '';

  /** Segunda parte de la miga (texto secundario). */
  @Input() breadcrumbTail = '';

  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = 'layout';
  @Input() iconBackground = 'linear-gradient(135deg, var(--brand), var(--brand-secondary))';
  @Input() actionLabel = '';
  @Input() actionIcon = 'CirclePlus';

  @Output() actionClicked = new EventEmitter<void>();

  /** Datos del tema actual (color primario para bordes y glow). */
  protected readonly theme = this.themeService.currentThemeData;
}
