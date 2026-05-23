import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { NotificationsPanelComponent } from './notifications-panel';

const notifications = [
  {
    id: 'order',
    title: 'Orden #1042 sin asignar',
    description: 'BMW X1 en recepción. El cliente espera presupuesto antes de las 18:00.',
    time: '2 min',
    unread: true,
    tone: 'warning' as const,
    category: 'Taller',
    actionLabel: 'Asignar',
  },
  {
    id: 'permit',
    title: 'Pieza recibida en almacén',
    description: 'Pastillas delanteras ORD-1038 listas para montaje.',
    time: '8 min',
    unread: true,
    tone: 'info' as const,
    category: 'Almacén',
    actionLabel: 'Ver stock',
  },
  {
    id: 'signed',
    title: 'Contrato firmado',
    description: 'NovaByte completó la firma digital del contrato.',
    time: '15 min',
    unread: true,
    tone: 'success' as const,
    category: 'Legal',
    actionLabel: 'Ver contrato',
  },
  {
    id: 'deploy',
    title: 'Deploy completado',
    description: 'Storybook se publicó correctamente en Railway.',
    time: '1 h',
    unread: false,
    tone: 'info' as const,
    category: 'Sistema',
  },
  {
    id: 'invoice',
    title: 'Factura vencida',
    description: 'INV-2026-004 superó la fecha de vencimiento.',
    time: '3 h',
    unread: true,
    tone: 'danger' as const,
    category: 'Facturación',
    actionLabel: 'Revisar',
  },
];

const meta: Meta<NotificationsPanelComponent> = {
  component: NotificationsPanelComponent,
  title: 'Josanz UI / Notifications Panel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel de notificaciones para cabeceras, drawers o centros de actividad. Incluye filtros por categoría, no leídas, acciones y estado vacío.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    activeFilter: { control: 'text' },
    showFilters: { control: 'boolean' },
    markAllRead: sbEmit('markAllRead', 'Marcar todo como leído'),
    notificationClick: sbEmit('notificationClick', 'Notificación seleccionada'),
    activeFilterChange: sbEmit('activeFilterChange', 'Filtro cambiado'),
  },
};

export default meta;
type Story = StoryObj<NotificationsPanelComponent>;

export const Playground: Story = {
  args: {
    title: 'Centro de notificaciones',
    items: notifications,
    activeFilter: 'Todas',
    showFilters: true,
  },
};

export const CompactUnread: Story = {
  args: {
    title: 'Sin leer',
    items: notifications,
    activeFilter: 'No leídas',
    showFilters: true,
  },
};

export const EmptyState: Story = {
  args: {
    title: 'Notificaciones',
    items: notifications,
    activeFilter: 'RRHH',
    showFilters: false,
  },
};

export const WorkshopUseCase: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Centro de actividad del taller: órdenes, almacén, facturación y avisos de sistema.',
      },
    },
  },
  args: {
    title: 'Actividad del taller',
    items: notifications,
    activeFilter: 'Todas',
    showFilters: true,
  },
};

export const InteractiveFilters: Story = {
  args: {
    title: 'Centro de actividad',
    items: notifications,
    activeFilter: 'Todas',
    markAllRead: fn(),
    notificationClick: fn(),
    activeFilterChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /no leídas/i }));
    await userEvent.click(canvas.getByRole('button', { name: /marcar todo/i }));
    await userEvent.click(canvas.getByText(/Contrato firmado/i));
    await expect(args.activeFilterChange).toHaveBeenCalledWith('No leídas');
    await expect(args.markAllRead).toHaveBeenCalledTimes(1);
    await expect(args.notificationClick).toHaveBeenCalledTimes(1);
  },
};
