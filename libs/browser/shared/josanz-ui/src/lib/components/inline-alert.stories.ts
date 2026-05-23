import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { InlineAlertComponent, type JosanzInlineAlertTone } from './inline-alert';

const meta: Meta<InlineAlertComponent> = {
  component: InlineAlertComponent,
  title: 'Josanz UI / Inline Alert',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Aviso compacto en pagina para estados operativos sin bloquear el flujo.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    tone: sbRadio(['info', 'success', 'warning', 'danger'] as readonly JosanzInlineAlertTone[], 'Tono'),
    dismissible: { control: 'boolean' },
    dismiss: sbEmit('dismiss', 'Cerrar aviso'),
  },
};

export default meta;
type Story = StoryObj<InlineAlertComponent>;

export const Playground: Story = {
  args: {
    title: 'Sincronizacion pendiente',
    message: 'Los cambios locales se subiran cuando vuelva la conexion.',
    tone: 'warning',
    dismissible: true,
    dismiss: fn(),
  },
};

export const StatesAndTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-3xl gap-4">
        <josanz-inline-alert title="Informacion" message="El presupuesto se ha guardado como borrador." tone="info"></josanz-inline-alert>
        <josanz-inline-alert title="Completado" message="La orden se marco como entregada." tone="success"></josanz-inline-alert>
        <josanz-inline-alert title="Atencion" message="Faltan documentos antes de facturar." tone="warning" [dismissible]="true"></josanz-inline-alert>
        <josanz-inline-alert title="Error" message="No se pudo sincronizar con el servidor." tone="danger" [dismissible]="true"></josanz-inline-alert>
      </div>
    `,
  }),
};

export const InteractiveDismiss: Story = {
  args: {
    title: 'Aviso descartable',
    message: 'Pulsa cerrar para emitir dismiss.',
    tone: 'info',
    dismissible: true,
    dismiss: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /cerrar aviso|×|quitar/i }));
    await expect(args.dismiss).toHaveBeenCalledTimes(1);
  },
};
