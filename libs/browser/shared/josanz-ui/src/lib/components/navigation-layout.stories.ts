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
  { id: 'dashboard', label: 'Dashboard', href: '#', active: true },
  { id: 'clients', label: 'Clientes', href: '#' },
  { id: 'events', label: 'Eventos', href: '#' },
  { id: 'billing', label: 'Facturación', href: '#' },
];

const menuItems = [
  { id: 'edit', label: 'Editar', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicar', shortcut: 'D' },
  { id: 'archive', label: 'Archivar', dividerBefore: true },
  { id: 'delete', label: 'Eliminar', tone: 'danger' as const },
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
          <josanz-navbar brand="Josanz ERP" subtitle="UI kit" [items]="navItems" customColor="#635BFF" (itemClick)="itemClick($event)">
            <josanz-context-menu [items]="menuItems" (itemSelect)="itemSelect($event)"></josanz-context-menu>
          </josanz-navbar>
          <josanz-grid [columns]="3" gap="1rem">
            <josanz-stat-card title="Clientes" value="128" caption="Activos" icon="users" tone="success"></josanz-stat-card>
            <josanz-stat-card title="Eventos" value="12" caption="Esta semana" icon="calendar" customColor="#635BFF"></josanz-stat-card>
            <josanz-stat-card title="Facturas" value="8" caption="Pendientes" icon="invoice" tone="warning"></josanz-stat-card>
          </josanz-grid>
          <josanz-spacer height="1.5rem"></josanz-spacer>
          <josanz-button label="Acción principal" customColor="#635BFF"></josanz-button>
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
