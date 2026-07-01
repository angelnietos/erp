import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JosanzEventDetailState } from '../josanz-event-detail.state';

@Component({
  selector: 'josanz-event-presupuestos-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="josanz-event-budget" [formGroup]="form">
      <h3 class="josanz-event-section__title">Presupuestos</h3>

      <div class="josanz-event-budget__client">
        <span>{{ clientLabel }}</span>
      </div>

      <div class="josanz-event-budget__contact-grid">
        <label class="josanz-event-budget__field">
          <span>Dirección</span>
          <input type="text" [(ngModel)]="state.budgetAddress" [ngModelOptions]="{ standalone: true }" placeholder="-" (ngModelChange)="state.touchBudgetFields()" />
        </label>
        <label class="josanz-event-budget__field">
          <span>Persona de contacto</span>
          <input type="text" [(ngModel)]="state.budgetContact" [ngModelOptions]="{ standalone: true }" placeholder="-" (ngModelChange)="state.touchBudgetFields()" />
        </label>
      </div>

      <div class="josanz-event-budget__table">
        <div class="josanz-event-budget__row josanz-event-budget__row--head">
          <span>Ud</span><span>Material</span><span>Precio</span><span>Días</span><span>Coef.</span><span>Total</span><span>Dto%</span><span>Total</span><span></span>
        </div>

        @for (line of state.budgetLines(); track line.id) {
        <div class="josanz-event-budget__row">
          <input class="josanz-event-budget__units" type="number" min="0" [value]="line.units" (input)="state.updateBudgetLine(line.id, 'units', $any($event.target).value)" aria-label="Unidades" />
          <div class="josanz-event-budget__material">
            @if (line.name) {
            <span class="josanz-event-budget-line__name">{{ line.name }}</span>
            <span class="josanz-event-budget-line__pill" [ngStyle]="state.pillStyle(line.pillKey)">{{ line.status }}</span>
            } @else {
            <div class="josanz-event-budget__picker">
              <input type="text" class="josanz-event-budget-search" placeholder="-" [value]="state.budgetSearch" (input)="onBudgetSearch($any($event.target).value)" (focus)="state.showBudgetPicker.set(true)" (blur)="onBudgetBlur()" aria-label="Buscar material" />
              @if (state.showBudgetPicker() && state.filteredBudgetCatalog().length) {
              <div class="josanz-event-budget-panel__dropdown" role="listbox">
                @for (item of state.filteredBudgetCatalog(); track item.id) {
                <button type="button" class="josanz-event-budget-line w-full text-left border-0" [class.josanz-event-budget-line--active]="state.highlightedBudgetId() === item.id" (mousedown)="$event.preventDefault()" (click)="state.selectBudgetItem(line.id, item)">
                  <span class="josanz-event-budget-line__name">{{ item.name }}</span>
                  <span class="josanz-event-budget-line__warehouse">{{ item.warehouse }}</span>
                  <span class="josanz-event-budget-line__pill" [ngStyle]="state.pillStyle(item.pillKey)">{{ item.status }}</span>
                </button>
                }
              </div>
              }
            </div>
            }
          </div>
          <input class="josanz-event-budget__num" type="number" min="0" [value]="line.price" (input)="state.updateBudgetLine(line.id, 'price', $any($event.target).value)" aria-label="Precio" />
          <input class="josanz-event-budget__num" type="number" min="0" [value]="line.days" (input)="state.updateBudgetLine(line.id, 'days', $any($event.target).value)" aria-label="Días" />
          <input class="josanz-event-budget__num" type="number" min="0" step="0.1" [value]="line.coef" (input)="state.updateBudgetLine(line.id, 'coef', $any($event.target).value)" aria-label="Coeficiente" />
          <span class="josanz-event-budget__cell-total">{{ state.formatCurrency(line.units * line.price * (line.days || 1) * (line.coef || 1)) }}</span>
          <input class="josanz-event-budget__num" type="number" min="0" max="100" [value]="line.discount" (input)="state.updateBudgetLine(line.id, 'discount', $any($event.target).value)" aria-label="Descuento" />
          <span class="josanz-event-budget__cell-total">{{ state.formatCurrency(state.budgetLineTotal(line)) }}</span>
          <button type="button" class="josanz-event-icon-btn josanz-event-icon-btn--danger" aria-label="Eliminar línea" (click)="state.removeBudgetLine(line.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
          </button>
        </div>
        }
      </div>

      <div class="josanz-event-budget__add">
        <button type="button" class="josanz-event-figma-add-btn" (click)="state.addBudgetLine()">
          Añadir +
        </button>
      </div>

      <div class="josanz-event-budget__totals">
        <div class="josanz-event-budget__totals-col">
          <div><span>Total neto</span><strong>{{ state.formatCurrency(state.budgetSubtotal()) }}</strong></div>
          <div><span>IVA 21%</span><strong>{{ state.formatCurrency(state.budgetTax()) }}</strong></div>
          <div><span>Total + IVA</span><strong>{{ state.formatCurrency(state.budgetTotal()) }}</strong></div>
        </div>
        <div class="josanz-event-budget__totals-col">
          <div><span>Subtotal</span><strong>{{ state.formatCurrency(state.budgetSubtotal()) }}</strong></div>
          <div><span>IVA</span><strong>{{ state.formatCurrency(state.budgetTax()) }}</strong></div>
          <div><span>Total</span><strong>{{ state.formatCurrency(state.budgetTotal()) }}</strong></div>
        </div>
      </div>

      <div class="josanz-event-budget__observations">
        <label>
          <span>Observaciones</span>
          <textarea rows="2" [(ngModel)]="state.budgetObservations" [ngModelOptions]="{ standalone: true }" (ngModelChange)="state.touchBudgetFields()"></textarea>
        </label>
      </div>
    </section>
  `,
})
export class JosanzEventPresupuestosTabComponent {
  readonly state = inject(JosanzEventDetailState);

  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) clientLabel!: string;

  onBudgetSearch(value: string): void {
    this.state.budgetSearch = value;
    this.state.showBudgetPicker.set(true);
  }

  onBudgetBlur(): void {
    window.setTimeout(() => this.state.showBudgetPicker.set(false), 150);
  }
}
