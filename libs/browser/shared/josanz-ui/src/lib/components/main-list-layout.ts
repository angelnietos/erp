import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService, type JosanzPaginationVariant } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzListViewSelection } from '../list-view/list-view-preferences';
import { listViewStackClasses } from '../list-view/list-view-preferences';
import { FilterTabsComponent, type JosanzFilterTabsVariant } from './filter-tabs';
import { ButtonComponent } from './button';
import { SecondaryButtonComponent } from './secondary-button';
import { UserAvatarComponent } from './user-avatar';
import { PaginationComponent } from './pagination';
import { ListViewSelectorComponent } from './list-view-selector';
import { ListSearchFieldComponent } from './list-search-field';

/** Línea resumen bajo tabs (Figma Eventos: «180 eventos - 8 activos esta semana»). */
export interface JosanzFigmaSummaryLine {
  before: string;
  emphasis: string;
  after: string;
}

@Component({
  selector: 'josanz-main-list-layout',
  standalone: true,
  imports: [
    CommonModule,
    FilterTabsComponent,
    ButtonComponent,
    SecondaryButtonComponent,
    UserAvatarComponent,
    PaginationComponent,
    ListViewSelectorComponent,
    ListSearchFieldComponent,
  ],
  templateUrl: './main-list-layout.html',
  styleUrl: './main-list-layout.css',
})
export class MainListLayoutComponent implements OnChanges {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = 'Título';
  @Input() primaryBtnLabel = 'Acción';
  @Input() secondaryBtnLabel = '';
  @Input() filterOptions: string[] = ['Todas', 'Tipo X', 'Tipo Y', 'Tipo Z'];
  /** Layout Eventos / catálogo Figma: tabs subrayados, buscar en toolbar, filas flotantes. */
  @Input() figmaCatalogLayout = false;
  @Input() typologyTabsVariant?: JosanzFilterTabsVariant;
  /** Pill resumen junto a tabs tipología (solo `figmaCatalogLayout`). */
  @Input() summaryLine?: JosanzFigmaSummaryLine | string;
  /** Por defecto oculto en catálogo Figma (no está en diseño). */
  @Input() showViewSelector?: boolean;
  @Input() viewSelectorLabel = 'Elección de vista';
  @Input() showSearch = true;
  /** `toolbar`: misma fila que filtros extra (catálogo). `actions`: bajo botones, alineado a la derecha (clientes, etc.). */
  @Input() searchPlacement: 'toolbar' | 'actions' = 'toolbar';
  @Input() searchPlaceholder = 'Buscar…';
  @Input() searchValue = '';
  @Input() searchAriaLabel = 'Buscar en el listado';

  @Output() searchChange = new EventEmitter<string>();

  @Input() paginationPage = 1;
  @Input() paginationTotal = 0;
  @Input() paginationVariant?: JosanzPaginationVariant;
  /** Override visual que se propaga a botones, filtros, busqueda y paginacion. */
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<JosanzListViewSelection>();
  @Output() excelAction = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() paginationChange = new EventEmitter<number>();

  @Input() avatarLink: string | null = '/settings';
  @Input() avatarAriaLabel = 'Cuenta y ajustes';

  private _paginationPage = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paginationPage'] || changes['paginationTotal']) {
      const t = this.paginationTotal;
      const p = this.paginationPage;
      if (t > 0) {
        this._paginationPage = Math.min(t, Math.max(1, p));
      } else {
        this._paginationPage = 1;
      }
    }
  }

  onPaginationPage(page: number): void {
    this._paginationPage = page;
    this.paginationChange.emit(page);
  }

  get effectivePaginationPage(): number {
    return this._paginationPage;
  }

  get effectivePaginationVariant(): JosanzPaginationVariant {
    return this.paginationVariant ?? this.themeService.paginationVariant();
  }

  get summaryLineParts(): JosanzFigmaSummaryLine | null {
    const line = this.summaryLine;
    if (!line || typeof line === 'string') {
      return null;
    }
    return line;
  }

  get effectiveShowViewSelector(): boolean {
    return this.showViewSelector ?? !this.figmaCatalogLayout;
  }

  get effectiveTypologyTabsVariant(): JosanzFilterTabsVariant {
    return this.typologyTabsVariant ?? (this.figmaCatalogLayout ? 'segmented' : 'figma');
  }

  get listViewModeClass(): string[] {
    return listViewStackClasses(this.themeService.listViewSelection());
  }

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  onViewChange(option: JosanzListViewSelection): void {
    this.themeService.setListViewSelection(option);
    this.viewChange.emit(option);
  }

  onExcelAction(): void {
    this.excelAction.emit();
  }

  onFilterChange(option: string): void {
    this.filterChange.emit(option);
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }
}
