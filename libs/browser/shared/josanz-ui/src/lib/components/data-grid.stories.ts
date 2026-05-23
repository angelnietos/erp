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
          'Cuadrícula avanzada: búsqueda local, ordenación, selección múltiple con “seleccionar todo” y estado de carga.',
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
    description: 'Filtra, ordena y selecciona filas visibles.',
    columns,
    rows,
    searchable: true,
    selectable: true,
    selectedIds: ['2'],
    rowClick: fn(),
    selectedIdsChange: fn(),
    sortChange: fn(),
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
