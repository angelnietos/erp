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
    label: 'Verificación SMS',
    length: 6,
    hint: 'Código enviado al responsable del taller.',
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

export const SmsVerificationUseCase: Story = {
  args: {
    label: 'Confirmar entrega',
    length: 6,
    hint: 'Introduce el código recibido por SMS para cerrar el albarán.',
    valueChange: fn(),
    completed: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="grid max-w-md gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Albarán #ALB-2044</p>
          <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Validación del receptor</h2>
          <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">El código caduca en 4 minutos.</p>
        </div>
        <josanz-otp-input
          [label]="label"
          [length]="length"
          [hint]="hint"
          (valueChange)="valueChange($event)"
          (completed)="completed($event)"
        ></josanz-otp-input>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    for (const [index, value] of ['4', '8', '1', '2', '6', '9'].entries()) {
      await userEvent.type(inputs[index], value);
    }
    await expect(args['completed']).toHaveBeenCalledWith('481269');
  },
};

export const ErrorAndDisabledStates: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 md:grid-cols-2">
        <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-otp-input label="Código incorrecto" [length]="6" error="El código no coincide. Solicita uno nuevo."></josanz-otp-input>
        </section>
        <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-otp-input label="Reenvío bloqueado" [length]="6" hint="Espera 30 segundos antes de solicitar otro código." [disabled]="true"></josanz-otp-input>
        </section>
      </div>
    `,
  }),
};
