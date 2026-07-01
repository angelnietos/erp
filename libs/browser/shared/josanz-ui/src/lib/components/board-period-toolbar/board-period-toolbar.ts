import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  JOSANZ_BOARD_PERIOD_OPTIONS,
  getBoardPeriodRange,
  isAnchorInCurrentBoardPeriod,
  parseBoardPeriodAnchor,
  type JosanzBoardPeriodKind,
} from '../../list-view/board-period';

@Component({
  selector: 'josanz-board-period-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-period-toolbar.html',
  styleUrl: './board-period-toolbar.css',
})
export class BoardPeriodToolbarComponent {
  @Input({ required: true }) kind!: JosanzBoardPeriodKind;
  /** Ancla estable (`YYYY-MM-DD`) para evitar recrear `Date` en cada ciclo. */
  @Input({ required: true }) anchorIso!: string;
  @Input() visibleCount = 0;
  @Input() hiddenCount = 0;
  @Input() totalCount = 0;

  @Output() kindChange = new EventEmitter<JosanzBoardPeriodKind>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goToCurrent = new EventEmitter<void>();

  readonly options = JOSANZ_BOARD_PERIOD_OPTIONS;

  private get anchorDate(): Date {
    return parseBoardPeriodAnchor(this.anchorIso);
  }

  get periodLabel(): string {
    if (this.kind === 'all') {
      return 'Todos los eventos';
    }
    return getBoardPeriodRange(this.kind, this.anchorDate)?.label ?? '';
  }

  get showNavigation(): boolean {
    return this.kind !== 'all';
  }

  get isCurrentPeriod(): boolean {
    return isAnchorInCurrentBoardPeriod(this.kind, this.anchorDate);
  }

  onKindSelect(kind: JosanzBoardPeriodKind): void {
    if (kind !== this.kind) {
      this.kindChange.emit(kind);
    }
  }
}
