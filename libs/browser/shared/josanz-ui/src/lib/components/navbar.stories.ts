import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ContextMenuComponent } from './context-menu';
import { NavbarComponent } from './navbar';
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
          'Barra superior de aplicación con marca, navegación y zona de acciones proyectable.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<NavbarComponent>;

const navItems = [
  { id: 'dashboard', label: 'Panel', href: '#', active: true },
  { id: 'orders', label: 'Órdenes', href: '#' },
  { id: 'clients', label: 'Clientes', href: '#' },
];

const notifications = [
  {
    id: '1',
    title: 'Orden #1042 asignada',
    description: 'Revisión de frenos · Ana Muñoz',
    time: 'Hace 5 min',
    unread: true,
    category: 'Taller',
  },
];

export const Playground: Story = {
  args: {
    brand: 'Josanz ERP',
    subtitle: 'Taller principal',
    items: navItems,
    customColor: '#635BFF',
  },
  render: (args) => ({
    props: { ...args, notifications, menuItems: [{ id: 'profile', label: 'Perfil' }] },
    template: `
      <div style="background: var(--josanz-bg); min-height: 320px;">
        <josanz-navbar [brand]="brand" [subtitle]="subtitle" [items]="items" [customColor]="customColor">
          <josanz-context-menu buttonText="⋯" [items]="menuItems"></josanz-context-menu>
        </josanz-navbar>
        <div class="p-6 max-w-sm">
          <josanz-notifications-panel title="Avisos" [items]="notifications"></josanz-notifications-panel>
        </div>
      </div>
    `,
  }),
};
