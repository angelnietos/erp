import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { GridListCardComponent } from './grid-list-card';

const meta: Meta<GridListCardComponent> = {
  component: GridListCardComponent,
  title: 'Josanz UI / Grid List Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tarjeta cuadrada para vistas tipo grid. Soporta densidades, labels opcionales, lineas de preview truncadas y pastillas de estado con los tokens semanticos de Josanz.',
        ),
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'Titulo principal' },
    status: { control: 'text', description: 'Texto de la pastilla' },
    statusVariant: sbRadio(['borrador', 'en-proceso', 'confirmado', 'cancelado', 'success', 'warning', 'error'] as const, 'Color semantico'),
    density: sbRadio(['comfortable', 'compact', 'dense'] as const, 'Densidad visual'),
    previewLines: { control: 'object', description: 'Valores a mostrar' },
    fieldLabels: { control: 'object', description: 'Labels por linea' },
  },
};

export default meta;
type Story = StoryObj<GridListCardComponent>;

export const Playground: Story = {
  args: {
    title: 'NovaByte S.L.',
    status: 'Activo',
    statusVariant: 'confirmado',
    density: 'comfortable',
    fieldLabels: ['CIF', 'Contacto', 'Facturacion'],
    previewLines: ['B-12345678', 'ana@novabyte.es', '12.450 EUR'],
  },
};

export const DensityMatrix: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
        <josanz-grid-list-card title="Comfortable" status="Activo" statusVariant="confirmado" density="comfortable" [fieldLabels]="['Cliente', 'Email', 'Total']" [previewLines]="['NovaByte', 'contacto@novabyte.es', '12.450 EUR']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Compact" status="Pendiente" statusVariant="en-proceso" density="compact" [fieldLabels]="['Evento', 'Fecha']" [previewLines]="['Gala primavera', '24/05/2026']"></josanz-grid-list-card>
        <josanz-grid-list-card title="Dense" status="Baja" statusVariant="cancelado" density="dense" [fieldLabels]="['Stock', 'Ubicacion']" [previewLines]="['12 uds.', 'Almacen norte']"></josanz-grid-list-card>
      </div>
    `,
  }),
};
