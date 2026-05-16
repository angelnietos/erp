import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService, type JosanzPaginationVariant } from '../services/theme.service';
import type { JosanzListViewSelection } from '../list-view/list-view-preferences';
import {
  isGridCardsView,
  isListCardsView,
  isTableListView,
} from '../list-view/list-view-preferences';
import { FilterTabsComponent } from './filter-tabs';
import { ButtonComponent } from './button';
import { SecondaryButtonComponent } from './secondary-button';
import { UserAvatarComponent } from './user-avatar';
import { PaginationComponent } from './pagination';
import { ListViewSelectorComponent } from './list-view-selector';

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
  @Input() showViewSelector = true;
  @Input() viewSelectorLabel = 'Elección de vista';

  @Input() paginationPage = 1;
  @Input() paginationTotal = 0;
  @Input() paginationVariant?: JosanzPaginationVariant;

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

  get listViewModeClass(): string {
    const id = this.themeService.listViewSelection();
    if (isTableListView(id)) {
      return 'josanz-list-view--table';
    }
    if (isGridCardsView(id)) {
      return 'josanz-list-view--cards-grid';
    }
    return 'josanz-list-view--cards-list';
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
}
