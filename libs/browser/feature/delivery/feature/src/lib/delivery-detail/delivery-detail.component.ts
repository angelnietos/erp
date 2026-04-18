import type { BadgeVariant } from '@josanz-erp/shared-ui-kit';
import {
  Component,
  OnInit,
  signal,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  UiCardComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiLoaderComponent,
  UiTableComponent,
  UiFeaturePageShellComponent,
} from '@josanz-erp/shared-ui-kit';
import {
  DeliveryNote as ApiDeliveryNote,
  DeliveryNoteService,
  DeliveryFacade,
} from '@josanz-erp/delivery-data-access';
import {
  openPrintableDocument,
  escapeHtml,
  parseSignatureDisplayValue,
} from '@josanz-erp/shared-utils';

export interface DeliveryItem {
  id: string;
  productName: string;
  quantity: number;
  condition: 'new' | 'good' | 'damaged' | 'missing';
  observations: string;
}

export interface DeliveryDetailView {
  id: string;
  budgetId: string;
  budgetReference: string;
  clientName: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  deliveryDate: string;
  returnDate: string;
  deliveryAddress: string;
  recipientName: string;
  /** URL o data URL para <img>; si no hay imagen, usar signatureText. */
  signatureImageSrc?: string;
  signatureText?: string;
  items: DeliveryItem[];
}

@Component({
  selector: 'lib-delivery-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiCardComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiLoaderComponent,
    UiTableComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell [variant]="'widthOnly'" [fadeIn]="true">
      <div class="delivery-detail__stack">
      @if (isLoading()) {
        <ui-loader message="Cargando albarán..."></ui-loader>
      } @else if (delivery(); as d) {
        <div class="page-header">
          <button type="button" class="back-btn" routerLink="/delivery">
            <lucide-icon name="arrow-left"></lucide-icon>
            Volver
          </button>
        </div>

        <div class="delivery-header">
          <div class="delivery-info">
            <h1>Albarán #{{ d.id.slice(0, 8) }}</h1>
            <div class="badges">
              <ui-badge [variant]="getStatusVariant(d.status)">
                {{ getStatusLabel(d.status) }}
              </ui-badge>
              <span class="client-name">{{ d.clientName }}</span>
            </div>
          </div>
          <div class="header-actions">
            <ui-button variant="secondary" icon="pencil" (clicked)="goToEdit(d.id)">Editar</ui-button>
            <ui-button icon="download" (clicked)="downloadPDF()">Descargar PDF</ui-button>
            @if (d.status === 'pending') {
              <ui-button icon="pen-tool" (clicked)="openSignature()">Firmar</ui-button>
            }
          </div>
        </div>

        <div class="delivery-meta">
          <div class="meta-item">
            <span class="label">Presupuesto</span>
            <a [routerLink]="['/budgets', d.budgetId]" class="link">{{ d.budgetReference }}</a>
          </div>
          <div class="meta-item">
            <span class="label">Fecha de Entrega</span>
            <span class="value">{{ formatDate(d.deliveryDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Fecha de Devolución</span>
            <span class="value">{{ formatDate(d.returnDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Dirección</span>
            <span class="value">{{ d.deliveryAddress }}</span>
          </div>
        </div>

        <ui-card title="Material Entregado">
          <ui-table [columns]="itemColumns" [data]="d.items">
            <ng-template #cellTemplate let-item let-key="key">
              @switch (key) {
                @case ('condition') {
                  <ui-badge [variant]="getConditionVariant(item.condition)">
                    {{ getConditionLabel(item.condition) }}
                  </ui-badge>
                }
                @default {
                  {{ item[key] }}
                }
              }
            </ng-template>
          </ui-table>
        </ui-card>

        @if (d.status === 'signed' || d.status === 'completed') {
          <ui-card title="Firma del receptor">
            <div class="signature-box">
              @if (d.signatureImageSrc) {
                <img
                  [src]="d.signatureImageSrc"
                  alt="Firma"
                  class="signature-image"
                  (error)="onSignatureImageError()"
                />
              }
              @if (sigImageBroken() && d.signatureImageSrc) {
                <p class="signature-fallback text-friendly">No se pudo cargar la imagen de firma.</p>
              }
              @if (d.signatureText) {
                <p class="signature-text text-friendly">Conformidad registrada: {{ d.signatureText }}</p>
              }
              @if (!d.signatureImageSrc && !d.signatureText) {
                <p class="signature-muted text-friendly">No hay texto ni imagen de firma guardados para este albarán.</p>
              }
              <span class="signature-name">{{ d.recipientName }}</span>
            </div>
          </ui-card>
        }
      } @else {
        <p class="not-found text-friendly">No se encontró el albarán.</p>
        <button type="button" class="back-btn" routerLink="/delivery">Volver al listado</button>
      }
      </div>
    </ui-feature-page-shell>
  `,
  styles: [
    `
      .delivery-detail__stack {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
      }
      .page-header {
        margin-bottom: 16px;
      }
      .back-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 14px;
        padding: 8px 0;
      }
      .back-btn:hover {
        color: white;
      }
      .delivery-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .delivery-info h1 {
        margin: 0 0 12px 0;
        color: white;
        font-size: 28px;
        font-weight: 700;
      }
      .badges {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .client-name {
        color: #94a3b8;
        font-size: 14px;
      }
      .header-actions {
        display: flex;
        gap: 12px;
      }
      .delivery-meta {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .meta-item .label {
        color: #64748b;
        font-size: 12px;
      }
      .meta-item .value {
        color: white;
        font-size: 14px;
      }
      .link {
        color: #4f46e5;
        text-decoration: none;
      }
      .link:hover {
        text-decoration: underline;
      }
      .signature-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
      }
      .signature-image {
        max-width: 280px;
        max-height: 120px;
        object-fit: contain;
        background: #fff;
        border-radius: 4px;
        padding: 4px;
      }
      .signature-text,
      .signature-muted,
      .signature-fallback {
        color: #e2e8f0;
        font-size: 14px;
        text-align: center;
        margin: 0;
        max-width: 480px;
        line-height: 1.4;
      }
      .signature-muted,
      .signature-fallback {
        color: #94a3b8;
      }
      .signature-name {
        color: #e2e8f0;
        font-size: 14px;
        font-weight: 600;
      }
      .not-found {
        color: #94a3b8;
      }
    `,
  ],
})
export class DeliveryDetailComponent implements OnInit {
  @Input() id?: string;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryNoteService = inject(DeliveryNoteService);
  private readonly deliveryFacade = inject(DeliveryFacade);

  delivery = signal<DeliveryDetailView | null>(null);
  isLoading = signal(true);
  sigImageBroken = signal(false);

  itemColumns = [
    { key: 'productName', header: 'Producto' },
    { key: 'quantity', header: 'Cantidad', width: '100px' },
    { key: 'condition', header: 'Estado', width: '120px' },
    { key: 'observations', header: 'Observaciones' },
  ];

  ngOnInit() {
    const routeId = this.id || this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.loadDelivery(routeId);
    } else {
      this.isLoading.set(false);
    }
  }

  onSignatureImageError() {
    this.sigImageBroken.set(true);
  }

  private toView(api: ApiDeliveryNote): DeliveryDetailView {
    const { imageSrc: signatureImageSrc, text: signatureText } = parseSignatureDisplayValue(
      api.signature,
    );

    const allowed: DeliveryItem['condition'][] = ['new', 'good', 'damaged', 'missing'];
    const items: DeliveryItem[] = (api.items ?? []).map((i) => ({
      id: i.id,
      productName: i.name,
      quantity: i.quantity,
      condition: allowed.includes(i.condition as DeliveryItem['condition'])
        ? (i.condition as DeliveryItem['condition'])
        : 'good',
      observations: i.observations?.trim() || '—',
    }));

    const toDay = (iso: string) => {
      if (!iso.includes('T')) return iso;
      const datePart = iso.split('T')[0];
      return datePart ?? iso;
    };

    return {
      id: api.id,
      budgetId: api.budgetId,
      budgetReference: api.budgetReference ?? `#${api.budgetId.slice(0, 8).toUpperCase()}`,
      clientName: api.clientName,
      status: api.status,
      deliveryDate: toDay(api.deliveryDate),
      returnDate: toDay(api.returnDate),
      deliveryAddress: api.deliveryAddress?.trim() || '—',
      recipientName: api.recipientName?.trim() || api.clientName,
      signatureImageSrc,
      signatureText,
      items,
    };
  }

  loadDelivery(id: string) {
    this.sigImageBroken.set(false);
    const fromList = this.deliveryFacade.deliveryNotes().find((n) => n.id === id);
    if (fromList) {
      this.delivery.set(this.toView(fromList));
      this.isLoading.set(false);
    } else {
      this.isLoading.set(true);
    }
    this.deliveryNoteService.getDeliveryNote(id).subscribe({
      next: (api) => {
        this.delivery.set(this.toView(api));
        this.isLoading.set(false);
      },
      error: () => {
        if (!fromList) {
          this.delivery.set(null);
        }
        this.isLoading.set(false);
      },
    });
  }

  getStatusVariant(status: string | undefined): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'signed':
        return 'success';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'pending':
        return 'Pendiente';
      case 'signed':
        return 'Firmado';
      case 'completed':
        return 'Completado';
      default:
        return '-';
    }
  }

  getConditionVariant(condition: string): BadgeVariant {
    switch (condition) {
      case 'new':
        return 'success';
      case 'good':
        return 'info';
      case 'damaged':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  }

  getConditionLabel(condition: string): string {
    switch (condition) {
      case 'new':
        return 'Nuevo';
      case 'good':
        return 'Bueno';
      case 'damaged':
        return 'Dañado';
      case 'missing':
        return 'Faltante';
      default:
        return condition;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  goToEdit(id: string) {
    void this.router.navigate(['/delivery', id, 'edit']);
  }

  downloadPDF() {
    const d = this.delivery();
    if (!d) return;

    const rows = d.items
      .map(
        (it) =>
          `<tr><td>${escapeHtml(it.productName)}</td><td>${it.quantity}</td><td>${escapeHtml(
            this.getConditionLabel(it.condition),
          )}</td><td>${escapeHtml(it.observations)}</td></tr>`,
      )
      .join('');

    const sigBlock = d.signatureImageSrc
      ? `<p><strong>Firma (imagen):</strong> ver copia digital.</p>`
      : d.signatureText
        ? `<p><strong>Conformidad:</strong> ${escapeHtml(d.signatureText)}</p>`
        : '';

    const body = `
      <h1>Albarán de entrega</h1>
      <div class="meta">
        <div><strong>Nº albarán:</strong> ${escapeHtml(d.id)}</div>
        <div><strong>Cliente:</strong> ${escapeHtml(d.clientName)}</div>
        <div><strong>Presupuesto:</strong> ${escapeHtml(d.budgetReference)}</div>
        <div><strong>Entrega:</strong> ${escapeHtml(this.formatDate(d.deliveryDate))}</div>
        <div><strong>Devolución:</strong> ${escapeHtml(this.formatDate(d.returnDate))}</div>
        <div><strong>Dirección:</strong> ${escapeHtml(d.deliveryAddress)}</div>
        <div><strong>Receptor:</strong> ${escapeHtml(d.recipientName)}</div>
      </div>
      <table>
        <thead><tr><th>Producto</th><th>Cant.</th><th>Estado</th><th>Observaciones</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${sigBlock}
    `;

    openPrintableDocument(`Albarán ${d.id.slice(0, 8)}`, body);
  }

  openSignature() {
    const d = this.delivery();
    if (!d) return;
    const sig = window.prompt(
      'Firma de conformidad: escribe nombre o texto, o pega una imagen en formato data URL (data:image/png;base64,...).',
    );
    if (!sig?.trim()) return;
    this.deliveryNoteService.signDeliveryNote(d.id, sig.trim()).subscribe({
      next: (api) => {
        this.sigImageBroken.set(false);
        this.delivery.set(this.toView(api));
      },
      error: (err: { error?: { message?: string } }) => {
        window.alert(err?.error?.message ?? 'No se pudo registrar la firma.');
      },
    });
  }
}
