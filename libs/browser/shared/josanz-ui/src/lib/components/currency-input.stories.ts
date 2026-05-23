import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { CurrencyInputComponent } from './currency-input';

const meta: Meta<CurrencyInputComponent> = {
  component: CurrencyInputComponent,
  title: 'Josanz UI / Currency Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Importe monetario con sufijo de divisa y formato es-ES.'),
      },
    },
    layout: 'padded',
  },
  argTypes: { valueChange: sbEmit('valueChange', 'Cambio de importe') },
};

export default meta;
type Story = StoryObj<CurrencyInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Presupuesto',
    currency: 'EUR',
    valueChange: fn(),
  },
};
