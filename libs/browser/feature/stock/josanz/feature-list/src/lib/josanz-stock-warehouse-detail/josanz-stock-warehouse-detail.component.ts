import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-warehouse-detail',
  standalone: true,
  imports: [CommonModule, JosanzFigmaDetailShellComponent, SecondaryButtonComponent],
  templateUrl: './josanz-stock-warehouse-detail.component.html',
})
export class JosanzStockWarehouseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly warehouseId = this.route.snapshot.paramMap.get('warehouseId') ?? '';

  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: `Almacén ${this.warehouseId || '—'}`,
    listRoute: '/stock',
    tabs: ['Ficha', 'Productos', 'Movimientos'],
    statusLabel: 'Activo',
    statusPillKey: 'confirmado',
    saveDisabled: true,
    features: { footerActions: false },
  };

  fichaRows: { label: string; value: string }[] = [];

  readonly productRows = [
    { sku: 'SKU-00124', name: 'Cableado Estructurado Cat6', qty: '250 m' },
    { sku: 'SKU-00127', name: 'Micrófono inalámbrico Shure', qty: '18 uds' },
    { sku: 'SKU-00126', name: 'Focos LED 50W', qty: '0 uds' },
  ];

  readonly movementRows = [
    { id: '1', text: 'Entrada compra — 03/04/2026 · +50 uds (SKU-00124)' },
    { id: '2', text: 'Salida evento «Gala anual» — 12/05/2026 · -24 uds (SKU-00127)' },
    { id: '3', text: 'Ajuste inventario — 15/01/2026 · +12 uds (SKU-00124)' },
  ];

  ngOnInit(): void {
    this.fichaRows = this.buildFichaRows();
  }

  private buildFichaRows(): { label: string; value: string }[] {
    const map: Record<string, { name: string; code: string; address: string; products: string }> = {
      'ALM-01': {
        name: 'Almacén Central',
        code: 'ALM-01',
        address: 'Polígono industrial, nave 4',
        products: '142 referencias',
      },
      'ALM-02': {
        name: 'Almacén 02',
        code: 'ALM-02',
        address: 'Taller Norte — calle Ejemplo 12',
        products: '86 referencias',
      },
    };
    const data = map[this.warehouseId] ?? {
      name: 'Almacén',
      code: this.warehouseId || '—',
      address: '—',
      products: '—',
    };
    return [
      { label: 'Nombre', value: data.name },
      { label: 'Código', value: data.code },
      { label: 'Dirección', value: data.address },
      { label: 'Productos', value: data.products },
      { label: 'Estado', value: 'Activo' },
    ];
  }
}
