import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocumentItemComponent,
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
  navigateDetailTab,
  readDetailTabFromRoute,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

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
    MainDetailLayoutComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
  ],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  activeTab = signal('Resumen');
  staffDraft = '';
  budgetSearch = '';
  showBudgetPicker = signal(false);
  highlightedBudgetId = signal('mic-03');
  budgetLines: JosanzBudgetCatalogItem[] = [];
  readonly equipmentImageFailed = signal<ReadonlySet<string>>(new Set());
  emailForm = { date: 'dd/mm/aaaa', subject: 'Asunto ejemplo', body: 'Cuerpo del email…' };

  readonly deliveryNotes = ['Albarán 001.pdf', 'Albarán 002.pdf'];
  readonly invoices = ['Factura 001.pdf', 'Factura borrador.pdf'];
  readonly reportFiles = ['Informe post-evento.pdf', 'Checklist técnico.pdf'];

  private readonly tabSlugMap: Record<string, string> = {
    Resumen: 'resumen',
    Cliente: 'cliente',
    Staff: 'staff',
    Presupuesto: 'presupuesto',
    Equipo: 'equipo',
    Albaranes: 'albaranes',
    Facturas: 'facturas',
    'Informes / reportes': 'informes',
    Emails: 'emails',
    Stock: 'stock',
    Mantenimiento: 'mantenimiento',
    Historial: 'historial',
    Multas: 'multas',
    Contratos: 'contratos',
    'Nóminas': 'nominas',
    Ausencias: 'ausencias',
    Líneas: 'lineas',
    Cobros: 'cobros',
  };

  readonly eventTabs = [
    'Resumen',
    'Cliente',
    'Staff',
    'Presupuesto',
    'Equipo',
    'Albaranes',
    'Facturas',
    'Informes / reportes',
    'Emails',
  ];

  readonly budgetTotal = '€ 340.00';

  readonly resumenKpis = [
    { label: 'Presupuesto', value: '€ 340,00' },
    { label: 'Staff', value: '4 asignados' },
    { label: 'Material', value: '12 ítems' },
    { label: 'Estado', value: 'Confirmado' },
  ];

  readonly budgetCatalog: JosanzBudgetCatalogItem[] = [
    {
      id: 'mic-01',
      name: 'Micrófono 01',
      warehouse: 'Almacén X',
      status: 'Mantenimiento',
      pillKey: 'en-proceso',
    },
    {
      id: 'mic-02',
      name: 'Micrófono 02',
      warehouse: 'Almacén X',
      status: 'En uso',
      pillKey: 'en-produccion',
    },
    {
      id: 'mic-03',
      name: 'Micrófono 03',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
    },
    {
      id: 'mic-04',
      name: 'Micrófono 04',
      warehouse: 'Almacén X',
      status: 'Averiado',
      pillKey: 'cancelado',
    },
    {
      id: 'mic-05',
      name: 'Micrófono 05',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
    },
    {
      id: 'mic-06',
      name: 'Micrófono 06',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
    },
  ];

  readonly emails: JosanzEventEmail[] = [
    {
      id: '1',
      time: '00:00',
      subject: 'Asunto ejemplo',
      preview: 'Nota breve lorem ipsum dolor sit amet, consectetur',
    },
  ];

  readonly heroImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400&h=400';

  readonly eventNotes: JosanzEventNote[] = [
    {
      id: '1',
      text: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    },
  ];

  readonly staffNotes: JosanzEventNote[] = [
    {
      id: '1',
      text: 'Explicación breve lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    },
    {
      id: '2',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
  ];

  readonly inspirationFiles = ['1.pdf', '2.pdf'];

  readonly staffMembers: JosanzEventStaffMember[] = [
    {
      id: '1',
      name: 'Nombre Apellidos',
      role: 'Especialización',
      tag: 'Técnico',
      pillKey: 'staff-tecnico',
      avatarUrl: 'https://i.pravatar.cc/96?img=12',
    },
    {
      id: '2',
      name: 'Nombre Apellidos',
      role: 'Especialización',
      tag: 'En prácticas',
      pillKey: 'staff-practicas',
      avatarUrl: 'https://i.pravatar.cc/96?img=32',
    },
    {
      id: '3',
      name: 'Nombre Apellidos',
      role: 'Especialización',
      tag: 'Freelance',
      pillKey: 'staff-freelance',
      avatarUrl: 'https://i.pravatar.cc/96?img=45',
    },
  ];

  readonly equipment: JosanzEventEquipment[] = [
    {
      id: '1',
      name: 'Micrófono 03',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
      imageUrl: '',
    },
    {
      id: '2',
      name: 'Micrófono 02',
      warehouse: 'Almacén X',
      status: 'En uso',
      pillKey: 'en-produccion',
      imageUrl: '',
    },
    {
      id: '3',
      name: 'Equipo 001',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
      imageUrl: '',
    },
    {
      id: '4',
      name: 'Equipo 002',
      warehouse: 'Almacén Y',
      status: 'Mantenimiento',
      pillKey: 'en-proceso',
      imageUrl: '',
    },
  ];

  readonly clientRows = [
    { label: 'Cliente', value: 'Cliente ejemplo S.L.' },
    { label: 'Contacto', value: 'María López' },
    { label: 'Email', value: 'maria@cliente-ejemplo.com' },
    { label: 'Teléfono', value: '+34 600 111 222' },
    { label: 'Operador', value: 'Julia López' },
    { label: 'Tipo', value: 'Externo' },
  ];

  ngOnInit(): void {
    readDetailTabFromRoute(this.route, this.tabSlugMap, this.eventTabs, this.activeTab);
    this.budgetLines = this.budgetCatalog.slice(0, 3);
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    this.showBudgetPicker.set(false);
    navigateDetailTab(this.router, this.route, tab, this.tabSlugMap);
  }

  onEquipmentImageError(id: string): void {
    const next = new Set(this.equipmentImageFailed());
    next.add(id);
    this.equipmentImageFailed.set(next);
  }

  onBack(): void {
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    void this.router.navigate(['/events']);
  }

  onCancel(): void {
    void this.onBack();
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
}
