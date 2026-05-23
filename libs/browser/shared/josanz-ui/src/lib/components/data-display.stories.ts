import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { AccordionComponent } from './accordion';
import { TimelineComponent } from './timeline';
import { DataTableComponent } from './data-table';
import { SliderComponent } from './slider';

const meta: Meta = {
  title: 'Josanz UI / Data Display',
  decorators: [
    moduleMetadata({
      imports: [
        AccordionComponent,
        TimelineComponent,
        DataTableComponent,
        SliderComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Componentes de visualización: tabla, accordion, timeline y slider para filtros o ajustes de datos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    columns: { control: 'object', description: 'Columnas de la tabla: key, label, sort y alineación.' },
    rows: { control: 'object', description: 'Filas de datos del listado.' },
    accordionItems: { control: 'object', description: 'Secciones plegables del expediente.' },
    timelineItems: { control: 'object', description: 'Eventos cronológicos del seguimiento.' },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 }, description: 'Valor usado por el slider.' },
    rowClick: sbEmit('rowClick', 'Fila de tabla seleccionada'),
    valueChange: sbEmit('valueChange', 'Valor del slider actualizado'),
  },
};

export default meta;
type Story = StoryObj;

const columns = [
  { key: 'client', label: 'Cliente', sortable: true },
  { key: 'status', label: 'Estado' },
  { key: 'total', label: 'Total', align: 'right' as const, sortable: true },
];

const rows = [
  { id: '1', client: 'ORD-1042 · BMW X1', status: 'En diagnóstico', total: '842,50 EUR' },
  { id: '2', client: 'ORD-1038 · VW Golf', status: 'Esperando pieza', total: '312,00 EUR' },
  {
    id: '3',
    client: 'ORD-1024 · Seat León',
    status: 'Lista para entrega',
    total: '1.019,43 EUR',
  },
];

export const DataDisplaySuite: Story = {
  args: {
    rowClick: fn(),
    valueChange: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      columns,
      rows,
      accordionItems: [
        {
          id: 'docs',
          eyebrow: 'Checklist',
          title: 'Documentación',
          content:
            'Fotos de recepción, informe de diagnóstico y presupuesto firmado por el cliente.',
        },
        {
          id: 'team',
          eyebrow: 'Taller',
          title: 'Trabajos y piezas',
          content:
            'Pastillas delanteras sustituidas. Discos revisados. Líquido de frenos OK.',
        },
        {
          id: 'billing',
          eyebrow: 'Finanzas',
          title: 'Facturación',
          content:
            'Presupuesto aprobado. Anticipo del 40% cobrado. Factura pendiente de emisión.',
        },
      ],
      timelineItems: [
        {
          id: 'entry',
          title: 'Vehículo recepcionado',
          timestamp: '08:32',
          description: 'BMW X1 · matrícula 4821 KLM. Kilometraje y daños registrados.',
          tone: 'success',
        },
        {
          id: 'review',
          title: 'Diagnóstico completado',
          timestamp: '10:15',
          description: 'Desgaste en pastillas y fuga menor en pastilla trasera.',
          tone: 'primary',
        },
        {
          id: 'approval',
          title: 'Presupuesto enviado',
          timestamp: '11:05',
          description: 'Cliente debe autorizar antes de continuar con el montaje.',
          tone: 'warning',
        },
      ],
    },
    template: `
      <section class="grid max-w-6xl gap-6">
        <josanz-data-table title="Órdenes de taller" description="Listado operativo con cliente/vehículo, estado y importe estimado." [columns]="columns" [rows]="rows" (rowClick)="rowClick($event)"></josanz-data-table>
        <div class="grid gap-6 lg:grid-cols-2">
          <josanz-accordion title="Expediente ORD-1042" [items]="accordionItems" [openIds]="['docs']" customColor="#635BFF"></josanz-accordion>
          <josanz-timeline title="Histórico de la orden" [items]="timelineItems"></josanz-timeline>
        </div>
        <josanz-slider label="Probabilidad de cierre del presupuesto" [value]="72" suffix="%" hint="Scoring comercial para priorizar seguimiento." customColor="#635BFF" (valueChange)="valueChange($event)"></josanz-slider>
      </section>
    `,
  }),
};

export const SelectableDataGrid: Story = {
  args: {
    rowClick: fn(),
    selectedIdsChange: fn(),
  },
  render: (args) => ({
    props: { ...args, columns, rows, selectedIds: ['2'] },
    template: `
      <josanz-data-table
        title="Órdenes de taller"
        description="Tabla con selección múltiple y columnas ordenables."
        [columns]="columns"
        [rows]="rows"
        [selectable]="true"
        [selectedIds]="selectedIds"
        (rowClick)="rowClick($event)"
        (selectedIdsChange)="selectedIdsChange($event)"
      ></josanz-data-table>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    await expect(args['selectedIdsChange']).toHaveBeenCalled();
  },
};

export const InteractiveTableAndSlider: Story = {
  args: {
    rowClick: fn(),
    valueChange: fn(),
  },
  render: (args) => ({
    props: { ...args, columns, rows },
    template: `
      <div class="grid max-w-4xl gap-5">
        <josanz-data-table [columns]="columns" [rows]="rows" (rowClick)="rowClick($event)"></josanz-data-table>
        <josanz-slider label="Margen mínimo" [value]="20" suffix="%" (valueChange)="valueChange($event)"></josanz-slider>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(/NovaByte/i));
    await expect(args['rowClick']).toHaveBeenCalledTimes(1);
  },
};
