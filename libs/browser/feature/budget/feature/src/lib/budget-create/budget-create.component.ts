import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BudgetStore, BudgetService } from '@josanz-erp/budget-data-access';
import { CreateBudgetDTO } from '@josanz-erp/budget-api';
import { ClientService, Client } from '@josanz-erp/clients-data-access';
import { InventoryService, Product } from '@josanz-erp/inventory-data-access';
import { UiCardComponent, UiInputComponent, UiButtonComponent, UiSelectComponent, SelectMapperPipe } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, Trash2, Save } from 'lucide-angular';
import { AIFormBridgeService } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'lib-budget-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    UiCardComponent,
    UiInputComponent,
    UiButtonComponent,
    UiSelectComponent,
    SelectMapperPipe,
  ],
  templateUrl: './budget-create.component.html',
  styleUrl: './budget-create.component.css'
})
export class BudgetCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly store = inject(BudgetStore);
  private clientService = inject(ClientService);
  private inventoryService = inject(InventoryService);
  private budgetService = inject(BudgetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private aiFormBridge = inject(AIFormBridgeService);

  Plus = Plus; Trash2 = Trash2; Save = Save;

  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);
  readonly isEditMode = signal(false);
  readonly editBudgetId = signal<string | null>(null);
  readonly hydrating = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly notDraft = signal(false);

  budgetForm = this.fb.group({
    clientId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    items: this.fb.array([])
  });

  get items() { return this.budgetForm.get('items') as FormArray; }

  ngOnInit() {
    this.aiFormBridge.registerForm(this.budgetForm as FormGroup);
    this.clientService.getClients().subscribe((c) => this.clients.set(c));
    this.inventoryService.getProducts().subscribe((p) => this.products.set(p));

    const path = this.route.snapshot.routeConfig?.path;
    if (path === ':id/edit') {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        void this.router.navigate(['/budgets']);
        return;
      }
      this.isEditMode.set(true);
      this.editBudgetId.set(id);
      this.hydrating.set(true);
      this.budgetService.getBudget(id).subscribe({
        next: (b) => {
          this.hydrating.set(false);
          if (!b) {
            this.loadError.set('Presupuesto no encontrado.');
            return;
          }
          if (b.status !== 'DRAFT') {
            this.notDraft.set(true);
            return;
          }
          while (this.items.length) {
            this.items.removeAt(0);
          }
          this.budgetForm.patchValue({
            clientId: b.clientId,
            startDate: this.toDateInputValue(b.startDate),
            endDate: this.toDateInputValue(b.endDate),
          });
          const lines = b.items ?? [];
          if (lines.length === 0) {
            this.addItem();
          } else {
            for (const item of lines) {
              this.items.push(
                this.fb.group({
                  productId: [item.productId, Validators.required],
                  quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                  price: [item.price, [Validators.required, Validators.min(0)]],
                  tax: [item.tax ?? 21],
                  discount: [item.discount ?? 0],
                }),
              );
            }
          }
        },
        error: () => {
          this.hydrating.set(false);
          this.loadError.set('No se pudo cargar el presupuesto.');
        },
      });
    } else {
      this.addItem();
    }
  }

  private toDateInputValue(value: string): string {
    if (!value) {
      return '';
    }
    return value.includes('T') ? value.split('T')[0] : value;
  }

  addItem() {
    this.items.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      tax: [21],
      discount: [0]
    }));
  }

  removeItem(index: number) { this.items.removeAt(index); }

  onProductChange(index: number) {
    const productId = this.items.at(index).get('productId')?.value;
    const product = this.products().find(p => p.id === productId);
    if (product) {
      this.items.at(index).patchValue({ price: product.dailyRate });
    }
  }

  calculateSubtotal() {
    return this.items.controls.reduce((acc, control) => {
      const { price, quantity, discount } = control.value;
      return acc + ((price || 0) * (quantity || 0) * (1 - (discount || 0) / 100));
    }, 0);
  }

  calculateTotal() {
    return this.items.controls.reduce((acc, control) => {
      const { price, quantity, discount, tax } = control.value;
      const sub = ((price || 0) * (quantity || 0) * (1 - (discount || 0) / 100));
      return acc + (sub * (1 + (tax || 21) / 100));
    }, 0);
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      const { startDate, endDate } = this.budgetForm.value;
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return;
      }
      const dto = this.budgetForm.value as CreateBudgetDTO;
      const editId = this.editBudgetId();
      if (this.isEditMode() && editId) {
        this.store.updateBudget({ id: editId, dto });
      } else {
        this.store.createBudget(dto);
      }
    }
  }
}
