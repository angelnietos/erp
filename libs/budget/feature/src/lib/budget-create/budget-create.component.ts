import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { BudgetStore } from '@josanz-erp/budget-data-access';
import { CreateBudgetDTO } from '@josanz-erp/budget-api';
import { ClientService, Client } from '@josanz-erp/clients-data-access';
import { InventoryService, Product } from '@josanz-erp/inventory-data-access';
import { UiCardComponent, UiInputComponent, UiButtonComponent, UiSelectComponent, SelectMapperPipe } from '@josanz-erp/shared-ui-kit';
import { LucideAngularModule, Plus, Trash2, Save } from 'lucide-angular';

@Component({
  selector: 'lib-budget-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, LucideAngularModule,
    UiCardComponent, UiInputComponent, UiButtonComponent, UiSelectComponent, SelectMapperPipe
  ],
  templateUrl: './budget-create.component.html',
  styleUrl: './budget-create.component.css'
})
export class BudgetCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly store = inject(BudgetStore);
  private clientService = inject(ClientService);
  private inventoryService = inject(InventoryService);

  Plus = Plus; Trash2 = Trash2; Save = Save;

  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  budgetForm = this.fb.group({
    clientId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    items: this.fb.array([])
  });

  get items() { return this.budgetForm.get('items') as FormArray; }

  ngOnInit() {
    this.clientService.getClients().subscribe(c => this.clients.set(c));
    this.inventoryService.getProducts().subscribe(p => this.products.set(p));
    this.addItem(); 
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
      this.store.createBudget(this.budgetForm.value as CreateBudgetDTO);
    }
  }
}
