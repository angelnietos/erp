import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ValidationMessageComponent, type JosanzValidationTone } from './validation-message';

const meta: Meta<ValidationMessageComponent> = {
  component: ValidationMessageComponent,
  title: 'Josanz UI / Validation Message',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ValidationMessageComponent] })],
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
