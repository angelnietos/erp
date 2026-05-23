import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { OtpInputComponent } from './otp-input';

const meta: Meta<OtpInputComponent> = {
  component: OtpInputComponent,
  title: 'Josanz UI / OTP Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Entrada de código OTP con navegación entre casillas y pegado desde portapapeles.'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    valueChange: sbEmit('valueChange', 'Cambio parcial'),
    completed: sbEmit('completed', 'Código completo'),
  },
};

export default meta;
type Story = StoryObj<OtpInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Verificación',
    length: 6,
    valueChange: fn(),
    completed: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    await userEvent.type(inputs[0], '1');
    await userEvent.type(inputs[1], '2');
    await userEvent.type(inputs[2], '3');
    await expect(args['valueChange']).toHaveBeenCalled();
  },
};
