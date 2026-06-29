import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import {
  FilterTabsComponent,
  JOSANZ_FIGMA_DASHBOARD,
  JOSANZ_FIGMA_SHELL,
  JosanzThemeService,
  resolveJosanzUserDisplayName,
  resolveJosanzUserFirstName,
  resolveJosanzWelcomeTitle,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

interface JosanzHomeTech {
  id: string;
  initials: string;
  label: string;
}

interface JosanzHomeEventCard {
  title: string;
  tags: { label: string; pillKey: JosanzStatusPillKey }[];
  client: string;
  description: string;
}

interface JosanzHomeScheduleCell {
  day: string;
  techId: string;
  event?: JosanzHomeEventCard;
}

/**
 * Inicio Figma: filtros Eventos/Técnicos, rejilla semanal y tarjetas «Dato».
 */
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FilterTabsComponent],
  templateUrl: './josanz-dashboard-inicio.component.html',
})
export class JosanzDashboardInicioComponent {
  readonly theme = inject(JosanzThemeService);
  private readonly globalAuth = inject(GlobalAuthStore);
  readonly shell = JOSANZ_FIGMA_SHELL;
  readonly dash = JOSANZ_FIGMA_DASHBOARD;

  readonly userDisplayName = computed(() =>
    resolveJosanzUserDisplayName(this.globalAuth.user()),
  );
  readonly userFirstName = computed(() =>
    resolveJosanzUserFirstName(this.globalAuth.user()),
  );
  readonly welcomeTitle = computed(() =>
    resolveJosanzWelcomeTitle(this.globalAuth.user()),
  );

  viewMode: 'Eventos' | 'Técnicos' | 'Proveedores' = 'Técnicos';
  period: 'Día' | 'Semana' | 'Mes' | 'Lista' = 'Semana';

  readonly viewOptions = ['Eventos', 'Técnicos', 'Proveedores'];
  readonly periodOptions = ['Día', 'Semana', 'Mes', 'Lista'];

  readonly technicians: JosanzHomeTech[] = [
    { id: 't1', initials: 'S1', label: 'Staff 01' },
    { id: 't2', initials: 'S2', label: 'Staff 02' },
    { id: 't3', initials: 'S3', label: 'Staff 03' },
    { id: 't4', initials: 'S4', label: 'Staff 04' },
    { id: 't5', initials: 'S5', label: 'Staff 05' },
  ];

  readonly kpis = [
    {
      label: 'Cantidad X',
      value: '€ 45,678.90',
      delta: '+20%',
      deltaPositive: true,
      deltaSuffix: ' este mes',
      wide: false,
    },
    {
      label: 'Valor Y',
      value: '2,405',
      delta: '+33%',
      deltaPositive: true,
      deltaSuffix: ' respecto al mes anterior',
      wide: false,
    },
    {
      label: 'Valor Z',
      value: '10,353',
      delta: '-8%',
      deltaPositive: false,
      deltaSuffix: ' este mes',
      wide: true,
    },
  ];

  readonly days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  readonly sampleEvent: JosanzHomeEventCard = {
    title: 'Evento X',
    tags: [
      { label: 'Pagado', pillKey: 'confirmado' },
      { label: 'Otra etiqueta', pillKey: 'pospuesto' },
      { label: 'Tag', pillKey: 'staff-freelance' },
    ],
    client: 'Cliente',
    description: 'Información relevante del evento para ver en un momento…',
  };

  readonly scheduleCells: JosanzHomeScheduleCell[] = [
    { day: 'Lunes', techId: 't1', event: this.sampleEvent },
    { day: 'Lunes', techId: 't2' },
    { day: 'Lunes', techId: 't3' },
    { day: 'Lunes', techId: 't4' },
    { day: 'Lunes', techId: 't5' },
    { day: 'Martes', techId: 't1' },
    { day: 'Martes', techId: 't2', event: this.sampleEvent },
    { day: 'Martes', techId: 't3' },
    { day: 'Martes', techId: 't4' },
    { day: 'Martes', techId: 't5' },
    { day: 'Miércoles', techId: 't1' },
    { day: 'Miércoles', techId: 't2' },
    { day: 'Miércoles', techId: 't3' },
    { day: 'Miércoles', techId: 't4' },
    { day: 'Miércoles', techId: 't5' },
  ];

  cellFor(day: string, techId: string): JosanzHomeScheduleCell | undefined {
    return this.scheduleCells.find((c) => c.day === day && c.techId === techId);
  }

  onViewChange(value: string): void {
    if (
      value === 'Eventos' ||
      value === 'Técnicos' ||
      value === 'Proveedores'
    ) {
      this.viewMode = value;
    }
  }

  onPeriodChange(value: string): void {
    if (
      value === 'Día' ||
      value === 'Semana' ||
      value === 'Mes' ||
      value === 'Lista'
    ) {
      this.period = value;
    }
  }

  isPeriodActive(value: string): boolean {
    return this.period === value;
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
