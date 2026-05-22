import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { GridListCardComponent } from './grid-list-card';

const meta: Meta<GridListCardComponent> = {
  component: GridListCardComponent,
  title: 'Josanz UI / Grid List Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta cuadrada para vistas tipo grid. Soporta densidades, labels opcionales, líneas de preview truncadas y pastillas de estado con los tokens semánticos de Josanz.',
        ),
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'Título principal' },
    status: { control: 'text', description: 'Texto de la pastilla' },
    statusVariant: sbRadio(
      ['borrador', 'en-proceso', 'confirmado', 'cancelado', 'success', 'warning', 'error'] as const,
      'Color semántico',
    ),
    density: sbRadio(['comfortable', 'compact', 'dense'] as const, 'Densidad visual'),
    previewLines: { control: 'object', description: 'Valores a mostrar' },
    fieldLabels: { control: 'object', description: 'Labels por línea' },
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<GridListCardComponent>;

const cardTemplate = `
  <div class="max-w-sm">
    <josanz-grid-list-card
      [title]="title"
      [status]="status"
      [statusVariant]="statusVariant"
      [density]="density"
      [previewLines]="previewLines"
      [fieldLabels]="fieldLabels"
      [shape]="shape"
      [customColor]="customColor"
    ></josanz-grid-list-card>
  </div>
`;

export const Playground: Story = {
  args: {
    title: 'NovaByte S.L.',
    status: 'Activo',
    statusVariant: 'confirmado',
    density: 'comfortable',
    shape: 'rounded',
    customColor: '',
    fieldLabels: ['CIF', 'Contacto', 'Facturación'],
    previewLines: ['B-12345678', 'ana@novabyte.es', '12.450 EUR'],
  },
  render: (args) => ({ props: args, template: cardTemplate }),
};

export const DensityMatrix: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Comparación de densidades comfortable, compact y dense en la misma cuadrícula.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl grid-cols-1 gap-5 rounded-3xl p-6 sm:grid-cols-3" style="background: var(--josanz-bg);">
        <josanz-grid-list-card title="Comfortable" status="Activo" statusVariant="confirmado" density="comfortable" [fieldLabels]="['Cliente', 'Email', 'Total']" [previewLines]="['NovaByte', 'contacto@novabyte.es', '12.450 EUR']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Compact" status="Pendiente" statusVariant="en-proceso" density="compact" [fieldLabels]="['Evento', 'Fecha']" [previewLines]="['Gala primavera', '24/05/2026']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Dense" status="Baja" statusVariant="cancelado" density="dense" [fieldLabels]="['Stock', 'Ubicación']" [previewLines]="['12 uds.', 'Almacén norte']"></josanz-grid-list-card>
      </div>
    `,
  }),
};

export const SemanticStatuses: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4" style="background: var(--josanz-bg);">
        <josanz-grid-list-card title="OK" status="OK" statusVariant="success" density="compact" [previewLines]="['Sin incidencias']" [fieldLabels]="['Estado']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Alerta" status="Riesgo" statusVariant="warning" density="compact" [previewLines]="['Stock bajo']" [fieldLabels]="['Inventario']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Error" status="Fallo" statusVariant="error" density="compact" [previewLines]="['Sync fallida']" [fieldLabels]="['Integración']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Borrador" status="Draft" statusVariant="borrador" density="compact" [previewLines]="['Sin publicar']" [fieldLabels]="['Workflow']"></josanz-grid-list-card>
      </div>
    `,
  }),
};
