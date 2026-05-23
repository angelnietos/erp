import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { KanbanBoardComponent, type JosanzKanbanColumn } from './kanban-board';

const meta: Meta<KanbanBoardComponent> = {
  component: KanbanBoardComponent,
  title: 'Josanz UI / Data / Kanban Board',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Tablero Kanban responsive para flujo de órdenes, tareas o incidencias. Cada tarjeta es accionable y emite `cardClick`; las columnas muestran contador mediante `josanz-badge`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título del tablero' },
    columns: { control: 'object', description: 'Columnas y tarjetas del tablero' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    cardClick: sbEmit('cardClick', 'Click sobre una tarjeta'),
  },
};

export default meta;
type Story = StoryObj<KanbanBoardComponent>;

const columns: JosanzKanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Pendiente',
    cards: [
      {
        id: 'ord-1042',
        title: 'Revisión completa BMW X1',
        description: 'Entrada por cita web, cliente espera presupuesto hoy.',
        badge: 'Urgente',
        assignee: 'Ana',
      },
      {
        id: 'ord-1038',
        title: 'Cambio de neumáticos',
        description: 'Confirmar disponibilidad de 225/45 R17.',
        badge: 'Stock',
        assignee: 'Luis',
      },
    ],
  },
  {
    id: 'doing',
    title: 'En curso',
    cards: [
      {
        id: 'ord-1031',
        title: 'Diagnóstico eléctrico',
        description: 'Revisar fallo intermitente en sensor ABS.',
        badge: 'Técnico',
        assignee: 'Sara',
      },
    ],
  },
  {
    id: 'done',
    title: 'Listo',
    cards: [
      {
        id: 'ord-1024',
        title: 'Entrega preparada',
        description: 'Lavado completado y factura emitida.',
        badge: 'Entrega',
        assignee: 'Mario',
      },
    ],
  },
];

export const Playground: Story = {
  args: {
    title: 'Flujo de órdenes',
    columns,
    ariaLabel: 'Tablero Kanban de órdenes de taller',
    cardClick: fn(),
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados de tablero: columnas vacías, tarjetas sin metadatos y columnas con varias tarjetas.',
      },
    },
  },
  render: () => ({
    props: {
      columns,
      sparseColumns: [
        {
          id: 'inbox',
          title: 'Inbox',
          cards: [{ id: 'task-1', title: 'Llamar a cliente' }],
        },
        { id: 'blocked', title: 'Bloqueado', cards: [] },
        {
          id: 'closed',
          title: 'Cerrado',
          cards: [
            { id: 'task-2', title: 'Enviar factura', badge: 'Admin' },
            { id: 'task-3', title: 'Archivar fotos', assignee: 'Recepción' },
          ],
        },
      ] satisfies JosanzKanbanColumn[],
    },
    template: `
      <div class="grid gap-8">
        <josanz-kanban-board title="Operativo completo" [columns]="columns"></josanz-kanban-board>
        <josanz-kanban-board title="Estados mínimos" [columns]="sparseColumns"></josanz-kanban-board>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos reales para operaciones: taller, CRM y administración.',
      },
    },
  },
  render: () => ({
    props: {
      workshopColumns: columns,
      crmColumns: [
        {
          id: 'lead',
          title: 'Lead',
          cards: [
            { id: 'crm-1', title: 'Flota Romero', description: 'Solicita mantenimiento anual.', badge: 'B2B' },
            { id: 'crm-2', title: 'Norte Motor', description: 'Renovación de contrato.', badge: 'Renovación' },
          ],
        },
        {
          id: 'proposal',
          title: 'Propuesta',
          cards: [{ id: 'crm-3', title: 'Auto Sur', description: 'Pendiente firma digital.', assignee: 'Comercial' }],
        },
      ] satisfies JosanzKanbanColumn[],
    },
    template: `
      <div class="grid gap-6">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-kanban-board title="Taller" [columns]="workshopColumns"></josanz-kanban-board>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-kanban-board title="CRM" [columns]="crmColumns"></josanz-kanban-board>
        </section>
      </div>
    `,
  }),
};

export const InteractiveCard: Story = {
  args: {
    title: 'Kanban interactivo',
    columns,
    cardClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /diagnóstico eléctrico/i }));
    await expect(args.cardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'ord-1031' }));
  },
};
