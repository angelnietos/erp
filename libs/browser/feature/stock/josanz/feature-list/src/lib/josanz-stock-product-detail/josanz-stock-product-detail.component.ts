import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  type JosanzFigmaDetailShellConfig,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-product-detail',
  standalone: true,
  imports: [CommonModule, JosanzFigmaDetailShellComponent, SecondaryButtonComponent],
  templateUrl: './josanz-stock-product-detail.component.html',
})
export class JosanzStockProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly productId = this.route.snapshot.paramMap.get('productId') ?? '';

  readonly shellConfig: JosanzFigmaDetailShellConfig = {
    title: `Producto ${this.productId || '—'}`,
    listRoute: '/stock',
    tabs: ['Ficha', 'Movimientos', 'Lotes'],
    statusLabel: 'En stock',
    statusPillKey: 'confirmado',
    saveDisabled: true,
    features: { footerActions: false },
  };

  fichaRows: { label: string; value: string }[] = [];

  readonly movementRows = [
    { id: '1', text: 'Salida evento «Gala anual» — 12/05/2026 · -24 uds' },
    { id: '2', text: 'Entrada compra proveedor — 03/04/2026 · +50 uds' },
    { id: '3', text: 'Ajuste inventario — 15/01/2026 · +12 uds' },
  ];

  readonly lotRows = [
    { lot: 'LOT-2026-001', qty: '120 m', wh: 'Almacén Central', expiry: '—' },
    { lot: 'LOT-2025-889', qty: '130 m', wh: 'Almacén Central', expiry: '—' },
  ];

  ngOnInit(): void {
    this.fichaRows = this.buildFichaRows();
  }

  private buildFichaRows(): { label: string; value: string }[] {
    const map: Record<string, { name: string; cat: string; stock: string; wh: string; status: string }> = {
      'SKU-00124': {
        name: 'Cableado Estructurado Cat6',
        cat: 'Electrónica',
        stock: '250 m',
        wh: 'Almacén Central',
        status: 'En stock',
      },
      'SKU-00125': {
        name: 'Pack Herramientas Pro',
        cat: 'Herramientas',
        stock: '12 uds',
        wh: 'Taller Norte',
        status: 'Bajo mín.',
      },
      'SKU-00126': {
        name: 'Focos LED 50W',
        cat: 'Iluminación',
        stock: '0 uds',
        wh: 'Almacén Central',
        status: 'Agotado',
      },
    };
    const d = map[this.productId] ?? {
      name: 'Producto',
      cat: '—',
      stock: '—',
      wh: '—',
      status: '—',
    };
    return [
      { label: 'Referencia', value: this.productId || '—' },
      { label: 'Nombre', value: d.name },
      { label: 'Categoría', value: d.cat },
      { label: 'Stock actual', value: d.stock },
      { label: 'Almacén preferente', value: d.wh },
      { label: 'Estado', value: d.status },
      { label: 'Stock mínimo', value: '10 uds' },
      { label: 'Ubicación', value: 'Pasillo B · Estantería 12' },
    ];
  }
}
