import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { PopoverComponent } from './popover';

const meta: Meta<PopoverComponent> = {
  component: PopoverComponent,
  title: 'Josanz UI / Overlay / Popover',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Popover informativo con trigger interno o contenido proyectado, posiciones cardinales y cierre opcional al hacer click fuera. Emite `openChange` al abrir y cerrar.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    triggerLabel: { control: 'text', description: 'Texto del botón cuando no se proyecta trigger' },
    title: { control: 'text', description: 'Título del panel flotante' },
    description: { control: 'text', description: 'Descripción del panel' },
    open: { control: 'boolean', description: 'Estado abierto controlado' },
    placement: sbRadio(['bottom', 'top', 'left', 'right'] as const, 'Posición del panel respecto al trigger'),
    hasTriggerContent: { control: 'boolean', description: 'Oculta `triggerLabel` cuando hay trigger proyectado' },
    closeOnOutsideClick: { control: 'boolean', description: 'Cierra al hacer click fuera del host' },
    openChange: sbEmit('openChange', 'Cambio de estado abierto/cerrado'),
  },
};

export default meta;
type Story = StoryObj<PopoverComponent>;

export const Playground: Story = {
  args: {
    triggerLabel: 'Ver SLA',
    title: 'SLA de taller',
    description: 'Las órdenes urgentes deben cerrarse en menos de 24 horas laborables.',
    open: true,
    placement: 'bottom',
    hasTriggerContent: false,
    closeOnOutsideClick: true,
    openChange: fn(),
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Variantes de posición, contenido proyectado y estado cerrado inicial.',
      },
    },
  },
  render: () => ({
    props: {
      openChange: fn(),
    },
    template: `
      <div class="grid min-h-[420px] w-[min(900px,calc(100vw-2rem))] place-items-center gap-8 p-16">
        <div class="grid grid-cols-2 gap-8">
          <josanz-popover
            triggerLabel="Bottom"
            title="Debajo"
            description="Panel abierto bajo el trigger."
            placement="bottom"
            [open]="true"
            (openChange)="openChange($event)"
          ></josanz-popover>

          <josanz-popover
            triggerLabel="Right"
            title="Derecha"
            description="Útil dentro de barras laterales."
            placement="right"
            [open]="true"
            (openChange)="openChange($event)"
          ></josanz-popover>

          <josanz-popover
            triggerLabel="Top"
            title="Arriba"
            description="Evita cortar contenido en footers."
            placement="top"
            [open]="true"
            (openChange)="openChange($event)"
          ></josanz-popover>

          <josanz-popover
            triggerLabel="Cerrado"
            title="Se abre bajo demanda"
            description="Estado inicial cerrado para formularios."
            [open]="false"
            (openChange)="openChange($event)"
          ></josanz-popover>
        </div>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos de producto: ayuda contextual, resumen de métrica y acciones secundarias embebidas.',
      },
    },
  },
  render: () => ({
    props: {
      openChange: fn(),
    },
    template: `
      <div class="flex flex-wrap items-start gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-popover
          triggerLabel="Ayuda"
          title="Importe estimado"
          description="Incluye mano de obra y piezas; no incluye descuentos pendientes de aprobación."
          [open]="true"
          (openChange)="openChange($event)"
        ></josanz-popover>

        <josanz-popover
          title="Margen del mes"
          description="+8,4% frente al mes anterior."
          [open]="true"
          [hasTriggerContent]="true"
          (openChange)="openChange($event)"
        >
          <span popover-trigger>Indicador</span>
          <div class="text-sm font-bold" style="color: var(--josanz-success);">Tendencia positiva</div>
        </josanz-popover>

        <josanz-popover
          triggerLabel="Nota interna"
          title="Privado"
          description="Visible solo para asesores con permisos de taller."
          placement="right"
          [open]="true"
          [closeOnOutsideClick]="false"
          (openChange)="openChange($event)"
        ></josanz-popover>
      </div>
    `,
  }),
};

export const InteractiveOpen: Story = {
  args: {
    triggerLabel: 'Abrir popover',
    title: 'Detalle rápido',
    description: 'Resumen SLA, importe pendiente y responsable de la orden.',
    open: false,
    placement: 'bottom',
    closeOnOutsideClick: true,
    openChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /abrir popover/i }));
    await expect(args.openChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

