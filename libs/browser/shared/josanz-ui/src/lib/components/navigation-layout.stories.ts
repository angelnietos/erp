import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { NavbarComponent } from './navbar';
import { ContextMenuComponent } from './context-menu';
import {
  ContainerComponent,
  GridComponent,
  SpacerComponent,
  StackComponent,
  FlexComponent,
} from './layout-primitives';
import { ButtonComponent } from './button';
import { StatCardComponent } from './stat-card';

const meta: Meta = {
  title: 'Josanz UI / Navigation & Layout',
  decorators: [
    moduleMetadata({
      imports: [
        NavbarComponent,
        ContextMenuComponent,
        ContainerComponent,
        GridComponent,
        StackComponent,
        SpacerComponent,
        FlexComponent,
        ButtonComponent,
        StatCardComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Navbar, menú contextual y primitivas de layout: container, grid, stack y spacer.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const navItems = [
  { id: 'dashboard', label: 'Panel', href: '#', active: true },
  { id: 'workshop', label: 'Taller', href: '#' },
  { id: 'clients', label: 'Clientes', href: '#' },
  { id: 'orders', label: 'Órdenes', href: '#' },
  { id: 'billing', label: 'Facturación', href: '#' },
];

const menuItems = [
  { id: 'edit', label: 'Editar orden', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicar presupuesto', shortcut: 'D' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Anular orden', tone: 'danger' as const },
];

export const NavigationLayoutSuite: Story = {
  args: {
    itemClick: fn(),
    itemSelect: fn(),
  },
  render: (args) => ({
    props: { ...args, navItems, menuItems },
    template: `
      <josanz-container size="lg">
        <josanz-stack gap="1.5rem">
          <josanz-navbar brand="Josanz ERP" subtitle="Taller central" [items]="navItems" customColor="#635BFF" (itemClick)="itemClick($event)">
            <josanz-context-menu [items]="menuItems" (itemSelect)="itemSelect($event)"></josanz-context-menu>
          </josanz-navbar>
          <josanz-grid [columns]="3" gap="1rem">
            <josanz-stat-card title="Órdenes abiertas" value="24" caption="En curso hoy" icon="calendar" customColor="#635BFF"></josanz-stat-card>
            <josanz-stat-card title="Clientes activos" value="128" caption="Con vehículo registrado" icon="users" tone="success"></josanz-stat-card>
            <josanz-stat-card title="Facturas pendientes" value="8" caption="Vencen esta semana" icon="invoice" tone="warning"></josanz-stat-card>
          </josanz-grid>
          <josanz-flex justify="between" align="center" gap="1rem">
            <josanz-button label="Nueva orden" customColor="#635BFF"></josanz-button>
            <josanz-button label="Exportar listado" variant="secondary" [showIcon]="false"></josanz-button>
          </josanz-flex>
          <josanz-spacer height="0.5rem"></josanz-spacer>
        </josanz-stack>
      </josanz-container>
    `,
  }),
};

export const InteractiveContextMenu: Story = {
  args: {
    itemSelect: fn(),
  },
  render: (args) => ({
    props: { ...args, menuItems },
    template: `<josanz-context-menu [items]="menuItems" [open]="true" (itemSelect)="itemSelect($event)"></josanz-context-menu>`,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('menuitem', { name: /editar/i }));
    await expect(args['itemSelect']).toHaveBeenCalledTimes(1);
  },
};
