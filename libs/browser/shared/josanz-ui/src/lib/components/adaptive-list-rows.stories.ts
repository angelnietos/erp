import { Component, Input, OnChanges, OnInit, inject } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  JOSANZ_LIST_VIEW_MENU_OPTIONS,
  type JosanzListViewSelection,
} from '../list-view/list-view-preferences';
import { JosanzThemeService } from '../services/theme.service';
import { sbEmit, sbSelect, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AdaptiveListRowsComponent, type JosanzAdaptiveListItem } from './adaptive-list-rows';
import { ListViewSelectorComponent } from './list-view-selector';

const SAMPLE_ITEMS: JosanzAdaptiveListItem[] = [
  {
    id: '1',
    title: 'NovaByte S.L.',
    leadingMark: 'NB',
    data: ['B-12345678', 'Madrid', 'contacto@novabyte.es'],
    labels: ['CIF', 'Ciudad', 'Email'],
    status: 'Activo',
    statusVariant: 'confirmado',
  },
  {
    id: '2',
    title: 'Construcciones ABC',
    leadingMark: 'AB',
    data: ['B-99887766', 'Barcelona', 'facturacion@abc.com'],
    labels: ['CIF', 'Ciudad', 'Email'],
    status: 'Borrador',
    statusVariant: 'borrador',
  },
  {
    id: '3',
    title: 'Eventos del Sur',
    leadingMark: 'ES',
    data: ['B-55443322', 'Sevilla', 'ops@eventosur.es'],
    labels: ['CIF', 'Ciudad', 'Email'],
    status: 'En proceso',
    statusVariant: 'en-proceso',
  },
  {
    id: '4',
    title: 'Logística Norte',
    leadingMark: 'LN',
    data: ['B-11223344', 'Bilbao', 'hola@loginorte.es'],
    labels: ['CIF', 'Ciudad', 'Email'],
    status: 'Cancelado',
    statusVariant: 'cancelado',
  },
];

const listViewIds = JOSANZ_LIST_VIEW_MENU_OPTIONS.map((o) => o.id);

@Component({
  selector: 'story-adaptive-list-host',
  standalone: true,
  imports: [AdaptiveListRowsComponent, ListViewSelectorComponent],
  template: `
    <div class="flex max-w-5xl flex-col gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="m-0 text-lg font-black" style="color: var(--josanz-text);">Listado adaptativo</h3>
          <p class="m-0 text-sm" style="color: var(--josanz-text-muted);">
            Cambia la vista con el selector o el control <strong>listView</strong> de la story.
          </p>
        </div>
        <josanz-list-view-selector
          label="Vista"
          [selected]="listView"
          (selectionChange)="onListViewChange($event)"
        ></josanz-list-view-selector>
      </div>
      <josanz-adaptive-list-rows
        [items]="items"
        [defaultLabels]="defaultLabels"
        (itemClick)="itemClick($event)"
      ></josanz-adaptive-list-rows>
    </div>
  `,
})
class AdaptiveListRowsStoryHost implements OnInit, OnChanges {
  private readonly theme = inject(JosanzThemeService);

  @Input() listView: JosanzListViewSelection = 'tarjetas-lista';
  @Input() items: JosanzAdaptiveListItem[] = SAMPLE_ITEMS;
  @Input() defaultLabels: string[] = ['CIF', 'Ciudad', 'Email'];
  @Input() itemClick!: (item: JosanzAdaptiveListItem) => void;

  ngOnInit(): void {
    this.theme.setListViewSelection(this.listView);
  }

  ngOnChanges(): void {
    this.theme.setListViewSelection(this.listView);
  }

  onListViewChange(selection: JosanzListViewSelection): void {
    this.listView = selection;
    this.theme.setListViewSelection(selection);
  }
}

const meta: Meta<AdaptiveListRowsStoryHost> = {
  component: AdaptiveListRowsStoryHost,
  title: 'Josanz UI / Adaptive List Rows',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [AdaptiveListRowsStoryHost],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Filas de listado que cambian entre tabla (tarjetas apiladas), lista de tarjetas y cuadrícula según `JosanzThemeService.listViewSelection()`. No expone `shape`/`customColor`: delega en `main-template-card` y `grid-list-card`.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    listView: sbSelect(listViewIds, 'Vista de listado (sincroniza theme service)'),
    items: { control: 'object', description: 'Elementos del listado' },
    defaultLabels: { control: 'object', description: 'Etiquetas por defecto para columnas de datos' },
    itemClick: sbEmit('itemClick', 'Click en una fila/tarjeta'),
  },
};

export default meta;
type Story = StoryObj<AdaptiveListRowsStoryHost>;

export const Playground: Story = {
  args: {
    listView: 'tarjetas-lista',
    items: SAMPLE_ITEMS,
    defaultLabels: ['CIF', 'Ciudad', 'Email'],
  },
  render: (args) => ({
    props: args,
    template: `
      <story-adaptive-list-host
        [listView]="listView"
        [items]="items"
        [defaultLabels]="defaultLabels"
        (itemClick)="itemClick($event)"
      ></story-adaptive-list-host>
    `,
  }),
};

export const TableView: Story = {
  parameters: {
    docs: { description: { story: 'Vista tabla: tarjetas apiladas tipo fila.' } },
  },
  args: { listView: 'tabla', items: SAMPLE_ITEMS },
  render: Playground.render,
};

export const GridComfortable: Story = {
  parameters: {
    docs: { description: { story: 'Cuadrícula cómoda con dos líneas de preview.' } },
  },
  args: { listView: 'tarjetas-grid', items: SAMPLE_ITEMS },
  render: Playground.render,
};

export const GridDense: Story = {
  parameters: {
    docs: { description: { story: 'Cuadrícula densa sin líneas de preview.' } },
  },
  args: { listView: 'tarjetas-grid-dense', items: SAMPLE_ITEMS },
  render: Playground.render,
};

const EVENT_ITEMS: JosanzAdaptiveListItem[] = [
  {
    id: 'e1',
    title: 'Gala Primavera 2026',
    leadingMark: 'GP',
    data: ['NovaByte', 'Madrid', '24/05/2026'],
    labels: ['Cliente', 'Ciudad', 'Fecha'],
    status: 'Confirmado',
    statusVariant: 'confirmado',
  },
  {
    id: 'e2',
    title: 'Convención anual',
    leadingMark: 'CA',
    data: ['Auralux', 'Barcelona', '18/06/2026'],
    labels: ['Cliente', 'Ciudad', 'Fecha'],
    status: 'En proceso',
    statusVariant: 'en-proceso',
  },
  {
    id: 'e3',
    title: 'Festival urbano',
    leadingMark: 'FU',
    data: ['Eventos Ruiz', 'Valencia', '02/07/2026'],
    labels: ['Cliente', 'Ciudad', 'Fecha'],
    status: 'Borrador',
    statusVariant: 'borrador',
  },
];

export const EventsUseCase: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Listado de eventos con datos de negocio y cambio de vista recomendado.',
      },
    },
  },
  args: {
    listView: 'tarjetas-lista',
    items: EVENT_ITEMS,
    defaultLabels: ['Cliente', 'Ciudad', 'Fecha'],
  },
  render: Playground.render,
};

export const InteractiveItemClick: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Valida que una fila accesible del listado emite `itemClick` al pulsar Enter.',
      },
    },
  },
  args: {
    listView: 'tarjetas-lista',
    items: SAMPLE_ITEMS,
    defaultLabels: ['CIF', 'Ciudad', 'Email'],
    itemClick: fn(),
  },
  render: Playground.render,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const firstItem = canvas.getByRole('button', { name: /abrir novabyte s\.l\./i });
    firstItem.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.itemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'NovaByte S.L.' }),
    );
  },
};
