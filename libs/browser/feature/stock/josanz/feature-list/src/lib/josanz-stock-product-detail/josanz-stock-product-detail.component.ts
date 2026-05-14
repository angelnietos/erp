import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MainDetailLayoutComponent,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-product-detail',
  standalone: true,
  imports: [CommonModule, MainDetailLayoutComponent],
  templateUrl: './josanz-stock-product-detail.component.html',
})
export class JosanzStockProductDetailComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly productId = this.route.snapshot.paramMap.get('productId') ?? '';

  activeTab = signal('Ficha');
  readonly tabs = ['Ficha', 'Movimientos'];

  readonly fichaRows = this.buildFichaRows();

  setTab(tab: string): void {
    this.activeTab.set(tab);
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

  private buildFichaRows(): { label: string; value: string; accent?: boolean }[] {
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
      { label: 'Stock actual', value: d.stock, accent: true },
      { label: 'Almacén preferente', value: d.wh },
      { label: 'Estado operativo', value: d.status },
    ];
  }
}
