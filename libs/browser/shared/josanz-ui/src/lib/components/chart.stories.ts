import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { ChartComponent, type JosanzChartDatum } from './chart';

const readOnlyOutputNote = String(sbEmit('chartReadOnly', 'Componente presentacional sin @Output.').description);

const meta: Meta<ChartComponent> = {
  component: ChartComponent,
  title: 'Josanz UI / Data / Chart',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          `Gráfica compacta para dashboards: barras horizontales comparativas o donut con gradiente CSS. ${readOnlyOutputNote} Usa tokens de tema por defecto y permite \`customColor\` para barras cuando el dato no define color.`,
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Título visible de la gráfica' },
    description: { control: 'text', description: 'Texto auxiliar del indicador' },
    data: { control: 'object', description: 'Serie de datos label/value/color' },
    variant: sbRadio(['bar', 'donut'] as const, 'Tipo visual de gráfica'),
    customColor: { control: 'color', description: 'Color local para barras sin color propio' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
  },
};

export default meta;
type Story = StoryObj<ChartComponent>;

const revenueData: JosanzChartDatum[] = [
  { label: 'Mecánica', value: 42 },
  { label: 'Carrocería', value: 28 },
  { label: 'Neumáticos', value: 16 },
  { label: 'Garantías', value: 9 },
];

const channelData: JosanzChartDatum[] = [
  { label: 'Web', value: 38, color: 'var(--josanz-primary)' },
  { label: 'Recepción', value: 30, color: 'var(--josanz-success)' },
  { label: 'Teléfono', value: 22, color: 'var(--josanz-warning)' },
  { label: 'Partners', value: 10, color: 'var(--josanz-danger)' },
];

export const Playground: Story = {
  args: {
    title: 'Ingresos por área',
    description: 'Comparativa del mes en miles de euros.',
    data: revenueData,
    variant: 'bar',
    customColor: '#0ea5e9',
    ariaLabel: 'Gráfica de ingresos por área',
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados de visualización: barras con color local, barras por dato, donut y serie vacía controlada.',
      },
    },
  },
  render: () => ({
    props: {
      revenueData,
      channelData,
      coloredBars: [
        { label: 'Alta', value: 64, color: 'var(--josanz-success)' },
        { label: 'Media', value: 34, color: 'var(--josanz-warning)' },
        { label: 'Baja', value: 12, color: 'var(--josanz-danger)' },
      ] satisfies JosanzChartDatum[],
    },
    template: `
      <div class="grid w-[min(1040px,calc(100vw-2rem))] gap-6 lg:grid-cols-2">
        <josanz-chart
          title="Barras con marca"
          description="Usa customColor cuando los datos no traen color."
          [data]="revenueData"
          variant="bar"
          customColor="#8b5cf6"
        ></josanz-chart>

        <josanz-chart
          title="Barras por dato"
          description="Cada punto controla su color."
          [data]="coloredBars"
          variant="bar"
        ></josanz-chart>

        <josanz-chart
          title="Donut"
          description="Distribución por canal."
          [data]="channelData"
          variant="donut"
        ></josanz-chart>

        <josanz-chart
          title="Sin datos"
          description="Estructura reservada para estados de carga externos."
          [data]="[]"
          variant="bar"
        ></josanz-chart>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos de dashboard: rendimiento comercial, origen de órdenes y carga de trabajo.',
      },
    },
  },
  render: () => ({
    props: {
      revenueData,
      channelData,
      workloadData: [
        { label: 'Ana', value: 18 },
        { label: 'Luis', value: 14 },
        { label: 'Sara', value: 11 },
        { label: 'Mario', value: 7 },
      ] satisfies JosanzChartDatum[],
    },
    template: `
      <div class="grid w-[min(1100px,calc(100vw-2rem))] gap-6 lg:grid-cols-[1fr_1fr_1fr]">
        <josanz-chart
          title="Ventas"
          description="Ingresos por área"
          [data]="revenueData"
          variant="bar"
          customColor="#0ea5e9"
        ></josanz-chart>

        <josanz-chart
          title="Origen"
          description="Canales de entrada"
          [data]="channelData"
          variant="donut"
        ></josanz-chart>

        <josanz-chart
          title="Carga"
          description="Ordenes por asesor"
          [data]="workloadData"
          variant="bar"
          customColor="#10b981"
        ></josanz-chart>
      </div>
    `,
  }),
};
