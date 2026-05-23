import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { SliderComponent } from './slider';

const meta: Meta<SliderComponent> = {
  component: SliderComponent,
  title: 'Josanz UI / Slider',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Control deslizante para rangos numéricos, porcentajes o prioridad.'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
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
    value: 65,
    valueChange: fn(),
  },
};
