import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbRadio,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { ProgressBarComponent, type JosanzProgressTone } from './progress-bar';

const meta: Meta<ProgressBarComponent> = {
  component: ProgressBarComponent,
  title: 'Josanz UI / Progress Bar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Barra de progreso accesible para tareas, capacidad y estados de avance. Soporta tonos semanticos, shape global y color custom.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta visible' },
    value: { control: 'number', description: 'Valor actual' },
    max: { control: 'number', description: 'Valor maximo' },
    tone: sbRadio(
      ['primary', 'success', 'warning', 'danger', 'custom'] as readonly JosanzProgressTone[],
      'Tono visual',
    ),
    striped: { control: 'boolean', description: 'Usa patron rayado' },
    showValue: { control: 'boolean', description: 'Muestra porcentaje' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Playground: Story = {
  args: {
    label: 'Progreso de reparacion',
    value: 68,
    max: 100,
    tone: 'primary',
    showValue: true,
    striped: false,
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-xl rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-progress-bar
          [label]="label"
          [value]="value"
          [max]="max"
          [tone]="tone"
          [showValue]="showValue"
          [striped]="striped"
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
        ></josanz-progress-bar>
      </div>
    `,
  }),
};

export const StatesAndTones: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="grid max-w-2xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-progress-bar label="Pendiente" [value]="18" tone="primary"></josanz-progress-bar>
        <josanz-progress-bar label="Completado" [value]="100" tone="success"></josanz-progress-bar>
        <josanz-progress-bar label="Riesgo de plazo" [value]="76" tone="warning" [striped]="true"></josanz-progress-bar>
        <josanz-progress-bar label="Bloqueado" [value]="42" tone="danger" [striped]="true"></josanz-progress-bar>
        <josanz-progress-bar label="Marca custom" [value]="58" customColor="#8b5cf6"></josanz-progress-bar>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    label: 'Carga de documentos',
    value: 45,
    max: 90,
    tone: 'success',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole('progressbar', { name: /carga de documentos/i });
    await expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    await expect(progressbar).toHaveAttribute('aria-valuemax', '90');
  },
};
