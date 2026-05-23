import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { BottomSheetComponent } from './bottom-sheet';
import { ChartComponent } from './chart';
import { KanbanBoardComponent } from './kanban-board';
import { TreeViewComponent } from './tree-view';
import { ButtonComponent } from './button';

const meta: Meta = {
  title: 'Josanz UI / Data & Modern Surfaces',
  decorators: [
    moduleMetadata({
      imports: [
        BottomSheetComponent,
        ChartComponent,
        KanbanBoardComponent,
        TreeViewComponent,
        ButtonComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tree view, charts, bottom sheet y kanban board para vistas modernas de producto.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    chartData: { control: 'object', description: 'Serie de datos para la gráfica.' },
    treeNodes: { control: 'object', description: 'Nodos jerárquicos del árbol.' },
    columns: { control: 'object', description: 'Columnas y tarjetas del kanban.' },
    cardClick: sbEmit('cardClick', 'Tarjeta del kanban seleccionada'),
    nodeSelect: sbEmit('nodeSelect', 'Nodo del árbol seleccionado'),
    closed: sbEmit('closed', 'Bottom sheet cerrado'),
  },
};

export default meta;
type Story = StoryObj;

const chartData = [
  { label: 'Sonido', value: 42 },
  { label: 'Luces', value: 28 },
  { label: 'Streaming', value: 18 },
  { label: 'Rigging', value: 12 },
];

const treeNodes = [
  {
    id: 'events',
    label: 'Eventos',
    description: 'Módulo operativo',
    children: [
      { id: 'event-1', label: 'Gala Primavera', description: 'Confirmado' },
      { id: 'event-2', label: 'Convención Retail', description: 'Presupuesto' },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    children: [{ id: 'invoices', label: 'Facturas' }],
  },
];

const columns = [
  {
    id: 'todo',
    title: 'Por hacer',
    cards: [
      {
        id: 'k1',
        title: 'Revisar contrato',
        description: 'Firma pendiente',
        badge: 'Legal',
        assignee: 'Ana',
      },
      {
        id: 'k2',
        title: 'Confirmar escenario',
        description: 'Medidas finales',
        badge: 'Prod',
        assignee: 'Luis',
      },
    ],
  },
  {
    id: 'doing',
    title: 'En curso',
    cards: [
      {
        id: 'k3',
        title: 'Rider técnico',
        description: 'Audio y luces',
        badge: 'AV',
        assignee: 'Mario',
      },
    ],
  },
  {
    id: 'done',
    title: 'Hecho',
    cards: [
      {
        id: 'k4',
        title: 'Presupuesto',
        description: 'Aprobado por cliente',
        badge: 'APR',
        assignee: 'Sara',
      },
    ],
  },
];

export const DataModernSuite: Story = {
  args: {
    cardClick: fn(),
    nodeSelect: fn(),
    closed: fn(),
  },
  render: (args) => ({
    props: { ...args, chartData, treeNodes, columns },
    template: `
      <section class="grid max-w-7xl gap-6">
        <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
          <josanz-tree-view title="Árbol de módulos" [nodes]="treeNodes" [expandedIds]="['events']" (nodeSelect)="nodeSelect($event)"></josanz-tree-view>
          <div class="grid gap-6 md:grid-cols-2">
            <josanz-chart title="Ingresos por servicio" description="Chart bar básico" [data]="chartData" variant="bar" customColor="#635BFF"></josanz-chart>
            <josanz-chart title="Mix operativo" description="Donut CSS sin dependencias" [data]="chartData" variant="donut"></josanz-chart>
          </div>
        </div>
        <josanz-kanban-board title="Kanban de producción" [columns]="columns" (cardClick)="cardClick($event)"></josanz-kanban-board>
        <josanz-bottom-sheet [open]="true" title="Bottom sheet" description="Superficie móvil para acciones rápidas." (closed)="closed()">
          <div class="grid gap-3">
            <josanz-button label="Crear evento" customColor="#635BFF"></josanz-button>
            <josanz-button label="Subir contrato" variant="secondary" [showIcon]="false"></josanz-button>
          </div>
        </josanz-bottom-sheet>
      </section>
    `,
  }),
};

export const InteractiveTreeAndKanban: Story = {
  args: {
    nodeSelect: fn(),
    cardClick: fn(),
  },
  render: (args) => ({
    props: { ...args, treeNodes, columns },
    template: `
      <div class="grid max-w-5xl gap-6">
        <josanz-tree-view [nodes]="treeNodes" [expandedIds]="['events']" (nodeSelect)="nodeSelect($event)"></josanz-tree-view>
        <josanz-kanban-board [columns]="columns" (cardClick)="cardClick($event)"></josanz-kanban-board>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /Gala Primavera/i }),
    );
    await userEvent.click(canvas.getByText(/Revisar contrato/i));
    await expect(args['nodeSelect']).toHaveBeenCalledTimes(1);
    await expect(args['cardClick']).toHaveBeenCalledTimes(1);
  },
};

