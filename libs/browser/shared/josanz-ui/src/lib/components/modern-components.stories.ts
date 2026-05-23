import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  josanzStoryThemeDescription,
  sbRadio,
} from '../../../.storybook/story-arg-types';
import { ToastComponent, type JosanzToastPosition } from './toast';
import { FloatingActionButtonComponent } from './floating-action-button';
import { CommandPaletteComponent } from './command-palette';
import { NotificationsPanelComponent } from './notifications-panel';

const meta: Meta = {
  title: 'Josanz UI / Modern Components',
  decorators: [
    moduleMetadata({
      imports: [
        ToastComponent,
        FloatingActionButtonComponent,
        CommandPaletteComponent,
        NotificationsPanelComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Componentes modernos comunes: toast/snackbar, FAB, command palette y panel de notificaciones.',
        ),
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const commands = [
  {
    id: 'new-client',
    group: 'Clientes',
    label: 'Nuevo cliente',
    description: 'Crear ficha comercial',
    shortcut: 'N C',
  },
  {
    id: 'new-event',
    group: 'Eventos',
    label: 'Nuevo evento',
    description: 'Abrir wizard de producción',
    shortcut: 'N E',
  },
  {
    id: 'invoice',
    group: 'Facturación',
    label: 'Nueva factura',
    description: 'Crear factura desde presupuesto',
    shortcut: 'N F',
  },
];

const notifications = [
  {
    id: '1',
    title: 'Permiso pendiente',
    description: 'Gala Primavera necesita autorización municipal.',
    time: '2 min',
    unread: true,
    tone: 'warning',
  },
  {
    id: '2',
    title: 'Contrato firmado',
    description: 'NovaByte ha completado la firma digital.',
    time: '15 min',
    unread: true,
    tone: 'success',
  },
  {
    id: '3',
    title: 'Deploy completado',
    description: 'Storybook publicado correctamente en Railway.',
    time: '1 h',
    unread: false,
    tone: 'info',
  },
];

export const ModernSuite: Story = {
  args: {
    position: 'top-right',
    fabClick: fn(),
    toastDismiss: fn(),
    commandSelect: fn(),
    markAllRead: fn(),
    notificationClick: fn(),
  },
  argTypes: {
    position: sbRadio(
      [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
      ] as readonly JosanzToastPosition[],
      'Toast position',
    ),
  },
  render: (args) => ({
    props: {
      ...args,
      commands,
      notifications,
      toasts: [
        {
          id: 'ok',
          title: 'Guardado',
          description: 'Los cambios se han sincronizado.',
          tone: 'success',
        },
        {
          id: 'warn',
          title: 'Revisión pendiente',
          description: 'Faltan permisos antes de publicar.',
          tone: 'warning',
        },
      ],
    },
    template: `
      <section class="min-h-[720px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
          <div class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Command palette</p>
            <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Acciones rápidas</h1>
            <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">La paleta se muestra abierta para documentar composición y estados.</p>
            <div class="mt-6">
              <josanz-floating-action-button label="Nuevo evento" icon="+" customColor="#635BFF" (fabClick)="fabClick()"></josanz-floating-action-button>
            </div>
          </div>
          <josanz-notifications-panel [items]="notifications" (markAllRead)="markAllRead()" (notificationClick)="notificationClick($event)"></josanz-notifications-panel>
        </div>
        <josanz-command-palette [open]="true" [commands]="commands" (commandSelect)="commandSelect($event)"></josanz-command-palette>
        <josanz-toast [toasts]="toasts" [position]="position" (toastDismiss)="toastDismiss($event)"></josanz-toast>
      </section>
    `,
  }),
};

export const InteractiveFabAndToast: Story = {
  args: {
    fabClick: fn(),
    toastDismiss: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      toasts: [
        {
          id: 'deploy',
          title: 'Deploy listo',
          description: 'Railway publicó el servicio.',
          tone: 'success',
        },
      ],
    },
    template: `
      <div class="min-h-[420px] p-8" style="background: var(--josanz-bg);">
        <josanz-floating-action-button ariaLabel="Crear" (fabClick)="fabClick()"></josanz-floating-action-button>
        <josanz-toast [toasts]="toasts" (toastDismiss)="toastDismiss($event)"></josanz-toast>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /crear/i }));
    await userEvent.click(
      canvas.getByRole('button', { name: /cerrar notificación/i }),
    );
    await expect(args['fabClick']).toHaveBeenCalledTimes(1);
    await expect(args['toastDismiss']).toHaveBeenCalledWith('deploy');
  },
};
