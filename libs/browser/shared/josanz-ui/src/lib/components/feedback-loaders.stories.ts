import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { ProgressBarComponent, type JosanzProgressTone } from './progress-bar';
import { SpinnerComponent, type JosanzSpinnerSize } from './spinner';
import { DividerComponent } from './divider';
import { TooltipComponent } from './tooltip';
import { ButtonComponent } from './button';

const meta: Meta = {
  title: 'Josanz UI / Feedback / Loaders & Helpers',
  decorators: [
    moduleMetadata({
      imports: [
        ProgressBarComponent,
        SpinnerComponent,
        DividerComponent,
        TooltipComponent,
        ButtonComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Feedback de carga y pequeñas primitivas de ayuda: progress bar, spinner, divider y tooltip.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const ProgressPlayground: Story = {
  args: {
    value: 64,
    tone: 'primary',
    striped: false,
    showValue: true,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    tone: sbRadio(
      [
        'primary',
        'success',
        'warning',
        'danger',
        'custom',
      ] as readonly JosanzProgressTone[],
      'Tono',
    ),
    striped: { control: 'boolean' },
    showValue: { control: 'boolean' },
    customColor: { control: 'color' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-xl">
        <josanz-progress-bar label="Subida de documentos" [value]="value" [tone]="tone" [striped]="striped" [showValue]="showValue" [customColor]="customColor"></josanz-progress-bar>
      </div>
    `,
  }),
};

export const LoadingStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <section class="grid max-w-4xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex flex-wrap items-center gap-6">
          <josanz-spinner label="Guardando orden" size="sm"></josanz-spinner>
          <josanz-spinner label="Sincronizando stock" size="md" customColor="#635BFF"></josanz-spinner>
          <josanz-spinner label="Emitiendo factura" size="lg" customColor="var(--josanz-success)"></josanz-spinner>
        </div>
        <josanz-divider label="Cierre de orden"></josanz-divider>
        <div class="grid gap-4">
          <josanz-progress-bar label="Diagnóstico" [value]="100" tone="success"></josanz-progress-bar>
          <josanz-progress-bar label="Presupuesto aprobado" [value]="100" tone="success"></josanz-progress-bar>
          <josanz-progress-bar label="Firma del cliente" [value]="48" tone="warning" [striped]="true"></josanz-progress-bar>
          <josanz-progress-bar label="Factura emitida" [value]="18" tone="danger"></josanz-progress-bar>
        </div>
        <div>
          <josanz-tooltip text="La orden se puede cerrar cuando el cliente firme y la factura esté emitida.">
            <josanz-button label="Cerrar orden" [showIcon]="false"></josanz-button>
          </josanz-tooltip>
        </div>
      </section>
    `,
  }),
};

export const SpinnerPlayground: Story = {
  args: {
    label: 'Cargando datos',
    size: 'md',
    customColor: '#635BFF',
  },
  argTypes: {
    label: { control: 'text' },
    size: sbRadio(['sm', 'md', 'lg'] as readonly JosanzSpinnerSize[], 'Tamaño'),
    customColor: { control: 'color' },
  },
  render: (args) => ({
    props: args,
    template: `<josanz-spinner [label]="label" [size]="size" [customColor]="customColor"></josanz-spinner>`,
  }),
};
