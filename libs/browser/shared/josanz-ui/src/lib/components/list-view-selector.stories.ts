import {
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { sbEmit, sbSelect, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ListViewSelectorComponent } from './list-view-selector';

const viewOptions = JOSANZ_LIST_VIEW_MENU_OPTIONS.map((o) => o.id) as JosanzListViewSelection[];

const meta: Meta<ListViewSelectorComponent> = {
  component: ListViewSelectorComponent,
  title: 'Josanz UI / List View Selector',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Selector desplegable de densidad/vista de listado. Agrupa opciones de tabla y tarjetas, cierra con click exterior o Escape y emite `selectionChange`.',
        ),
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Texto previo al resumen de vista' },
    selected: sbSelect(viewOptions, 'Vista activa'),
    selectionChange: sbEmit('selectionChange', 'Vista seleccionada'),
  },
};

export default meta;
type Story = StoryObj<ListViewSelectorComponent>;

export const Playground: Story = {
  args: {
    label: 'Elección de vista',
    selected: 'tarjetas-lista',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="inline-block rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-view-selector
          [label]="label"
          [selected]="selected"
          (selectionChange)="selectionChange($event)"
        ></josanz-list-view-selector>
      </div>
    `,
  }),
};

export const InToolbar: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Dos selectores como aparecen en la barra de herramientas de un listado.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div>
          <h3 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Clientes</h3>
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">128 registros encontrados</p>
        </div>
        <div class="flex items-center gap-3">
          <josanz-list-view-selector label="Vista" selected="tabla"></josanz-list-view-selector>
          <josanz-list-view-selector label="Cuadrícula" selected="tarjetas-grid"></josanz-list-view-selector>
        </div>
      </div>
    `,
  }),
};

export const InteractiveDropdown: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interaction test: abre el desplegable, selecciona “Cuadrícula compacta” y actualiza `selected` en la story.',
      },
    },
  },
  args: {
    label: 'Vista',
    selected: 'tabla',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="inline-block rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-view-selector
          [label]="label"
          [selected]="selected"
          (selectionChange)="selected = $event; selectionChange($event)"
        ></josanz-list-view-selector>
        <p data-testid="selected-view" class="m-0 mt-5 text-sm font-bold" style="color: var(--josanz-text);">
          Vista seleccionada: {{ selected }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('selected-view')).toHaveTextContent('Vista seleccionada: tabla');
    await userEvent.click(canvas.getByRole('button', { name: /vista/i }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cuadrícula compacta' }));
    await expect(canvas.getByTestId('selected-view')).toHaveTextContent(
      'Vista seleccionada: tarjetas-grid-compact',
    );
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Recomendaciones de vista según tipo de contenido: tabla para facturas, lista para clientes, grid para eventos.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-5 md:grid-cols-3">
        <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Facturas</p>
          <h4 class="mb-4 mt-1 text-base font-black" style="color: var(--josanz-text);">Tabla</h4>
          <josanz-list-view-selector label="Vista" selected="tabla"></josanz-list-view-selector>
        </section>
        <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Clientes</p>
          <h4 class="mb-4 mt-1 text-base font-black" style="color: var(--josanz-text);">Lista</h4>
          <josanz-list-view-selector label="Vista" selected="tarjetas-lista"></josanz-list-view-selector>
        </section>
        <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 text-xs font-bold uppercase tracking-widest" style="color: var(--josanz-text-muted);">Eventos</p>
          <h4 class="mb-4 mt-1 text-base font-black" style="color: var(--josanz-text);">Grid denso</h4>
          <josanz-list-view-selector label="Vista" selected="tarjetas-grid-dense"></josanz-list-view-selector>
        </section>
      </div>
    `,
  }),
};
