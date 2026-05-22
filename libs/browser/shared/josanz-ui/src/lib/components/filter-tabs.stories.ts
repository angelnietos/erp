import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { sbRadio, sbEmit, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { FilterTabsComponent } from './filter-tabs';

const meta: Meta<FilterTabsComponent> = {
  component: FilterTabsComponent,
  title: 'Josanz UI / Filter Tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Filtros horizontales con tres variantes: `figma` (chips), `underline` (tipografía eventos) y `brand` (color de marca). `shape` y `customColor` siguen la convención de `josanz-button`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Opciones del filtro (array de strings).',
    },
    selected: { control: 'text', description: 'Opción activa inicial' },
    variant: sbRadio(['figma', 'underline', 'brand'] as const, 'Estilo visual de las pestañas'),
    ...sbShapeArgTypes,
    selectionChange: sbEmit('selectionChange', 'Opción seleccionada'),
  },
};

export default meta;
type Story = StoryObj<FilterTabsComponent>;

const filterTabsTemplate = `
  <div class="max-w-3xl rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
    <josanz-filter-tabs
      [options]="options"
      [selected]="selected"
      [variant]="variant"
      [shape]="shape"
      [customColor]="customColor"
      (selectionChange)="selectionChange($event)"
    ></josanz-filter-tabs>
  </div>
`;

export const Playground: Story = {
  args: {
    options: ['Todas', 'Activas', 'Finalizadas', 'Borrador'],
    selected: 'Todas',
    variant: 'figma',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: filterTabsTemplate }),
};

export const BrandVariant: Story = {
  parameters: {
    docs: { description: { story: 'Chips con acento de marca (ideal para Inicio / dashboard).' } },
  },
  args: {
    options: ['Semana', 'Mes', 'Trimestre', 'Año'],
    selected: 'Mes',
    variant: 'brand',
    shape: 'pill',
  },
  render: (args) => ({ props: args, template: filterTabsTemplate }),
};

export const UnderlineVariant: Story = {
  parameters: {
    docs: { description: { story: 'Pestañas con subrayado para tipología de eventos.' } },
  },
  args: {
    options: ['Resumen', 'Presupuesto', 'Equipo', 'Documentos'],
    selected: 'Resumen',
    variant: 'underline',
    shape: 'rounded',
  },
  render: (args) => ({ props: args, template: filterTabsTemplate }),
};

export const CommonScenarios: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Dos bloques de filtros con datos fijos (estados y periodos).' },
    },
  },
  render: () => ({
    template: `
      <div class="flex max-w-4xl flex-col gap-10 rounded-2xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <section>
          <h4 class="mb-4 text-[10px] font-black uppercase tracking-[0.2em]" style="color: var(--josanz-text-muted);">Estados (figma)</h4>
          <josanz-filter-tabs
            [options]="['Pendientes', 'Enviadas', 'Cobradas', 'Vencidas']"
            selected="Pendientes"
            variant="figma"
          ></josanz-filter-tabs>
        </section>
        <section>
          <h4 class="mb-4 text-[10px] font-black uppercase tracking-[0.2em]" style="color: var(--josanz-text-muted);">Periodos (brand)</h4>
          <josanz-filter-tabs
            [options]="['Semana', 'Mes', 'Trimestre', 'Año']"
            selected="Mes"
            variant="brand"
            shape="pill"
          ></josanz-filter-tabs>
        </section>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Filtros por dominio: estados de cliente, periodos de dashboard y tipologías de evento.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-6 rounded-3xl p-6" style="background: var(--josanz-bg);">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-4 mt-0 text-sm font-black" style="color: var(--josanz-text);">Clientes</h4>
          <josanz-filter-tabs [options]="['Todos', 'Activos', 'Potenciales', 'Baja']" selected="Activos" variant="figma"></josanz-filter-tabs>
        </section>
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-4 mt-0 text-sm font-black" style="color: var(--josanz-text);">Inicio</h4>
          <josanz-filter-tabs [options]="['Semana', 'Mes', 'Trimestre', 'Año']" selected="Mes" variant="brand" shape="pill"></josanz-filter-tabs>
        </section>
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-4 mt-0 text-sm font-black" style="color: var(--josanz-text);">Eventos</h4>
          <josanz-filter-tabs [options]="['Todos', 'Corporativo', 'Concierto', 'Privado']" selected="Corporativo" variant="underline"></josanz-filter-tabs>
        </section>
      </div>
    `,
  }),
};

export const InteractiveFilterChange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interaction test: selecciona un filtro y actualiza el valor controlado `selected` en la story.',
      },
    },
  },
  args: {
    options: ['Todos', 'Activos', 'Pendientes', 'Baja'],
    selected: 'Todos',
    variant: 'brand',
    shape: 'pill',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-3xl rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-filter-tabs
          [options]="options"
          [selected]="selected"
          [variant]="variant"
          [shape]="shape"
          [customColor]="customColor"
          (selectionChange)="selected = $event; selectionChange($event)"
        ></josanz-filter-tabs>
        <p data-testid="active-filter" class="m-0 mt-5 text-sm font-bold" style="color: var(--josanz-text);">
          Filtro activo: {{ selected }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('active-filter')).toHaveTextContent('Filtro activo: Todos');
    await userEvent.click(canvas.getByRole('button', { name: 'Pendientes' }));
    await expect(canvas.getByTestId('active-filter')).toHaveTextContent('Filtro activo: Pendientes');
  },
};
