import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
} from '@josanz-erp/josanz-ui';
import {
  navigateDetailTab,
  readDetailTabFromRoute,
} from '@josanz-erp/josanz-events-feature-list';

@Component({
  selector: 'josanz-stock-product-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent, SecondaryButtonComponent],
  templateUrl: './josanz-stock-product-detail.component.html',
})
export class JosanzStockProductDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly productId = this.route.snapshot.paramMap.get('productId') ?? '';

  activeTab = signal('Ficha');
  readonly tabs = ['Ficha', 'Movimientos', 'Lotes'];

  private readonly tabSlugMap: Record<string, string> = {
    Ficha: 'ficha',
    Movimientos: 'movimientos',
    Lotes: 'lotes',
  };

  readonly fichaRows = this.buildFichaRows();

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
    readDetailTabFromRoute(this.route, this.tabSlugMap, this.tabs, this.activeTab);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
  }

  onBack(): void {
    void this.router.navigate(['/stock']);
  }

  onSave(): void {
    this.onBack();
  }

  onCancel(): void {
    this.onBack();
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
