import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DataGridComponent } from './data-grid';

const meta: Meta<DataGridComponent> = {
  component: DataGridComponent,
  title: 'Josanz UI / Data Grid',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Cuadrícula avanzada: búsqueda, ordenación, selección, paginación server-side (mock), export CSV y loading.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<DataGridComponent>;

const columns = [
  { key: 'order', label: 'Orden', sortable: true },
  { key: 'client', label: 'Cliente', sortable: true },
  { key: 'status', label: 'Estado' },
  { key: 'total', label: 'Importe', align: 'right' as const, sortable: true },
];

const rows = [
  { id: '1', order: '#1042', client: 'Ana Muñoz', status: 'En curso', total: '420 EUR' },
  { id: '2', order: '#1038', client: 'Luis Romero', status: 'Pendiente', total: '180 EUR' },
  { id: '3', order: '#1031', client: 'Sara Vega', status: 'Cerrada', total: '960 EUR' },
  { id: '4', order: '#1024', client: 'Mario López', status: 'Incidencia', total: '310 EUR' },
];

export const Playground: Story = {
  args: {
    title: 'Órdenes de taller',
    description: 'Filtra, ordena, selecciona y redimensiona columnas.',
    columns,
    rows,
    searchable: true,
    selectable: true,
    resizable: true,
    columnWidths: { order: 120, client: 220, total: 140 },
    selectedIds: ['2'],
    rowClick: fn(),
    selectedIdsChange: fn(),
    sortChange: fn(),
    columnWidthsChange: fn(),
  },
};

export const LoadingState: Story = {
  args: {
    title: 'Sincronizando',
    columns,
    rows: [],
    loading: true,
    searchable: true,
  },
};

const allOrders = Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1),
  order: `#${1000 + index}`,
  client: `Cliente ${index + 1}`,
  status: index % 3 === 0 ? 'Cerrada' : 'En curso',
  total: `${(index + 1) * 120} EUR`,
}));

export const ServerSidePagination: Story = {
  args: {
    title: 'Órdenes (server-side mock)',
    description: 'Página 1 de 24 registros simulados en backend.',
    columns,
    rows: allOrders.slice(0, 10),
    serverSide: true,
    paginated: true,
    totalRows: 24,
    page: 1,
    pageSize: 10,
    exportable: true,
    pageChange: fn(),
    exportCsv: fn(),
  },
  render: (args) => {
    const state = {
      ...args,
      page: args.page ?? 1,
      rows: allOrders.slice(0, args.pageSize ?? 10),
      onPageChange(next: number): void {
        state.page = next;
        const pageSize = state.pageSize ?? 10;
        const start = (next - 1) * pageSize;
        state.rows = allOrders.slice(start, start + pageSize);
        args['pageChange']?.(next);
      },
    };

    return {
      props: state,
      template: `
        <josanz-data-grid
          [title]="title"
          [description]="description"
          [columns]="columns"
          [rows]="rows"
          [serverSide]="serverSide"
          [paginated]="paginated"
          [totalRows]="totalRows"
          [page]="page"
          [pageSize]="pageSize"
          [exportable]="exportable"
          (pageChange)="onPageChange($event)"
          (exportCsv)="exportCsv($event)"
        ></josanz-data-grid>
      `,
    };
  },
};

export const InteractiveGrid: Story = {
  args: {
    title: 'Data grid interactivo',
    columns,
    rows,
    searchable: true,
    selectable: true,
    selectedIds: [],
    selectedIdsChange: fn(),
    sortChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText(/Buscar/i), 'ana');
    await userEvent.click(canvas.getByText(/Cliente/i));
    await expect(args['sortChange']).toHaveBeenCalled();
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    await expect(args['selectedIdsChange']).toHaveBeenCalled();
  },
};
