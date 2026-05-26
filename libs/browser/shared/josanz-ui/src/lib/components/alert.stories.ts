import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AlertComponent, type JosanzAlertTone } from './alert';

const meta: Meta<AlertComponent> = {
  component: AlertComponent,
  title: 'Josanz UI / Alert',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Alert/banner genérico para feedback de sistema: info, éxito, warning, error y neutral. Admite acción y cierre.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    tone: sbRadio(['info', 'success', 'warning', 'danger', 'neutral'] as readonly JosanzAlertTone[], 'Tono'),
    title: { control: 'text', description: 'Título del aviso' },
    description: { control: 'text', description: 'Descripción' },
    actionLabel: { control: 'text', description: 'CTA opcional' },
    dismissible: { control: 'boolean', description: 'Muestra cerrar' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    action: sbEmit('action', 'Click CTA'),
    dismiss: sbEmit('dismiss', 'Cerrar alerta'),
  },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Playground: Story = {
  args: {
    tone: 'info',
    title: 'Cambios guardados como borrador',
    description: 'Puedes continuar editando o publicar cuando completes la revisión.',
    actionLabel: 'Ver borrador',
    dismissible: true,
    shape: 'rounded',
  },
};

export const ToneMatrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-4" style="background: var(--josanz-bg);">
        <josanz-alert tone="info" title="Información" description="El presupuesto se ha guardado como borrador." actionLabel="Ver"></josanz-alert>
        <josanz-alert tone="success" title="Sincronización completada" description="Todos los documentos están actualizados." [dismissible]="true"></josanz-alert>
        <josanz-alert tone="warning" title="Revisión pendiente" description="Faltan permisos del ayuntamiento para cerrar el evento." actionLabel="Completar"></josanz-alert>
        <josanz-alert tone="danger" title="Error de despliegue" description="No se pudo publicar el servicio. Revisa los secretos de Railway." actionLabel="Reintentar" [dismissible]="true"></josanz-alert>
      </div>
    `,
  }),
};

export const InteractiveActions: Story = {
  args: {
    tone: 'warning',
    title: 'Revisión pendiente',
    description: 'Falta completar la documentación antes de publicar.',
    actionLabel: 'Completar',
    dismissible: true,
    action: fn(),
    dismiss: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /completar/i }));
    await userEvent.click(canvas.getByRole('button', { name: /cerrar alerta/i }));
    await expect(args.action).toHaveBeenCalledTimes(1);
    await expect(args.dismiss).toHaveBeenCalledTimes(1);
  },
};
