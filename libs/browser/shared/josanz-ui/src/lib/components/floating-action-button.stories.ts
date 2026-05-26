import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { FloatingActionButtonComponent } from './floating-action-button';

const meta: Meta<FloatingActionButtonComponent> = {
  component: FloatingActionButtonComponent,
  title: 'Josanz UI / Floating Action Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Accion flotante para CTA principal en vistas de listado o mobile. Puede ser icon-only o extenderse con etiqueta.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    icon: { control: 'text', description: 'Icono o caracter visual' },
    label: { control: 'text', description: 'Etiqueta opcional' },
    customColor: { control: 'color', description: 'Color de fondo' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible' },
    fabClick: sbEmit('fabClick', 'Click en FAB'),
  },
};

export default meta;
type Story = StoryObj<FloatingActionButtonComponent>;

export const Playground: Story = {
  args: {
    icon: '+',
    label: 'Nuevo cliente',
    customColor: '#635BFF',
    fabClick: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="relative h-64 w-80 rounded-3xl border border-solid p-6" style="background: var(--josanz-bg); border-color: var(--josanz-border);">
        <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">Vista de clientes</p>
        <div class="absolute bottom-6 right-6">
          <josanz-floating-action-button
            [icon]="icon"
            [label]="label"
            [customColor]="customColor"
            [ariaLabel]="ariaLabel"
            (fabClick)="fabClick($event)"
          ></josanz-floating-action-button>
        </div>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-5 rounded-3xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-floating-action-button icon="+" ariaLabel="Crear"></josanz-floating-action-button>
        <josanz-floating-action-button icon="↥" label="Subir parte" customColor="#0f766e"></josanz-floating-action-button>
        <josanz-floating-action-button icon="!" label="Incidencia" customColor="var(--josanz-danger)"></josanz-floating-action-button>
      </div>
    `,
  }),
};

export const InteractiveClick: Story = {
  args: {
    icon: '+',
    label: 'Nueva orden',
    fabClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /nueva orden/i }));
    await expect(args.fabClick).toHaveBeenCalledTimes(1);
  },
};
