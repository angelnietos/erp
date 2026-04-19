import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { 
  UiCardComponent, UiButtonComponent, UiBadgeComponent,
    UiLoaderComponent, UiStatCardComponent, UiModalComponent, UiInputComponent,
    UiTextareaComponent,
    UiFeaturePageShellComponent,
  } from '@josanz-erp/shared-ui-kit';
import { ThemeService, PluginStore } from '@josanz-erp/shared-data-access';
import { RentalService, Rental, RentalSignatureStatus } from '@josanz-erp/rentals-data-access';

@Component({
  selector: 'lib-rentals-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, LucideAngularModule,
    UiCardComponent, UiButtonComponent, UiBadgeComponent,
    UiLoaderComponent, UiStatCardComponent, UiModalComponent, UiInputComponent,
    UiTextareaComponent,
    UiFeaturePageShellComponent,
  ],
  template: `
    <ui-feature-page-shell
      [variant]="'widthOnly'"
      [fadeIn]="true"
      [extraClass]="pluginStore.highPerformanceMode() ? 'high-perf' : ''"
    >
      <div class="rentals-detail__stack">
      @if (isLoading()) {
        <ui-loader message="Sincronizando contrato de alquiler..."></ui-loader>
      } @else if (rental()) {
        <header class="page-header" [style.border-bottom-color]="currentTheme().primary + '33'">
          <div class="header-breadcrumb">
            <button class="back-btn" routerLink="/rentals">
              <lucide-icon name="arrow-left" size="14" aria-hidden="true"></lucide-icon>
              VOLVER A ALQUILERES
            </button>
            <h1 class="page-title text-uppercase glow-text" [style.text-shadow]="'0 0 20px ' + currentTheme().primary + '44'">
              Alquiler #{{ rental()?.id?.slice(0, 8) }}
            </h1>
            <div class="breadcrumb">
              <span class="active" [style.color]="currentTheme().primary">{{ rental()?.clientName }}</span>
              <span class="separator">/</span>
              <span>CONTRATO DE ARRENDAMIENTO</span>
            </div>
          </div>
          <div class="header-actions">
            @if (rental()?.status === 'DRAFT') {
              <ui-button variant="glass" size="md" icon="check" (clicked)="activate()">ACTIVAR ALQUILER</ui-button>
            }
            @if (rental()?.status === 'ACTIVE') {
              <ui-button variant="primary" size="md" icon="archive" (clicked)="complete()">FINALIZAR Y RECIBIR</ui-button>
            }
            <ui-button variant="glass" size="md" icon="printer">IMPRIMIR CONTRATO</ui-button>
            @if (rental()?.status !== 'CANCELLED' && rental()?.status !== 'COMPLETED') {
              <ui-button variant="glass" size="md" icon="pen-tool" (clicked)="openSignatureModal()">FIRMA DIGITAL</ui-button>
            }
          </div>
        </header>

        <div class="stats-row">
          <ui-stat-card 
            label="Monto Total" 
            [value]="formatCurrencyEu(rental()?.totalAmount || 0)" 
            icon="credit-card" 
            [accent]="true">
          </ui-stat-card>
          <ui-stat-card 
            label="Días Transcurridos" 
            [value]="getDaysElapsed(rental()?.startDate) + ' DÍAS'" 
            icon="clock">
          </ui-stat-card>
          <ui-stat-card 
            label="Ítems en Alquiler" 
            [value]="rental()?.itemsCount?.toString() || '0'" 
            icon="layers">
          </ui-stat-card>
        </div>

        <div class="content-grid">
           <div class="main-column">
              <ui-card variant="glass" title="Detalles del Alquiler">
                <div class="info-grid">
                   <div class="info-item">
                      <span class="label">FECHA INICIO</span>
                      <span class="value">{{ formatDate(rental()?.startDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">FECHA DEVOLUCIÓN</span>
                      <span class="value">{{ formatDate(rental()?.endDate) }}</span>
                   </div>
                   <div class="info-item">
                      <span class="label">ESTADO DEL CONTRATO</span>
                      <ui-badge [variant]="getStatusVariant(rental()?.status)">
                        {{ rental()?.status }}
                      </ui-badge>
                   </div>
                   <div class="info-item">
                      <span class="label">IDENTIFICADOR CLIENTE</span>
                      <span class="value">ID: {{ rental()?.clientId }}</span>
                   </div>
                </div>
              </ui-card>

              <ui-card variant="glass" title="Anexos al contrato">
                @if (rental()?.annexes?.length) {
                  <ul class="annex-list">
                    @for (a of rental()!.annexes!; track a.id) {
                      <li class="annex-item">
                        <span class="annex-title">{{ a.title }}</span>
                        @if (a.description) {
                          <p class="annex-desc text-friendly">{{ a.description }}</p>
                        }
                        <span class="annex-date">{{ formatDate(a.createdAt) }}</span>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="annex-empty text-friendly">No hay anexos. Usa «Añadir anexo» en el panel lateral.</p>
                }
              </ui-card>

              <ui-card variant="glass" title="Registro de Actividad">
                 <div class="activity-timeline">
                    <div class="timeline-item">
                       <span class="dot" [style.background]="currentTheme().primary"></span>
                       <div class="activity-content">
                          <span class="time">HACE 4 HORAS</span>
                          <span class="text">Contrato actualizado a estado <strong>{{ rental()?.status }}</strong></span>
                       </div>
                    </div>
                    <div class="timeline-item">
                       <span class="dot"></span>
                       <div class="activity-content">
                          <span class="time">{{ formatDate(rental()?.createdAt) }}</span>
                          <span class="text">Expediente de alquiler creado por sistema</span>
                       </div>
                    </div>
                 </div>
              </ui-card>
           </div>

           <div class="side-column">
              <ui-card variant="glass" title="Garantías y Depósitos">
                 <div class="deposit-box">
                    <lucide-icon name="shield-check" size="24" [style.color]="currentTheme().primary" aria-hidden="true"></lucide-icon>
                    <div class="deposit-info">
                       <span class="deposit-label">FIANZA BLOQUEADA</span>
                       <span class="deposit-value">{{ formatCurrencyEu((rental()?.totalAmount || 0) * 0.2) }}</span>
                    </div>
                 </div>
              </ui-card>

              <ui-card variant="glass" title="Firma digital">
                 <div class="sig-detail">
                    <div class="sig-row">
                      <span class="lbl">ESTADO</span>
                      <ui-badge [variant]="signatureBadgeVariant(rental()?.signatureStatus)">
                        {{ getSignatureLabel(rental()?.signatureStatus) | uppercase }}
                      </ui-badge>
                    </div>
                    @if (rental()?.signedAt) {
                      <div class="sig-row">
                        <span class="lbl">FECHA FIRMA</span>
                        <span class="val">{{ formatDate(rental()?.signedAt) }}</span>
                      </div>
                    }
                    @if (rental()?.signatureStatus !== 'SIGNED' && rental()?.status !== 'CANCELLED' && rental()?.status !== 'COMPLETED') {
                      <div class="sig-actions">
                        <ui-button variant="glass" class="full-width" icon="send" (clicked)="signatureRequest()">SOLICITAR FIRMA</ui-button>
                        <ui-button variant="primary" class="full-width" icon="check" (clicked)="signatureComplete()">MARCAR FIRMADO</ui-button>
                      </div>
                    }
                 </div>
              </ui-card>

              <ui-card variant="glass" title="Acciones Rápidas">
                 <div class="quick-actions">
                    <ui-button variant="glass" class="full-width" icon="file-plus" (clicked)="openAnnexModal()">AÑADIR ANEXO</ui-button>
                    @if (rental()?.status !== 'CANCELLED' && rental()?.status !== 'COMPLETED') {
                      <ui-button variant="glass" class="full-width danger-btn" icon="trash-2" (clicked)="cancel()">ANULAR CONTRATO</ui-button>
                    }
                 </div>
              </ui-card>
           </div>
        </div>
      }
      </div>

      <ui-modal
        [isOpen]="isSignatureModalOpen()"
        title="FIRMA DIGITAL"
        variant="dark"
        (closed)="closeSignatureModal()"
      >
        @if (rental(); as r) {
          <div class="sig-modal-body">
            <p class="muted text-friendly">Gestiona el flujo de firma electrónica del contrato. El email sirve como referencia para el envío al firmante.</p>
            <ui-input label="Email del firmante" [(ngModel)]="signatureEmail" placeholder="firma@cliente.com"></ui-input>
          </div>
        }
        <div modal-footer class="sig-modal-footer">
          <ui-button variant="ghost" (clicked)="closeSignatureModal()">CERRAR</ui-button>
          @if (rental()?.signatureStatus !== 'SIGNED') {
            <ui-button variant="glass" (clicked)="signatureRequestFromModal()">ENVIAR SOLICITUD</ui-button>
            <ui-button variant="app" (clicked)="signatureCompleteFromModal()">MARCAR FIRMADO</ui-button>
          }
        </div>
      </ui-modal>

      <ui-modal
        [isOpen]="isAnnexModalOpen()"
        title="AÑADIR ANEXO"
        variant="dark"
        (closed)="closeAnnexModal()"
      >
        <div class="annex-modal-body">
          <ui-input label="Título del anexo" [(ngModel)]="annexTitle" placeholder="Ej. Condiciones de uso"></ui-input>
          <ui-textarea label="Descripción (opcional)" [(ngModel)]="annexDescription" placeholder="Detalle del anexo..." variant="dark"></ui-textarea>
        </div>
        <div modal-footer class="sig-modal-footer">
          <ui-button variant="ghost" (clicked)="closeAnnexModal()">CANCELAR</ui-button>
          <ui-button variant="app" [disabled]="!annexTitle.trim()" (clicked)="submitAnnex()">GUARDAR ANEXO</ui-button>
        </div>
      </ui-modal>
    </ui-feature-page-shell>
  `,
  styles: [`
    .rentals-detail__stack {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
    }

    .back-btn {
      background: none; border: none; color: var(--text-muted); 
      display: flex; align-items: center; gap: 8px; font-size: 0.6rem;
      font-weight: 800; cursor: pointer; padding: 0; margin-bottom: 0.5rem;
      transition: color 0.3s;
    }
    .back-btn:hover { color: #fff; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .glow-text { 
      font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0; 
      letter-spacing: 0.05em; font-family: var(--font-main);
    }
    
    .breadcrumb {
      display: flex; gap: 8px; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.1em; color: var(--text-muted); margin-top: 0.5rem;
    }
    
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .main-column, .side-column { display: flex; flex-direction: column; gap: 1.5rem; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 0.5rem 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.5rem; }
    .info-item .label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
    .info-item .value { font-size: 0.7rem; font-weight: 800; color: #fff; }

    .activity-timeline { display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem 0; }
    .timeline-item { display: flex; gap: 1rem; position: relative; }
    .dot { width: 8px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 50%; margin-top: 4px; z-index: 1; }
    .activity-content { display: flex; flex-direction: column; gap: 2px; }
    .time { font-size: 0.5rem; font-weight: 900; color: var(--text-muted); }
    .text { font-size: 0.65rem; color: var(--text-secondary); }

    .deposit-box { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; }
    .deposit-info { display: flex; flex-direction: column; }
    .deposit-label { font-size: 0.55rem; font-weight: 700; color: var(--text-muted); }
    .deposit-value { font-size: 0.9rem; font-weight: 900; color: #fff; }

    .quick-actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .full-width { width: 100%; text-align: left; }
    .danger-btn:hover { background: rgba(239, 68, 68, 0.1) !important; color: #ff4b4b !important; border-color: rgba(239, 68, 68, 0.2) !important; }

    .sig-detail { display: flex; flex-direction: column; gap: 1rem; }
    .sig-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
    .sig-row .lbl { font-size: 0.55rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.08em; }
    .sig-row .val { font-size: 0.7rem; font-weight: 700; color: #fff; }
    .sig-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem; }
    .sig-modal-body { display: flex; flex-direction: column; gap: 1rem; }
    .sig-modal-body .muted { font-size: 0.7rem; color: var(--text-muted); margin: 0; line-height: 1.45; }
    .sig-modal-footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.75rem; width: 100%; }
    .annex-modal-body { display: flex; flex-direction: column; gap: 1rem; }
    .annex-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
    .annex-item { padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .annex-item:last-child { border-bottom: none; }
    .annex-title { font-size: 0.75rem; font-weight: 800; color: #fff; display: block; }
    .annex-desc { font-size: 0.65rem; color: var(--text-secondary); margin: 0.35rem 0 0; line-height: 1.4; }
    .annex-date { font-size: 0.5rem; font-weight: 700; color: var(--text-muted); margin-top: 0.35rem; display: block; }
    .annex-empty { font-size: 0.7rem; color: var(--text-muted); margin: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RentalService);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly themeService = inject(ThemeService);
  public readonly pluginStore = inject(PluginStore);

  currentTheme = this.themeService.currentThemeData;
  rental = signal<Rental | null>(null);
  isLoading = signal(true);
  isSignatureModalOpen = signal(false);
  isAnnexModalOpen = signal(false);
  signatureEmail = '';
  annexTitle = '';
  annexDescription = '';

  openSignatureModal = (): void => {
    this.signatureEmail = '';
    this.isSignatureModalOpen.set(true);
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.loadRental(id);
    }
  }

  loadRental(id: string) {
    const cached = this.service.getListCached(id);
    if (cached) {
      this.rental.set(cached);
      this.isLoading.set(false);
      this.cdr.markForCheck();
    } else {
      this.isLoading.set(true);
    }
    this.service.getRental(id).subscribe({
      next: (r) => {
        if (r) {
          this.service.upsertListCache(r);
          this.rental.set(r);
        } else if (!cached) {
          this.rental.set(null);
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        if (!cached) {
          this.rental.set(null);
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  getStatusVariant(status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'info';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'default';
      case 'PENDING': return 'info';
      default: return 'default';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatCurrencyEu(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }

  getDaysElapsed(startDate: string | undefined): number {
     if (!startDate) return 0;
     const diff = new Date().getTime() - new Date(startDate).getTime();
     return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  activate() {
    const r = this.rental();
    if (!r) return;
    this.service.activateRental(r.id).subscribe({
      next: (upd) => {
        this.rental.set(upd);
        this.cdr.markForCheck();
      },
      error: (err) => this.notifyHttpError('No se pudo activar el alquiler', err),
    });
  }

  complete() {
    const r = this.rental();
    if (!r) return;
    this.service.completeRental(r.id).subscribe({
      next: (upd) => {
        this.rental.set(upd);
        this.cdr.markForCheck();
      },
      error: (err) => this.notifyHttpError('No se pudo finalizar el alquiler', err),
    });
  }

  cancel() {
    const r = this.rental();
    if (!r) return;
    if (!confirm('¿Anular este contrato? Esta acción marcará el alquiler como cancelado.')) return;
    this.service.cancelRental(r.id).subscribe({
      next: (upd) => {
        this.rental.set(upd);
        this.cdr.markForCheck();
      },
      error: (err) => this.notifyHttpError('No se pudo anular el contrato', err),
    });
  }

  openAnnexModal() {
    this.annexTitle = '';
    this.annexDescription = '';
    this.isAnnexModalOpen.set(true);
  }

  closeAnnexModal() {
    this.isAnnexModalOpen.set(false);
  }

  submitAnnex() {
    const r = this.rental();
    const title = this.annexTitle.trim();
    if (!r || !title) return;
    this.service
      .addRentalAnnex(r.id, {
        title,
        description: this.annexDescription.trim() || undefined,
      })
      .subscribe({
        next: (upd) => {
          this.rental.set(upd);
          this.closeAnnexModal();
          this.cdr.markForCheck();
        },
        error: (err) => this.notifyHttpError('No se pudo guardar el anexo', err),
      });
  }

  private notifyHttpError(message: string, err: unknown) {
    const e = err as {
      error?: { message?: string | string[] };
      message?: string;
    };
    const raw = e?.error?.message;
    const detail = Array.isArray(raw) ? raw.join(', ') : raw;
    window.alert(detail ? `${message}: ${detail}` : message);
    this.cdr.markForCheck();
  }

  closeSignatureModal() {
    this.isSignatureModalOpen.set(false);
  }

  getSignatureLabel(s?: RentalSignatureStatus): string {
    switch (s) {
      case 'SIGNED': return 'Firmado';
      case 'PENDING': return 'Pendiente';
      default: return 'Sin iniciar';
    }
  }

  signatureBadgeVariant(s?: RentalSignatureStatus): 'success' | 'warning' | 'default' {
    switch (s) {
      case 'SIGNED': return 'success';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }

  signatureRequest() {
    const r = this.rental();
    if (!r) return;
    this.service.updateRental(r.id, { signatureStatus: 'PENDING' }).subscribe({
      next: (upd) => {
        this.rental.set(upd);
        this.cdr.markForCheck();
      },
      error: (err) => this.notifyHttpError('No se pudo solicitar la firma', err),
    });
  }

  signatureComplete() {
    const r = this.rental();
    if (!r) return;
    this.service.updateRental(r.id, { signatureStatus: 'SIGNED' }).subscribe({
      next: (upd) => {
        this.rental.set(upd);
        this.cdr.markForCheck();
      },
      error: (err) => this.notifyHttpError('No se pudo marcar como firmado', err),
    });
  }

  signatureRequestFromModal() {
    this.signatureRequest();
    this.closeSignatureModal();
  }

  signatureCompleteFromModal() {
    this.signatureComplete();
    this.closeSignatureModal();
  }
}
