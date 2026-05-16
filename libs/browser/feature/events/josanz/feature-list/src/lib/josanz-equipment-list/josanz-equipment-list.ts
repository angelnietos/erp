import { Component } from '@angular/core';
import { JosanzCatalogListComponent } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListConfig } from '../josanz-catalog/josanz-catalog-list';
import type { JosanzCatalogListRow } from '../josanz-catalog/catalog-status';
import { JOSANZ_CATALOG_EVENT_STATUS_ROWS } from '../josanz-catalog/catalog-status';

const BASE = JOSANZ_CATALOG_EVENT_STATUS_ROWS;
const EQUIPMENT_ROWS: JosanzCatalogListRow[] = [
  { ...BASE[0], pillLabel: 'Técnico', pillVariant: 'staff-tecnico' },
  { ...BASE[1], pillLabel: 'En prácticas', pillVariant: 'staff-practicas' },
  { ...BASE[2], pillLabel: 'Freelance', pillVariant: 'staff-freelance' },
  { ...BASE[3], pillLabel: '', pillVariant: 'borrador' },
  { ...BASE[4], pillLabel: '', pillVariant: 'borrador' },
  { ...BASE[5], pillLabel: '', pillVariant: 'borrador' },
  { ...BASE[6], pillLabel: '', pillVariant: 'borrador' },
];

@Component({
  selector: 'josanz-equipment-list',
  standalone: true,
  imports: [JosanzCatalogListComponent],
  template: `<josanz-catalog-list [config]="config" />`,
})
export class JosanzEquipmentListComponent {
  readonly config: JosanzCatalogListConfig = {
    title: 'Equipo audiovisual',
    primaryBtnLabel: 'Añadir Equipo +',
    secondaryBtnLabel: 'Añadir Almacén +',
    statusColumnLabel: 'Tipo',
    rows: EQUIPMENT_ROWS,
    addRoute: '/stock',
    summaryLine: '180 equipos · 8 activos esta semana',
  };
}
