import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ButtonComponent } from '../components/button';
import { SecondaryButtonComponent } from '../components/secondary-button';
import { FilterTabsComponent } from '../components/filter-tabs';
import { ListSearchFieldComponent } from '../components/list-search-field';
import { ListViewSelectorComponent } from '../components/list-view-selector';
import { GridListCardComponent } from '../components/grid-list-card';
import { DocumentListComponent } from '../components/document-list';
import { DocumentItemComponent } from '../components/document-item';
import { PaginationComponent } from '../components/pagination';

const meta: Meta = {
  title: 'Josanz UI / Documentacion / Component Showcase',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent,
        SecondaryButtonComponent,
        FilterTabsComponent,
        ListSearchFieldComponent,
        ListViewSelectorComponent,
        GridListCardComponent,
        DocumentListComponent,
        DocumentItemComponent,
        PaginationComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Escenario dinamico para validar varios componentes juntos con el mismo set de tokens, color de marca, densidad de tarjetas y paginacion.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    brandColor: { control: 'color', description: 'Color de marca aplicado al showcase' },
    activeFilter: { control: 'text', description: 'Filtro activo' },
    filterVariant: sbRadio(['figma', 'underline', 'brand'] as const, 'Variante de filtros'),
    searchShape: sbRadio(['rounded', 'pill', 'square'] as const, 'Shape del buscador'),
    cardDensity: sbRadio(['comfortable', 'compact', 'dense'] as const, 'Densidad de tarjetas'),
    paginationVariant: sbRadio(['figma', 'numbered'] as const, 'Variante de paginacion'),
  },
};

export default meta;
type Story = StoryObj;

export const DashboardSlice: Story = {
  args: {
    brandColor: '#0F1E2F',
    activeFilter: 'Activos',
    filterVariant: 'brand',
    searchShape: 'rounded',
    cardDensity: 'comfortable',
    paginationVariant: 'figma',
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="min-h-[820px] p-6" [style.--josanz-primary]="brandColor" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6">
          <header class="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <div>
              <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Showcase dinamico</p>
              <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Clientes y documentos</h1>
            </div>
            <div class="flex flex-wrap gap-3">
              <josanz-secondary-button label="Exportar Excel" type="excel"></josanz-secondary-button>
              <josanz-button label="Nuevo Cliente" [customColor]="brandColor"></josanz-button>
            </div>
          </header>

          <div class="grid gap-4 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <josanz-list-search-field value="Nova" placeholder="Buscar cliente..." [shape]="searchShape" [customColor]="brandColor"></josanz-list-search-field>
              <josanz-list-view-selector label="Vista" selected="tarjetas-grid"></josanz-list-view-selector>
            </div>
            <josanz-filter-tabs
              [options]="['Todos', 'Activos', 'Pendientes', 'Baja']"
              [selected]="activeFilter"
              [variant]="filterVariant"
              [customColor]="brandColor"
            ></josanz-filter-tabs>
          </div>

          <div class="grid gap-5 md:grid-cols-[1fr_340px]">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <josanz-grid-list-card title="NovaByte" status="Activo" statusVariant="confirmado" [density]="cardDensity" [fieldLabels]="['CIF', 'Email', 'Total']" [previewLines]="['B-12345678', 'contacto@novabyte.es', '12.450 EUR']"></josanz-grid-list-card>
              <josanz-grid-list-card title="Eventos Ruiz" status="Proceso" statusVariant="en-proceso" [density]="cardDensity" [fieldLabels]="['Ciudad', 'Proximo', 'Equipo']" [previewLines]="['Madrid', 'Gala primavera', '4 tecnicos']"></josanz-grid-list-card>
              <josanz-grid-list-card title="Auralux" status="Borrador" statusVariant="borrador" [density]="cardDensity" [fieldLabels]="['Lead', 'Origen', 'Valor']" [previewLines]="['Maria', 'Web', '8.900 EUR']"></josanz-grid-list-card>
            </div>

            <josanz-document-list uploadLabel="Subir documento" [accentColor]="brandColor">
              <josanz-document-item name="Contrato NovaByte.pdf" [showView]="true" [showDownload]="true"></josanz-document-item>
              <josanz-document-item name="Presupuesto Q2.xlsx" statusColor="var(--josanz-warning)" [showDownload]="true"></josanz-document-item>
              <josanz-document-item name="Brief evento.docx" statusColor="var(--josanz-primary)" [showView]="true" [showDownload]="true" [showDelete]="true"></josanz-document-item>
            </josanz-document-list>
          </div>

          <footer class="flex justify-center rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-pagination [current]="3" [total]="12" [variant]="paginationVariant" [customColor]="brandColor"></josanz-pagination>
          </footer>
        </div>
      </section>
    `,
  }),
};
