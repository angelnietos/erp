import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { TooltipComponent } from './tooltip';

const meta: Meta<TooltipComponent> = {
  component: TooltipComponent,
  title: 'Josanz UI / Tooltip',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Ayuda contextual al pasar el cursor o al enfocar un control.'),
      },
    },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<TooltipComponent>;

export const Playground: Story = {
  args: {
    text: 'Código visible solo para el equipo de taller.',
  },
  render: (args) => ({
    props: args,
    template: `
      <josanz-tooltip [text]="text">
        <button type="button" class="rounded-full border border-solid px-4 py-2 text-sm font-black" style="border-color: var(--josanz-border); color: var(--josanz-text);">
          Referencia interna
        </button>
      </josanz-tooltip>
    `,
  }),
};
