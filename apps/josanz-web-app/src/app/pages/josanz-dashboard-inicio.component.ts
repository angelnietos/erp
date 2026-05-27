import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FilterTabsComponent,
  JOSANZ_FIGMA_DASHBOARD,
  JOSANZ_FIGMA_SHELL,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';

interface JosanzHomeTech {
  id: string;
  initials: string;
}

interface JosanzHomeEventCard {
  title: string;
  tags: { label: string; bg: string; text: string }[];
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
  imports: [RouterLink, FilterTabsComponent],
  templateUrl: './josanz-dashboard-inicio.component.html',
})
export class JosanzDashboardInicioComponent {
  readonly theme = inject(JosanzThemeService);
  readonly shell = JOSANZ_FIGMA_SHELL;
  readonly dash = JOSANZ_FIGMA_DASHBOARD;

  viewMode: 'Eventos' | 'Técnicos' | 'Proveedores' = 'Técnicos';
  period: 'Día' | 'Semana' | 'Mes' | 'Lista' = 'Semana';

  readonly viewOptions = ['Eventos', 'Técnicos', 'Proveedores'];
  readonly periodOptions = ['Día', 'Semana', 'Mes', 'Lista'];

  readonly technicians: JosanzHomeTech[] = [
    { id: 't1', initials: 'JL' },
    { id: 't2', initials: 'MP' },
    { id: 't3', initials: 'AR' },
    { id: 't4', initials: 'CS' },
    { id: 't5', initials: 'DV' },
  ];

  readonly days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  readonly sampleEvent: JosanzHomeEventCard = {
    title: 'Evento X',
    tags: [
      { label: 'Pagado', bg: '#DCFCE7', text: '#166534' },
      { label: 'Otra etiqueta', bg: '#EDE9FE', text: '#5B21B6' },
      { label: 'Tag', bg: '#FCE7F3', text: '#9D174D' },
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
    if (value === 'Eventos' || value === 'Técnicos' || value === 'Proveedores') {
      this.viewMode = value;
    }
  }

  onPeriodChange(value: string): void {
    if (value === 'Día' || value === 'Semana' || value === 'Mes' || value === 'Lista') {
      this.period = value;
    }
  }

  isPeriodActive(value: string): boolean {
    return this.period === value;
  }
}
