import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDragMove,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import type { JosanzStatusBadgeStyle } from '../main-template-card';
import {
  eventOutlineIconRingStyles,
  getEventOutlinePill,
} from '../../theme/event-status-outline';
import { pillOutlineBadgeStyles } from '../../catalog/status-pill-presets';
import type { JosanzStatusPillKey } from '../../theme/josanz-figma-tokens';

export interface JosanzStatusKanbanColumn {
  value: string;
  label: string;
  color?: string;
}

export interface JosanzStatusKanbanItem {
  id: string;
  statusValue: string;
  title: string;
  subtitle?: string;
  meta?: string;
  pillLabel: string;
  pillColor?: string;
  railColor?: string;
}

export interface JosanzStatusKanbanChange {
  id: string;
  status: string;
  previousStatus: string;
}

const AUTO_SCROLL_EDGE_PX = 88;
const AUTO_SCROLL_MAX_SPEED = 16;

@Component({
  selector: 'josanz-status-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, CdkScrollable],
  templateUrl: './status-kanban-board.html',
  styleUrl: './status-kanban-board.css',
})
export class StatusKanbanBoardComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('track', { read: ElementRef })
  private trackRef?: ElementRef<HTMLElement>;

  @Input() columns: JosanzStatusKanbanColumn[] = [];
  @Input() items: JosanzStatusKanbanItem[] = [];
  @Input() statusBadgeStyle: JosanzStatusBadgeStyle = 'outline';
  @Input() busyIds: readonly string[] = [];

  @Output() itemClick = new EventEmitter<JosanzStatusKanbanItem>();
  @Output() statusChange = new EventEmitter<JosanzStatusKanbanChange>();

  /** Arrays mutables por columna (requerido por CDK). */
  buckets: Record<string, JosanzStatusKanbanItem[]> = {};

  columnIds: string[] = [];

  readonly isDragging = signal(false);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);
  readonly scrollEdgeLeft = signal(false);
  readonly scrollEdgeRight = signal(false);

  private scrollVelocity = 0;
  private autoScrollFrame = 0;
  private trackScrollListener?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['items']) {
      this.rebuildBuckets();
      queueMicrotask(() => this.syncScrollState());
    }
  }

  ngAfterViewInit(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      return;
    }
    this.trackScrollListener = () => this.syncScrollState();
    track.addEventListener('scroll', this.trackScrollListener, { passive: true });
    this.syncScrollState();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
    const track = this.trackRef?.nativeElement;
    if (track && this.trackScrollListener) {
      track.removeEventListener('scroll', this.trackScrollListener);
    }
  }

  isBusy(id: string): boolean {
    return this.busyIds.includes(id);
  }

  onCardClick(item: JosanzStatusKanbanItem, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.josanz-status-kanban__drag-handle')) {
      return;
    }
    this.itemClick.emit(item);
  }

  onDragStarted(): void {
    this.isDragging.set(true);
    this.startAutoScrollLoop();
  }

  onDragEnded(): void {
    this.isDragging.set(false);
    this.scrollVelocity = 0;
    this.scrollEdgeLeft.set(false);
    this.scrollEdgeRight.set(false);
    this.stopAutoScroll();
    this.syncScrollState();
  }

  onDragMoved(event: CdkDragMove): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const x = event.pointerPosition.x;
    const leftDist = x - rect.left;
    const rightDist = rect.right - x;

    if (leftDist < AUTO_SCROLL_EDGE_PX && this.canScrollLeft()) {
      const intensity = 1 - Math.max(0, leftDist) / AUTO_SCROLL_EDGE_PX;
      this.scrollVelocity = -AUTO_SCROLL_MAX_SPEED * intensity;
      this.scrollEdgeLeft.set(true);
      this.scrollEdgeRight.set(false);
      return;
    }

    if (rightDist < AUTO_SCROLL_EDGE_PX && this.canScrollRight()) {
      const intensity = 1 - Math.max(0, rightDist) / AUTO_SCROLL_EDGE_PX;
      this.scrollVelocity = AUTO_SCROLL_MAX_SPEED * intensity;
      this.scrollEdgeRight.set(true);
      this.scrollEdgeLeft.set(false);
      return;
    }

    this.scrollVelocity = 0;
    this.scrollEdgeLeft.set(false);
    this.scrollEdgeRight.set(false);
  }

  scrollTrack(direction: -1 | 1): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      return;
    }
    const step = Math.max(240, Math.round(track.clientWidth * 0.62));
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  onDrop(event: CdkDragDrop<JosanzStatusKanbanItem[]>, targetStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const item = event.previousContainer.data[event.previousIndex];
    if (!item || item.statusValue === targetStatus) {
      return;
    }

    const previousStatus = item.statusValue;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    item.statusValue = targetStatus;
    this.statusChange.emit({ id: item.id, status: targetStatus, previousStatus });
  }

  badgeStyles(color?: string): Record<string, string> {
    if (!color) {
      return {};
    }
    if (this.statusBadgeStyle === 'outline') {
      return pillOutlineBadgeStyles(color);
    }
    return {
      'background-color': `color-mix(in srgb, ${color} 16%, var(--josanz-surface))`,
      color,
    };
  }

  statusIcon(label: string): string {
    if (this.statusBadgeStyle !== 'outline') {
      return '';
    }
    const key = this.pillKeyFromLabel(label);
    return getEventOutlinePill(key).icon;
  }

  statusIconRingStyles(label: string): Record<string, string> {
    return eventOutlineIconRingStyles(this.pillKeyFromLabel(label));
  }

  private startAutoScrollLoop(): void {
    this.stopAutoScroll();
    const tick = (): void => {
      const track = this.trackRef?.nativeElement;
      if (track && this.scrollVelocity !== 0) {
        track.scrollLeft += this.scrollVelocity;
        this.syncScrollState();
      }
      if (this.isDragging()) {
        this.autoScrollFrame = requestAnimationFrame(tick);
      }
    };
    this.autoScrollFrame = requestAnimationFrame(tick);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollFrame) {
      cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = 0;
    }
  }

  private syncScrollState(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) {
      this.canScrollLeft.set(false);
      this.canScrollRight.set(false);
      return;
    }
    const maxScroll = track.scrollWidth - track.clientWidth;
    const sl = track.scrollLeft;
    this.canScrollLeft.set(sl > 4);
    this.canScrollRight.set(sl < maxScroll - 4);
  }

  private rebuildBuckets(): void {
    const next: Record<string, JosanzStatusKanbanItem[]> = {};
    for (const column of this.columns) {
      next[column.value] = [];
    }
    for (const item of this.items) {
      const bucketKey = this.resolveBucketKey(item.statusValue, next);
      next[bucketKey].push({ ...item, statusValue: bucketKey });
    }
    this.buckets = next;
    this.columnIds = this.columns.map((column) => column.value);
  }

  private resolveBucketKey(
    statusValue: string,
    buckets: Record<string, JosanzStatusKanbanItem[]>,
  ): string {
    if (Object.prototype.hasOwnProperty.call(buckets, statusValue)) {
      return statusValue;
    }
    const upper = statusValue.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(buckets, upper)) {
      return upper;
    }
    const aliases: Record<string, string> = {
      PLANNED: 'CONFIRMED',
      COMPLETED: 'FINALIZED',
    };
    const mapped = aliases[upper];
    if (mapped && Object.prototype.hasOwnProperty.call(buckets, mapped)) {
      return mapped;
    }
    return this.columns[0]?.value ?? statusValue;
  }

  private pillKeyFromLabel(label: string): JosanzStatusPillKey {
    const normalized = label.toLowerCase();
    if (normalized.includes('borrador')) {
      return 'borrador';
    }
    if (normalized.includes('presupuesto')) {
      return 'presupuesto';
    }
    if (normalized.includes('confirmado')) {
      return 'confirmado';
    }
    if (normalized.includes('producción') || normalized.includes('produccion')) {
      return 'en-produccion';
    }
    if (normalized.includes('ejecución') || normalized.includes('ejecucion')) {
      return 'en-ejecucion';
    }
    if (normalized.includes('cerrado')) {
      return 'cerrado';
    }
    if (normalized.includes('facturado')) {
      return 'facturado';
    }
    if (normalized.includes('cancelado')) {
      return 'cancelado';
    }
    if (normalized.includes('finalizado')) {
      return 'finalizado';
    }
    return 'borrador';
  }
}
