import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit } from '../../../.storybook/story-arg-types';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { TreeViewComponent } from './tree-view';

const meta: Meta<TreeViewComponent> = {
  component: TreeViewComponent,
  title: 'Josanz UI / Tree View',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Árbol jerárquico para carpetas, permisos, categorías o estructura de documentos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    expandedIdsChange: sbEmit('expandedIdsChange', 'Cambio de nodos expandidos'),
    checkedIdsChange: sbEmit('checkedIdsChange', 'Cambio de selección'),
    nodeSelect: sbEmit('nodeSelect', 'Nodo seleccionado'),
  },
};

export default meta;
type Story = StoryObj<TreeViewComponent>;

const permissionNodes = [
  {
    id: 'operations',
    label: 'Operaciones',
    description: 'Módulos diarios de taller y entregas',
    children: [
      { id: 'orders-read', label: 'Ver órdenes', description: 'Listado y detalle de órdenes' },
      { id: 'orders-write', label: 'Editar órdenes', description: 'Crear, asignar y cerrar trabajos' },
      { id: 'delivery-sign', label: 'Firmar albaranes', description: 'Validación con cliente' },
    ],
  },
  {
    id: 'finance',
    label: 'Administración',
    description: 'Facturación y presupuestos',
    children: [
      { id: 'budget-read', label: 'Ver presupuestos', description: 'Consulta de importes y estados' },
      { id: 'invoice-issue', label: 'Emitir facturas', description: 'Requiere rol supervisor' },
      { id: 'invoice-delete', label: 'Eliminar facturas', description: 'Bloqueado por auditoría', disabled: true },
    ],
  },
];

const warehouseNodes = [
  {
    id: 'warehouse-madrid',
    label: 'Almacén Madrid',
    description: '1.248 referencias · 3 zonas',
    children: [
      {
        id: 'madrid-a',
        label: 'Zona A · Alta rotación',
        description: 'Frenos, aceites y filtros',
        children: [
          { id: 'brakes', label: 'Frenos', description: '42 unidades · stock correcto' },
          { id: 'filters', label: 'Filtros', description: '18 unidades · revisar mínimo' },
        ],
      },
      { id: 'madrid-b', label: 'Zona B · Eventos', description: 'Cableado, audio y señalética' },
    ],
  },
  {
    id: 'warehouse-sevilla',
    label: 'Almacén Sevilla',
    description: '326 referencias · inventario pendiente',
    children: [{ id: 'incident-stock', label: 'Stock en incidencia', description: '4 referencias bajo mínimo' }],
  },
];

export const CheckableTree: Story = {
  args: {
    title: 'Permisos por módulo',
    nodes: permissionNodes,
    expandedIds: ['operations', 'finance'],
    checkable: true,
    checkedIds: ['orders-read', 'delivery-sign'],
    checkedIdsChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await userEvent.click(boxes[0]);
    await expect(args['checkedIdsChange']).toHaveBeenCalled();
  },
};

export const Playground: Story = {
  args: {
    title: 'Almacenes y zonas',
    nodes: warehouseNodes,
    expandedIds: ['warehouse-madrid'],
    nodeSelect: fn(),
    expandedIdsChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expandButtons = canvas.getAllByRole('button', { name: '+' });
    await userEvent.click(expandButtons[expandButtons.length - 1]);
    await expect(canvas.getByText(/Stock en incidencia/i)).toBeVisible();
  },
};

export const PermissionMatrixUseCase: Story = {
  args: {
    title: 'Rol: responsable de taller',
    nodes: permissionNodes,
    expandedIds: ['operations', 'finance'],
    checkable: true,
    checkedIds: ['operations', 'orders-read', 'orders-write', 'delivery-sign', 'budget-read'],
    checkedIdsChange: fn(),
    nodeSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="grid max-w-5xl gap-6 rounded-3xl border border-solid p-6 lg:grid-cols-[1fr_320px]" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Seguridad</p>
          <josanz-tree-view
            [title]="title"
            [nodes]="nodes"
            [expandedIds]="expandedIds"
            [checkable]="checkable"
            [checkedIds]="checkedIds"
            (checkedIdsChange)="checkedIdsChange($event)"
            (nodeSelect)="nodeSelect($event)"
          ></josanz-tree-view>
        </div>
        <aside class="rounded-2xl border border-solid p-5" style="border-color: var(--josanz-border);">
          <h3 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Resumen del rol</h3>
          <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">Acceso completo a operaciones, lectura de presupuestos y facturación restringida.</p>
          <div class="mt-4 grid gap-2 text-xs font-bold" style="color: var(--josanz-text-muted);">
            <span>5 permisos activos</span>
            <span>1 permiso bloqueado por auditoría</span>
          </div>
        </aside>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(/Emitir facturas/i));
    await expect(args['nodeSelect']).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'invoice-issue' }),
    );
    await userEvent.click(canvas.getAllByRole('checkbox')[0]);
    await expect(args['checkedIdsChange']).toHaveBeenCalled();
  },
};
