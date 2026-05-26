import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { StepperComponent } from './stepper';

const meta: Meta<StepperComponent> = {
  component: StepperComponent,
  title: 'Josanz UI / Stepper',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Stepper genérico para wizard, onboarding, checkout, publicación de documentos o estados de proceso.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    activeId: { control: 'text', description: 'Paso activo' },
    orientation: sbRadio(['horizontal', 'vertical'] as const, 'Orientación'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de paso actual' },
    activeIdChange: sbEmit('activeIdChange', 'Cambio de paso activo'),
    stepSelect: sbEmit('stepSelect', 'Paso seleccionado'),
  },
};

export default meta;
type Story = StoryObj<StepperComponent>;

const steps = [
  { id: 'draft', label: 'Borrador', description: 'Datos principales' },
  { id: 'review', label: 'Revisión', description: 'Documentos y permisos' },
  { id: 'publish', label: 'Publicar', description: 'Enviar a producción' },
  { id: 'done', label: 'Finalizado', description: 'Histórico cerrado' },
];

export const Playground: Story = {
  args: {
    items: steps,
    activeId: 'review',
    orientation: 'horizontal',
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const ProcessStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      items: [
        {
          id: 'client',
          label: 'Cliente',
          description: 'Confirmado',
          status: 'complete',
        },
        {
          id: 'docs',
          label: 'Documentación',
          description: 'Falta contrato',
          status: 'error',
        },
        {
          id: 'team',
          label: 'Equipo',
          description: 'Asignación pendiente',
          status: 'current',
        },
        {
          id: 'invoice',
          label: 'Facturación',
          description: 'Bloqueado',
          status: 'pending',
          disabled: true,
        },
      ],
    },
    template: `
      <div class="max-w-4xl rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-stepper [items]="items" activeId="team"></josanz-stepper>
      </div>
    `,
  }),
};

export const VerticalWizard: Story = {
  args: {
    items: steps,
    activeId: 'publish',
    orientation: 'vertical',
    shape: 'pill',
  },
};

export const InteractiveSelection: Story = {
  args: {
    items: steps,
    activeId: 'draft',
    activeIdChange: fn(),
    stepSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /revisión/i }));
    await expect(args.activeIdChange).toHaveBeenCalledWith('review');
    await expect(args.stepSelect).toHaveBeenCalledTimes(1);
  },
};
