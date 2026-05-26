import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  sbEmit,
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { DrawerComponent } from './drawer';
import { ButtonComponent } from './button';
import { BadgeComponent } from './badge';
import { CheckboxComponent } from './checkbox';

const meta: Meta<DrawerComponent> = {
  component: DrawerComponent,
  title: 'Josanz UI / Drawer',
  decorators: [
    moduleMetadata({
      imports: [
        DrawerComponent,
        ButtonComponent,
        BadgeComponent,
        CheckboxComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Panel lateral/bottom sheet para filtros, edición rápida, detalle contextual y acciones de segundo nivel. Incluye focus trap y cierre con Escape.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    eyebrow: { control: 'text' },
    description: { control: 'text' },
    position: sbRadio(['left', 'right', 'bottom'] as const, 'Posición'),
    size: sbRadio(['sm', 'md', 'lg'] as const, 'Tamaño'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Shape'),
    trapFocus: { control: 'boolean' },
    openChange: sbEmit('openChange', 'Cambio open'),
    closed: sbEmit('closed', 'Cerrado'),
  },
};

export default meta;
type Story = StoryObj<DrawerComponent>;

export const Playground: Story = {
  args: {
    open: true,
    title: 'Filtros avanzados',
    eyebrow: 'Clientes',
    description: 'Ajusta estados, origen y responsable.',
    position: 'right',
    size: 'md',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[620px] p-8" style="background: var(--josanz-bg);">
        <josanz-button label="Abrir panel" [showIcon]="false"></josanz-button>
        <josanz-drawer
          [open]="open"
          [title]="title"
          [eyebrow]="eyebrow"
          [description]="description"
          [position]="position"
          [size]="size"
          [shape]="shape"
        >
          <div class="grid gap-4">
            <josanz-badge label="Filtros activos" tone="primary"></josanz-badge>
            <josanz-checkbox label="Solo activos" [checked]="true"></josanz-checkbox>
            <josanz-checkbox label="Con facturas pendientes"></josanz-checkbox>
            <josanz-checkbox label="Eventos próximos"></josanz-checkbox>
          </div>
        </josanz-drawer>
      </div>
    `,
  }),
};

export const InteractiveClose: Story = {
  args: {
    open: true,
    title: 'Detalle rápido',
    openChange: fn(),
    closed: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[420px]">
        <josanz-drawer [open]="open" [title]="title" (openChange)="openChange($event)" (closed)="closed()">
          <p style="color: var(--josanz-text-muted);">Historial, documentos y acciones del registro seleccionado.</p>
        </josanz-drawer>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /cerrar panel/i }),
    );
    await expect(args.openChange).toHaveBeenCalledWith(false);
    await expect(args.closed).toHaveBeenCalledTimes(1);
  },
};

export const FocusTrap: Story = {
  args: {
    open: true,
    title: 'Asignar técnico',
    trapFocus: true,
    openChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-[480px]">
        <josanz-drawer [open]="open" [title]="title" [trapFocus]="trapFocus" (openChange)="openChange($event)">
          <div class="grid gap-3">
            <button type="button" class="rounded-full border border-solid px-4 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">Primer foco</button>
            <button type="button" class="rounded-full border border-solid px-4 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">Segundo botón</button>
            <input type="text" class="h-10 rounded-xl border border-solid px-3 text-sm" style="border-color: var(--josanz-stroke-field); background: var(--josanz-field-fill); color: var(--josanz-text);" placeholder="Notas internas" />
          </div>
        </josanz-drawer>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(args.openChange).toHaveBeenCalledWith(false);
  },
};

