import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DocumentItemComponent,
  JosanzThemeService,
  MainDetailLayoutComponent,
  SecondaryButtonComponent,
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
  private readonly theme = inject(JosanzThemeService);

  activeTab = signal('Resumen');
  showStaffComposer = signal(false);
  staffDraft = '';

  ngOnInit(): void {
    this.theme.setAtmosphere('neutral');
  }

  readonly tabs = [
    'Resumen',
    'Cliente',
    'Staff',
    'Equipo',
    'Albaranes',
    'Facturas',
    'Informes / reportes',
    'Emails',
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
      name: 'Equipo 001',
      warehouse: 'Almacén X',
      status: 'Correcto',
      pillKey: 'confirmado',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-b5b7090db90f?auto=format&fit=crop&q=80&w=120&h=120',
    },
    {
      id: '2',
      name: 'Equipo 001',
      warehouse: 'Almacén X',
      status: 'En uso',
      pillKey: 'en-produccion',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-b5b7090db90f?auto=format&fit=crop&q=80&w=120&h=120',
    },
  ];

  readonly clientRows = [
    { label: 'Cliente', value: 'Cliente ejemplo S.L.' },
    { label: 'Contacto', value: 'María López' },
    { label: 'Email', value: 'maria@cliente-ejemplo.com' },
    { label: 'Teléfono', value: '+34 600 111 222' },
  ];

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    void this.router.navigate(['/events']);
  }

  onCancel(): void {
    void this.router.navigate(['/events']);
  }

  toggleStaffComposer(): void {
    this.showStaffComposer.update((v) => !v);
  }
}
