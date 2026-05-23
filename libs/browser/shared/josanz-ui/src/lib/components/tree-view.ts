import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzTreeNode {
  id: string;
  label: string;
  description?: string;
  children?: JosanzTreeNode[];
  disabled?: boolean;
}

@Component({
  selector: 'josanz-tree-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="grid gap-3"
      [attr.aria-label]="ariaLabel || title || 'Árbol'"
    >
      @if (title) {
        <h2 class="m-0 text-xl font-black" [style.color]="'var(--josanz-text)'">
          {{ title }}
        </h2>
      }
      <ul class="m-0 list-none p-0" role="tree">
        @for (node of nodes; track node.id) {
          <ng-container
            *ngTemplateOutlet="nodeTpl; context: { $implicit: node, level: 0 }"
          ></ng-container>
        }
      </ul>
    </section>

    <ng-template #nodeTpl let-node let-level="level">
      <li
        role="treeitem"
        [attr.aria-expanded]="
          node.children?.length ? isExpanded(node.id) : null
        "
        [attr.aria-checked]="checkable ? isChecked(node.id) : null"
      >
        <div
          class="flex items-start gap-2 rounded-xl px-2 py-2 hover:bg-black/[0.03]"
          [style.paddingLeft.px]="level * 20 + 8"
        >
          @if (checkable) {
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 accent-[var(--josanz-primary)]"
              [checked]="isChecked(node.id)"
              [disabled]="node.disabled"
              (click)="$event.stopPropagation()"
              (change)="toggleCheck(node)"
            />
          }
          @if (node.children?.length) {
            <button
              type="button"
              class="h-6 w-6 rounded-full border border-solid bg-transparent text-xs"
              [style.borderColor]="'var(--josanz-border)'"
              [style.color]="'var(--josanz-text-muted)'"
              (click)="toggle(node)"
            >
              {{ isExpanded(node.id) ? '-' : '+' }}
            </button>
          } @else {
            <span class="h-6 w-6"></span>
          }
          <button
            type="button"
            class="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
            [disabled]="node.disabled"
            (click)="nodeSelect.emit(node)"
          >
            <span
              class="block text-sm font-black"
              [style.color]="'var(--josanz-text)'"
              >{{ node.label }}</span
            >
            @if (node.description) {
              <span
                class="mt-0.5 block text-xs"
                [style.color]="'var(--josanz-text-muted)'"
                >{{ node.description }}</span
              >
            }
          </button>
        </div>
        @if (node.children?.length && isExpanded(node.id)) {
          <ul class="m-0 list-none p-0" role="group">
            @for (child of node.children; track child.id) {
              <ng-container
                *ngTemplateOutlet="
                  nodeTpl;
                  context: { $implicit: child, level: level + 1 }
                "
              ></ng-container>
            }
          </ul>
        }
      </li>
    </ng-template>
  `,
})
export class TreeViewComponent {
  @Input() title = '';
  @Input() nodes: JosanzTreeNode[] = [];
  @Input() expandedIds: string[] = [];
  @Input() checkable = false;
  @Input() checkedIds: string[] = [];
  @Input() ariaLabel = '';

  @Output() expandedIdsChange = new EventEmitter<string[]>();
  @Output() checkedIdsChange = new EventEmitter<string[]>();
  @Output() nodeSelect = new EventEmitter<JosanzTreeNode>();

  isExpanded(id: string): boolean {
    return this.expandedIds.includes(id);
  }

  isChecked(id: string): boolean {
    return this.checkedIds.includes(id);
  }

  toggle(node: JosanzTreeNode): void {
    this.expandedIds = this.isExpanded(node.id)
      ? this.expandedIds.filter((id) => id !== node.id)
      : [...this.expandedIds, node.id];
    this.expandedIdsChange.emit(this.expandedIds);
  }

  toggleCheck(node: JosanzTreeNode): void {
    const ids = this.collectIds(node);
    const allChecked = ids.every((id) => this.isChecked(id));
    if (allChecked) {
      this.checkedIds = this.checkedIds.filter((id) => !ids.includes(id));
    } else {
      this.checkedIds = [...new Set([...this.checkedIds, ...ids])];
    }
    this.checkedIdsChange.emit(this.checkedIds);
  }

  private collectIds(node: JosanzTreeNode): string[] {
    const childIds = (node.children ?? []).flatMap((child) => this.collectIds(child));
    return [node.id, ...childIds];
  }
}
