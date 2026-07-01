import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, catchError, EMPTY, tap } from 'rxjs';
import {
  DocumentItemComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  JosanzFigmaDetailShellComponent,
  SecondaryButtonComponent,
  typologyTabFromApi,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';
import { JosanzEventApiService, type JosanzEventRecord } from '../services/josanz-event-api.service';
import {
  formatEventMetaLine,
  statusPillKeyFromApi,
  typologyLabelFromApi,
} from '../josanz-event-form.utils';
import { eventStatusLabel } from '@josanz-erp/josanz-ui';

interface JosanzEventNote {
  id: string;
  text: string;
}

interface JosanzEventStaffMember {
  id: string;
  name: string;
  role: string;
  tag: string;
  pillKey: JosanzStatusPillKey;
  avatarUrl: string;
}

interface JosanzEventEquipment {
  id: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
  imageUrl: string;
}

interface JosanzBudgetCatalogItem {
  id: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
}

interface JosanzEventEmail {
  id: string;
  time: string;
  subject: string;
  preview: string;
}

@Component({
  selector: 'josanz-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
    JosanzDeleteConfirmHostComponent,
  ],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventApi = inject(JosanzEventApiService);
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);

  readonly event = signal<JosanzEventRecord | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly deleteErrorMessage = signal('');

  staffDraft = '';
  budgetSearch = '';
  showBudgetPicker = signal(false);
  highlightedBudgetId = signal('mic-03');
  budgetLines: JosanzBudgetCatalogItem[] = [];
  readonly equipmentImageFailed = signal<ReadonlySet<string>>(new Set());
  emailForm = { date: 'dd/mm/aaaa', subject: 'Asunto ejemplo', body: 'Cuerpo del email…' };

  private readonly baseShell: Omit<JosanzFigmaDetailShellConfig, 'title' | 'statusLabel' | 'statusPillKey'> = {
    listRoute: '/events',
    tabs: [
      'Resumen',
      'Cliente',
      'Staff',
      'Presupuesto',
      'Equipo',
      'Albaranes',
      'Facturas',
      'Informes / reportes',
      'Emails',
    ],
    tabSlugMap: {
      Resumen: 'resumen',
      Cliente: 'cliente',
      Staff: 'staff',
      Presupuesto: 'presupuesto',
      Equipo: 'equipo',
      Albaranes: 'albaranes',
      Facturas: 'facturas',
      'Informes / reportes': 'informes',
      Emails: 'emails',
    },
    saveLabel: 'Editar evento',
    saveDisabled: false,
    features: { footerActions: false, headerSave: true },
  };

  readonly shellConfig = computed<JosanzFigmaDetailShellConfig>(() => {
    const current = this.event();
    return {
      ...this.baseShell,
      title: current?.name ?? 'Evento',
      statusLabel: current ? eventStatusLabel(current.status) : '',
      statusPillKey: statusPillKeyFromApi(current?.status),
    };
  });

  readonly heroTypologyLabel = computed(() => {
    const current = this.event();
    if (!current) {
      return 'Evento';
    }
    return typologyTabFromApi(current.typology);
  });

  readonly heroMetaLine = computed(() => {
    const current = this.event();
    return current ? formatEventMetaLine(current) : '';
  });

  readonly heroDescription = computed(() => {
    const current = this.event();
    return current?.summary?.trim() || current?.notes?.trim() || 'Sin descripción.';
  });

  readonly resumenKpis = computed(() => {
    const current = this.event();
    const status = current ? eventStatusLabel(current.status) : '—';
    return [
      { label: 'Presupuesto', value: '€ 340,00' },
      { label: 'Staff', value: '4 asignados' },
      { label: 'Material', value: '12 ítems' },
      { label: 'Estado', value: status },
    ];
  });

  readonly eventNotes = computed<JosanzEventNote[]>(() => {
    const note = this.event()?.notes?.trim();
    if (!note) {
      return [];
    }
    return [{ id: '1', text: note }];
  });

  readonly deliveryNotes = ['Albarán 001.pdf', 'Albarán 002.pdf'];
  readonly invoices = ['Factura 001.pdf', 'Factura borrador.pdf'];
  readonly reportFiles = ['Informe post-evento.pdf', 'Checklist técnico.pdf'];
  readonly budgetTotal = '€ 340.00';

  readonly budgetCatalog: JosanzBudgetCatalogItem[] = [
    {
      id: 'mic-01',
      name: 'Micrófono 01',
      warehouse: 'Almacén X',
      status: 'Mantenimiento',
      pillKey: 'en-proceso',
    },
  ];

  readonly emails: JosanzEventEmail[] = [];
  readonly heroImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400&h=400';

  readonly staffNotes: JosanzEventNote[] = [];
  readonly inspirationFiles = ['1.pdf', '2.pdf'];

  readonly staffMembers: JosanzEventStaffMember[] = [];
  readonly equipment: JosanzEventEquipment[] = [];

  readonly clientRows = computed(() => {
    const current = this.event();
    if (!current?.client) {
      return [];
    }
    return [
      { label: 'Cliente', value: current.client.name },
      { label: 'Contacto', value: current.operator?.name ?? '—' },
      { label: 'Email', value: current.operator?.email ?? current.client.name },
      { label: 'Teléfono', value: current.operator?.phone ?? '—' },
      { label: 'Operador', value: current.operator?.name ?? '—' },
      { label: 'Tipo', value: typologyLabelFromApi(current.typology) },
    ];
  });

  private eventId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/events']);
      return;
    }
    this.eventId = id;

    if (this.route.snapshot.queryParamMap.get('updated') === '1') {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.loadEvent();
    this.budgetLines = this.budgetCatalog.slice(0, 1);
  }

  onShellTabChange(_tab: string): void {
    this.showBudgetPicker.set(false);
  }

  onSave(): void {
    void this.router.navigate(['/events', this.eventId, 'edit']);
  }

  onDeleteClick(): void {
    const current = this.event();
    if (!current || this.loading() || this.deleteConfirm.busy()) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deleteConfirm.ask({
      feature: 'events',
      itemName: current.name,
      onConfirm: () =>
        this.eventApi.delete(this.eventId).pipe(
          tap(() => {
            void this.router.navigate(['/events'], { queryParams: { deleted: '1' } });
          }),
          catchError(() => {
            this.deleteErrorMessage.set('No se pudo eliminar el evento. Inténtalo de nuevo.');
            return EMPTY;
          }),
        ),
    });
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  onEquipmentImageError(id: string): void {
    const next = new Set(this.equipmentImageFailed());
    next.add(id);
    this.equipmentImageFailed.set(next);
  }

  filteredBudgetCatalog(): JosanzBudgetCatalogItem[] {
    const q = this.budgetSearch.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.budgetCatalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q),
    );
  }

  onBudgetSearch(value: string): void {
    this.budgetSearch = value;
    this.showBudgetPicker.set(value.trim().length > 0);
  }

  onBudgetSearchBlur(): void {
    window.setTimeout(() => this.showBudgetPicker.set(false), 150);
  }

  openBudgetPicker(): void {
    this.showBudgetPicker.set(true);
  }

  closeBudgetPicker(): void {
    this.showBudgetPicker.set(false);
  }

  selectBudgetItem(item: JosanzBudgetCatalogItem): void {
    this.highlightedBudgetId.set(item.id);
    if (!this.budgetLines.some((line) => line.id === item.id)) {
      this.budgetLines = [...this.budgetLines, item];
    }
    this.budgetSearch = '';
    this.showBudgetPicker.set(false);
  }

  private loadEvent(): void {
    this.loading.set(true);
    this.eventApi
      .getById(this.eventId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (event) => this.event.set(event),
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });
  }
}
