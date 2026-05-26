import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { DataTableComponent, type JosanzTableColumn, type JosanzTableRow } from './data-table';

const meta: Meta<DataTableComponent> = {
  component: DataTableComponent,
  title: 'Josanz UI / Data / Data Table',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tabla de datos ligera para listados administrativos: cabecera opcional, columnas alineadas, selección múltiple, ordenación local y estado vacío accesible. Emite `rowClick`, `selectedIdsChange` y `sortChange`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título visible del bloque de tabla' },
    description: { control: 'text', description: 'Texto auxiliar bajo el título' },
    columns: { control: 'object', description: 'Definición de columnas y ordenación' },
    rows: { control: 'object', description: 'Registros mostrados en la tabla' },
    emptyLabel: { control: 'text', description: 'Mensaje cuando no hay filas' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    selectable: { control: 'boolean', description: 'Muestra checkboxes de selección' },
    selectedIds: { control: 'object', description: 'IDs seleccionados' },
    rowClick: sbEmit('rowClick', 'Click sobre una fila'),
    selectedIdsChange: sbEmit('selectedIdsChange', 'Cambio de selección'),
    sortChange: sbEmit('sortChange', 'Cambio de columna/dirección de ordenación'),
  },
};

export default meta;
type Story = StoryObj<DataTableComponent>;

const columns: JosanzTableColumn[] = [
  { key: 'order', label: 'Orden', sortable: true },
  { key: 'client', label: 'Cliente', sortable: true },
  { key: 'status', label: 'Estado', align: 'center' },
  { key: 'amount', label: 'Importe', align: 'right', sortable: true },
];

const rows: JosanzTableRow[] = [
  { id: 'ord-1042', order: '#1042', client: 'Ana Munoz', status: 'En curso', amount: '420 EUR' },
  { id: 'ord-1038', order: '#1038', client: 'Luis Romero', status: 'Pendiente', amount: '180 EUR' },
  { id: 'ord-1031', order: '#1031', client: 'Sara Vega', status: 'Cerrada', amount: '960 EUR' },
  { id: 'ord-1024', order: '#1024', client: 'Mario Lopez', status: 'Incidencia', amount: '310 EUR' },
];

export const Playground: Story = {
  args: {
    title: 'Ordenes de taller',
    description: 'Selecciona filas y ordena por columnas configuradas.',
    columns,
    rows,
    emptyLabel: 'No hay ordenes para mostrar.',
    ariaLabel: 'Tabla de ordenes de taller',
    selectable: true,
    selectedIds: ['ord-1038'],
    rowClick: fn(),
    selectedIdsChange: fn(),
    sortChange: fn(),
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados principales: tabla simple, seleccionable con preselección, columnas alineadas y estado vacío.',
      },
    },
  },
  render: () => ({
    props: {
      columns,
      rows,
      compactColumns: columns.slice(0, 3),
      compactRows: rows.slice(0, 2),
      selectedIds: ['ord-1042', 'ord-1038'],
    },
    template: `
      <div class="grid gap-6">
        <josanz-data-table
          title="Simple"
          description="Listado sin checkboxes."
          [columns]="compactColumns"
          [rows]="compactRows"
        ></josanz-data-table>

        <josanz-data-table
          title="Seleccion multiple"
          description="Incluye selección parcial inicial."
          [columns]="columns"
          [rows]="rows"
          [selectable]="true"
          [selectedIds]="selectedIds"
        ></josanz-data-table>

        <josanz-data-table
          title="Sin resultados"
          description="Mensaje vacío dentro del mismo contenedor."
          [columns]="columns"
          [rows]="[]"
          emptyLabel="No se encontraron ordenes con esos filtros."
        ></josanz-data-table>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos de producto para escritorio: pedidos recientes, cartera de cobros y estado de incidencias.',
      },
    },
  },
  render: () => ({
    props: {
      orderColumns: columns,
      orderRows: rows,
      invoiceColumns: [
        { key: 'invoice', label: 'Factura', sortable: true },
        { key: 'client', label: 'Cliente', sortable: true },
        { key: 'due', label: 'Vence' },
        { key: 'total', label: 'Total', align: 'right' as const, sortable: true },
      ],
      invoiceRows: [
        { id: 'fac-221', invoice: 'FAC-221', client: 'Norte Motor', due: 'Hoy', total: '1.280 EUR' },
        { id: 'fac-220', invoice: 'FAC-220', client: 'Auto Sur', due: 'Manana', total: '640 EUR' },
        { id: 'fac-219', invoice: 'FAC-219', client: 'Taller Centro', due: 'Viernes', total: '2.040 EUR' },
      ],
    },
    template: `
      <div class="grid gap-6 xl:grid-cols-2">
        <josanz-data-table
          title="Pedidos recientes"
          description="Ordenacion local y selección de lote."
          [columns]="orderColumns"
          [rows]="orderRows"
          [selectable]="true"
          [selectedIds]="['ord-1038']"
        ></josanz-data-table>

        <josanz-data-table
          title="Cobros pendientes"
          description="Importes alineados a la derecha."
          [columns]="invoiceColumns"
          [rows]="invoiceRows"
          ariaLabel="Tabla de cobros pendientes"
        ></josanz-data-table>
      </div>
    `,
  }),
};

export const InteractiveSelection: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactua con ordenación, selección y fila para verificar los eventos principales.',
      },
    },
  },
  args: {
    title: 'Data table interactiva',
    description: 'Story con play function para eventos.',
    columns,
    rows,
    selectable: true,
    selectedIds: [],
    rowClick: fn(),
    selectedIdsChange: fn(),
    sortChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Cliente'));
    await expect(args.sortChange).toHaveBeenCalledWith({ key: 'client', direction: 'asc' });

    await userEvent.click(canvas.getAllByRole('checkbox')[1]);
    await expect(args.selectedIdsChange).toHaveBeenCalledWith(['ord-1042']);

    await userEvent.click(canvas.getByText('Luis Romero'));
    await expect(args.rowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'ord-1038' }));
  },
};
