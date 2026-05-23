import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbRadio } from '../../../.storybook/story-arg-types';
import { TooltipComponent } from './tooltip';

const meta: Meta<TooltipComponent> = {
  component: TooltipComponent,
  title: 'Josanz UI / Tooltip',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Ayuda contextual al pasar el cursor o al enfocar un control.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    text: { control: 'text' },
    position: sbRadio(['top', 'right', 'bottom', 'left'] as const, 'Posicion'),
  },
};

export default meta;
type Story = StoryObj<TooltipComponent>;

export const Playground: Story = {
  args: {
    text: 'Codigo visible solo para el equipo de taller.',
    position: 'top',
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-tooltip [text]="text" [position]="position">
        <button type="button" class="rounded-full border border-solid px-4 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">
          Referencia interna
        </button>
      </josanz-tooltip>
    `,
  }),
};

export const Positions: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid grid-cols-2 gap-12 rounded-3xl border border-solid p-12" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-tooltip text="Arriba" position="top"><button class="rounded-full border px-4 py-2">Top</button></josanz-tooltip>
        <josanz-tooltip text="Derecha" position="right"><button class="rounded-full border px-4 py-2">Right</button></josanz-tooltip>
        <josanz-tooltip text="Abajo" position="bottom"><button class="rounded-full border px-4 py-2">Bottom</button></josanz-tooltip>
        <josanz-tooltip text="Izquierda" position="left"><button class="rounded-full border px-4 py-2">Left</button></josanz-tooltip>
      </div>
    `,
  }),
};

export const InteractiveHover: Story = {
  args: {
    text: 'Ayuda contextual',
    position: 'bottom',
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-tooltip [text]="text" [position]="position">
        <button type="button" class="rounded-full border border-solid px-4 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">
          Mostrar ayuda
        </button>
      </josanz-tooltip>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: /mostrar ayuda/i }));
    await expect(canvas.getByRole('tooltip')).toHaveTextContent(/ayuda contextual/i);
  },
};
