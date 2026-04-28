import type { Meta, StoryObj } from '@storybook/angular';
import { UiButtonComponent } from '../button/button.component';
import { UiInputComponent } from '../input/input.component';
import { UiSelectComponent } from '../select/select.component';
import { UiTextareaComponent } from '../textarea/textarea.component';
import { UiModalComponent } from '../modal/modal.component';
import { UiTableComponent } from '../table/table.component';
import { UiCardComponent } from '../card/card.component';
import { UiBadgeComponent } from '../badge/badge.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


export default meta;
type Story = StoryObj;

export const Dashboard: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
          <h2 style="margin: 0; color: var(--text-primary);">Panel de Control</h2>
          <div style="display: flex; gap: 0.5rem;">
            <ui-button [icon]="'bell'" [shape]="'ghost'" [color]="'default'"></ui-button>
            <ui-button [icon]="'user'" [shape]="'solid'" [color]="'primary'">Perfil</ui-button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
          <ui-card style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">Total Ventas</p>
                <h3 style="margin: 0.5rem 0 0 0; color: var(--text-primary);">$124,580</h3>
              </div>
              <ui-badge [color]="'success'" [shape]="'solid'">+12%</ui-badge>
            </div>
          </ui-card>
          <ui-card style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">Nuevos Clientes</p>
                <h3 style="margin: 0.5rem 0 0 0; color: var(--text-primary);">1,284</h3>
              </div>
              <ui-badge [color]="'primary'" [shape]="'solid'">+8%</ui-badge>
            </div>
          </ui-card>
          <ui-card style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">Tickets Pendientes</p>
                <h3 style="margin: 0.5rem 0 0 0; color: var(--text-primary);">23</h3>
              </div>
              <ui-badge [color]="'warning'" [shape]="'solid'">-3%</ui-badge>
            </div>
          </ui-card>
          <ui-card style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">Satisfacción</p>
                <h3 style="margin: 0.5rem 0 0 0; color: var(--text-primary);">94.2%</h3>
              </div>
              <ui-badge [color]="'success'" [shape]="'solid'">Excelente</ui-badge>
            </div>
          </ui-card>
        </div>

        <!-- Form Section -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <!-- Form -->
          <ui-card style="padding: 1.5rem;">
            <h3 style="margin: 0 0 1rem 0; color: var(--text-primary);">Nuevo Proyecto</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <ui-input label="Nombre del Proyecto" placeholder="Ej: Migración ERP" [icon]="'folder'"></ui-input>
              <ui-select label="Categoría" [options]="[{label: 'Desarrollo', value: 'dev'}, {label: 'Diseño', value: 'design'}, {label: 'Marketing', value: 'mkt'}]"></ui-select>
              <ui-textarea label="Descripción" placeholder="Describe el proyecto..." [rows]="3"></ui-textarea>
              <div style="display: flex; gap: 0.5rem;">
                <ui-button [color]="'secondary'" [shape]="'outline'">Cancelar</ui-button>
                <ui-button [color]="'primary'" [shape]="'solid'" [icon]="'check'">Crear Proyecto</ui-button>
              </div>
            </div>
          </ui-card>

          <!-- Quick Actions -->
          <ui-card style="padding: 1.5rem;">
            <h3 style="margin: 0 0 1rem 0; color: var(--text-primary);">Acciones Rápidas</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <ui-button [color]="'primary'" [shape]="'solid'" [icon]="'plus'" [fullWidth]="true">Nuevo Usuario</ui-button>
              <ui-button [color]="'success'" [shape]="'outline'" [icon]="'download'" [fullWidth]="true">Exportar Datos</ui-button>
              <ui-button [color]="'warning'" [shape]="'outline'" [icon]="'settings'" [fullWidth]="true">Configuración</ui-button>
              <ui-button [color]="'danger'" [shape]="'ghost'" [icon]="'trash-2'" [fullWidth]="true">Limpiar Cache</ui-button>
            </div>
          </ui-card>
        </div>

        <!-- Table -->
        <ui-card style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: var(--text-primary);">Últimas Transacciones</h3>
            <ui-button [color]="'primary'" [shape]="'ghost'" [size]="'sm'">Ver Todas</ui-button>
          </div>
          <ui-table [columns]="columns" [data]="tableData" variant="striped">

          </ui-table>
        </ui-card>
      </div>
    `,
  }),
};

const columns = [
  { key: 'id', header: 'ID', width: '60px' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'monto', header: 'Monto' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'status', header: 'Estado' },
];

const tableData = [
  { id: 1, cliente: 'Juan Pérez', monto: '1,250.00', fecha: '2024-01-15', status: 'Completado' },
  { id: 2, cliente: 'María García', monto: '890.50', fecha: '2024-01-14', status: 'Pendiente' },
  { id: 3, cliente: 'Carlos López', monto: '2,100.00', fecha: '2024-01-13', status: 'Completado' },
  { id: 4, cliente: 'Ana Martínez', monto: '450.00', fecha: '2024-01-12', status: 'Cancelado' },
  { id: 5, cliente: 'Luis Sánchez', monto: '3,200.00', fecha: '2024-01-11', status: 'Completado' },
];