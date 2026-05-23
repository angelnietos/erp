import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fireEvent, fn, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { SliderComponent } from './slider';

const meta: Meta<SliderComponent> = {
  component: SliderComponent,
  title: 'Josanz UI / Slider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Control deslizante para rangos numericos, porcentajes o prioridad.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    suffix: { control: 'text' },
    hint: { control: 'text' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
    customColor: { control: 'color' },
    valueChange: sbEmit('valueChange', 'Cambio de valor'),
  },
};

export default meta;
type Story = StoryObj<SliderComponent>;

export const Playground: Story = {
  args: {
    label: 'Prioridad',
    min: 0,
    max: 100,
    step: 5,
    value: 65,
    suffix: '%',
    hint: 'Ajusta la prioridad visual de la orden',
    valueChange: fn(),
  },
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-2xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-slider label="Progreso" [value]="45" suffix="%"></josanz-slider>
        <josanz-slider label="Riesgo" [value]="80" customColor="var(--josanz-danger)" suffix="%"></josanz-slider>
        <josanz-slider label="Deshabilitado" [value]="30" [disabled]="true"></josanz-slider>
      </div>
    `,
  }),
};

export const InteractiveChange: Story = {
  args: {
    label: 'Cobertura',
    min: 0,
    max: 100,
    value: 25,
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await fireEvent.input(slider, { target: { value: '75' } });
    await expect(args.valueChange).toHaveBeenCalledWith(75);
    await expect(canvas.getByText('75')).toBeInTheDocument();
  },
};
