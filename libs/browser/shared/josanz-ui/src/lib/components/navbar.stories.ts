import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { ContextMenuComponent } from './context-menu';
import { NavbarComponent, type JosanzNavbarItem } from './navbar';
import { NotificationsPanelComponent } from './notifications-panel';

const meta: Meta<NavbarComponent> = {
  component: NavbarComponent,
  title: 'Josanz UI / Navbar',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [NavbarComponent, ContextMenuComponent, NotificationsPanelComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Barra superior de aplicacion con marca, navegacion y zona de acciones proyectable.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    brand: { control: 'text' },
    subtitle: { control: 'text' },
    logoText: { control: 'text' },
    items: { control: 'object' },
    compact: { control: 'boolean' },
    customColor: { control: 'color' },
    ariaLabel: { control: 'text' },
    brandClick: sbEmit('brandClick', 'Click en marca'),
    itemClick: sbEmit('itemClick', 'Click en item'),
  },
};

export default meta;
type Story = StoryObj<NavbarComponent>;

const navItems: JosanzNavbarItem[] = [
  { id: 'dashboard', label: 'Panel', href: '#', active: true },
  { id: 'orders', label: 'Ordenes', href: '#' },
  { id: 'clients', label: 'Clientes', href: '#' },
  { id: 'billing', label: 'Facturas', href: '#', disabled: true },
];

const notifications = [
  {
    id: '1',
    title: 'Orden #1042 asignada',
    description: 'Revision de frenos - Ana Muñoz',
    time: 'Hace 5 min',
    unread: true,
    category: 'Taller',
  },
];

export const Playground: Story = {
  args: {
    brand: 'Josanz ERP',
    subtitle: 'Taller principal',
    logoText: 'J',
    items: navItems,
    customColor: '#635BFF',
    itemClick: fn(),
    brandClick: fn(),
  },
  render: (args) => ({
    props: { ...args, notifications, menuItems: [{ id: 'profile', label: 'Perfil' }] },
    template: `
      <div style="background: var(--josanz-bg); min-height: 320px;">
        <josanz-navbar
          [brand]="brand"
          [subtitle]="subtitle"
          [logoText]="logoText"
          [items]="items"
          [compact]="compact"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (itemClick)="itemClick($event)"
          (brandClick)="brandClick($event)"
        >
          <josanz-context-menu buttonText="..." [items]="menuItems"></josanz-context-menu>
        </josanz-navbar>
        <div class="max-w-sm p-6">
          <josanz-notifications-panel title="Avisos" [items]="notifications"></josanz-notifications-panel>
        </div>
      </div>
    `,
  }),
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { navItems },
    template: `
      <div class="grid gap-6 p-6" style="background: var(--josanz-bg); min-height: 360px;">
        <josanz-navbar brand="Josanz ERP" subtitle="Desktop" [items]="navItems" customColor="#635BFF"></josanz-navbar>
        <josanz-navbar brand="Taller Norte" subtitle="Compacta" [items]="navItems" [compact]="true" customColor="#0f766e"></josanz-navbar>
      </div>
    `,
  }),
};

export const InteractiveNavigation: Story = {
  args: {
    brand: 'Josanz ERP',
    items: navItems,
    itemClick: fn(),
    brandClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: /clientes/i }));
    await expect(args.itemClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'clients' }));
    await userEvent.click(canvas.getByRole('link', { name: /josanz erp/i }));
    await expect(args.brandClick).toHaveBeenCalledTimes(1);
  },
};
