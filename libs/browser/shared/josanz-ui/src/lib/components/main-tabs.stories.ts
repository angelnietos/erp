import type { Meta, StoryObj } from '@storybook/angular';
import { MainTabsComponent } from './main-tabs';
import { expect, within } from '@storybook/test';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'MainTabsComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<MainTabsComponent>;

export const Default: Story = {
  args: {
    options: ['Datos', 'Operadores', 'Presupuestos', 'Facturas', 'Vehículos'],
    selection: 'Datos',
  },
};

export const Financial: Story = {
  args: {
    options: ['Ingresos', 'Gastos', 'Beneficios'],
    selection: 'Ingresos',
  },
};

export const Settings: Story = {
  args: {
    options: ['Perfil', 'Seguridad', 'Notificaciones'],
    selection: 'Seguridad',
  },
};
