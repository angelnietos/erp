import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from './button';
import { FormFieldComponent } from './form-field';
import { InputComponent } from './input';
import { ValidationMessageComponent, type JosanzValidationTone } from './validation-message';

const meta: Meta<ValidationMessageComponent> = {
  component: ValidationMessageComponent,
  title: 'Josanz UI / Validation Message',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        ValidationMessageComponent,
        FormFieldComponent,
        InputComponent,
        ButtonComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Mensajes de validación y feedback semántico bajo campos de formulario.'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    tone: sbRadio(['error', 'warning', 'success', 'info'] as const, 'Tono semántico'),
  },
};

export default meta;
type Story = StoryObj<ValidationMessageComponent>;

export const Playground: Story = {
  args: {
    message: 'El NIF no es válido para este país.',
    tone: 'error' as JosanzValidationTone,
  },
};

export const AllTones: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-md gap-3 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-validation-message tone="error" message="Campo obligatorio."></josanz-validation-message>
        <josanz-validation-message tone="warning" message="Revisa el permiso municipal."></josanz-validation-message>
        <josanz-validation-message tone="success" message="Datos guardados correctamente."></josanz-validation-message>
        <josanz-validation-message tone="info" message="Se enviará un recordatorio automático."></josanz-validation-message>
      </div>
    `,
  }),
};

export const InFormContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Mensaje aplicado dentro de un formulario real de cliente: error bloqueante, warning operativo y confirmación tras guardar.',
      },
    },
  },
  render: () => ({
    props: {
      submitted: false,
      submit(): void {
        this['submitted'] = true;
      },
    },
    template: `
      <form class="grid max-w-xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Alta cliente</p>
          <h2 class="m-0 mt-1 text-xl font-black" style="color: var(--josanz-text);">Datos fiscales</h2>
        </div>
        <josanz-form-field label="NIF/CIF" required error="El NIF es obligatorio para emitir factura.">
          <josanz-input placeholder="B-12345678"></josanz-input>
        </josanz-form-field>
        <josanz-validation-message tone="warning" message="La dirección fiscal no coincide con la delegación seleccionada."></josanz-validation-message>
        @if (submitted) {
          <josanz-validation-message tone="success" message="Revisión enviada al equipo de administración."></josanz-validation-message>
        }
        <josanz-button label="Solicitar revisión" [showIcon]="false" (btnClick)="submit()"></josanz-button>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(/NIF es obligatorio/i);
    await userEvent.click(canvas.getByRole('button', { name: /Solicitar revisión/i }));
    await expect(canvas.getByText(/Revisión enviada/i)).toBeVisible();
  },
};
