import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  buildTabSlugMap,
  navigateDetailTab,
  readDetailTabFromRoute,
} from '../../detail/detail-tab-route';
import { MainDetailLayoutComponent } from '../main-detail-layout';
import {
  resolveFigmaDetailShellFeatures,
  type JosanzFigmaDetailShellConfig,
} from './josanz-figma-detail-shell-config';

/**
 * Shell de detalle Figma: tabs con `?tab=`, volver al listado y proyección de contenido.
 *
 * Uso:
 * ```html
 * <josanz-figma-detail-shell #shell [config]="shellConfig" (save)="onSave()">
 *   @if (shell.activeTab() === 'Resumen') { ... }
 * </josanz-figma-detail-shell>
 * ```
 */
@Component({
  selector: 'josanz-figma-detail-shell',
  standalone: true,
  imports: [MainDetailLayoutComponent],
  exportAs: 'figmaDetailShell',
  template: `
    <josanz-main-detail-layout
      [title]="config.title"
      [tabs]="config.tabs"
      [activeTab]="activeTab()"
      [layoutVariant]="config.layoutVariant ?? 'figma-event'"
      [statusLabel]="resolvedFeatures.statusPill ? (config.statusLabel ?? '') : ''"
      [statusPillKey]="config.statusPillKey ?? 'confirmado'"
      [userLabel]="config.userLabel ?? 'Usuari@'"
      [saveLabel]="config.saveLabel ?? 'Guardar cambios'"
      [cancelLabel]="config.cancelLabel ?? 'Cancelar'"
      [saveDisabled]="config.saveDisabled ?? true"
      [showFooterActions]="resolvedFeatures.footerActions"
      [showHeaderSave]="resolvedFeatures.headerSave"
      [avatarLink]="resolvedFeatures.avatar ? (config.avatarLink ?? '/settings') : null"
      [avatarAriaLabel]="config.avatarAriaLabel ?? 'Cuenta y ajustes'"
      (back)="onBack()"
      (tabChange)="setTab($event)"
      (save)="save.emit()"
      (cancel)="cancel.emit()"
    >
      <div class="josanz-event-detail-body">
        <ng-content></ng-content>
      </div>
    </josanz-main-detail-layout>
  `,
})
export class JosanzFigmaDetailShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input({ required: true }) config!: JosanzFigmaDetailShellConfig;

  @Output() readonly save = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();
  @Output() readonly tabChanged = new EventEmitter<string>();

  /** Pestaña activa — usable desde plantilla con `#shell="figmaDetailShell"`. */
  readonly activeTab = signal('');

  private tabSlugMap: Record<string, string> = {};

  get resolvedFeatures() {
    return resolveFigmaDetailShellFeatures(this.config);
  }

  ngOnInit(): void {
    this.tabSlugMap = this.config.tabSlugMap ?? buildTabSlugMap(this.config.tabs);
    const defaultTab = this.config.tabs[0] ?? '';
    this.activeTab.set(defaultTab);
    readDetailTabFromRoute(
      this.route,
      this.tabSlugMap,
      this.config.tabs,
      this.activeTab,
    );
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
    this.tabChanged.emit(tab);
  }

  onBack(): void {
    void this.router.navigate([this.config.listRoute]);
  }
}
