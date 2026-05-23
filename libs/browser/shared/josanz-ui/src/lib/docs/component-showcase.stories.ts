import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import {
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { ButtonComponent } from '../components/button';
import { SecondaryButtonComponent } from '../components/secondary-button';
import { FilterTabsComponent } from '../components/filter-tabs';
import { ListSearchFieldComponent } from '../components/list-search-field';
import { ListViewSelectorComponent } from '../components/list-view-selector';
import { GridListCardComponent } from '../components/grid-list-card';
import { DocumentListComponent } from '../components/document-list';
import { DocumentItemComponent } from '../components/document-item';
import { PaginationComponent } from '../components/pagination';
import { MainTemplateCardComponent } from '../components/main-template-card';
import { EmptyStateComponent } from '../components/empty-state';
import { StatCardComponent } from '../components/stat-card';
import { GalleryComponent } from '../components/gallery';
import { CalendarComponent } from '../components/calendar';
import { DateTimePickerComponent } from '../components/date-time-picker';
import { TimePickerComponent } from '../components/time-picker';
import { AlertComponent } from '../components/alert';
import { BadgeComponent } from '../components/badge';
import { SkeletonComponent } from '../components/skeleton';
import { BreadcrumbsComponent } from '../components/breadcrumbs';
import { StepperComponent } from '../components/stepper';

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
        MainTemplateCardComponent,
        EmptyStateComponent,
        StatCardComponent,
        GalleryComponent,
        CalendarComponent,
        DateTimePickerComponent,
        TimePickerComponent,
        AlertComponent,
        BadgeComponent,
        SkeletonComponent,
        BreadcrumbsComponent,
        StepperComponent,
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
    brandColor: {
      control: 'color',
      description: 'Color de marca aplicado al showcase',
    },
    activeFilter: { control: 'text', description: 'Filtro activo' },
    filterVariant: sbRadio(
      ['figma', 'underline', 'brand'] as const,
      'Variante de filtros',
    ),
    searchShape: sbRadio(
      ['rounded', 'pill', 'square'] as const,
      'Shape del buscador',
    ),
    cardDensity: sbRadio(
      ['comfortable', 'compact', 'dense'] as const,
      'Densidad de tarjetas',
    ),
    paginationVariant: sbRadio(
      ['figma', 'numbered'] as const,
      'Variante de paginacion',
    ),
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

export const EventsSlice: Story = {
  args: {
    brandColor: '#635BFF',
    activeFilter: 'Confirmados',
    filterVariant: 'figma',
    searchShape: 'pill',
    cardDensity: 'comfortable',
    paginationVariant: 'numbered',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Recorte de catálogo de eventos: filtros Figma, búsqueda pill y filas de estado de flujo.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="min-h-[820px] p-6" [style.--josanz-primary]="brandColor" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6">
          <header class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Showcase · Eventos</p>
            <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Catálogo de eventos</h1>
          </header>
          <div class="grid gap-4 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-list-search-field value="" placeholder="Buscar evento..." [shape]="searchShape" [customColor]="brandColor"></josanz-list-search-field>
            <josanz-filter-tabs
              [options]="['Todos', 'Confirmados', 'En presupuesto', 'Cancelados']"
              [selected]="activeFilter"
              [variant]="filterVariant"
              [customColor]="brandColor"
            ></josanz-filter-tabs>
          </div>
          <div class="space-y-3 rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-main-template-card title="Gala Primavera 2026" status="Confirmado" statusVariant="confirmado" [labels]="['Cliente', 'Ciudad', 'Total']" [data]="['NovaByte', 'Sevilla', '24.500 EUR']"></josanz-main-template-card>
            <josanz-main-template-card title="Convención Retail Q3" status="En presupuesto" statusVariant="presupuesto" [labels]="['Cliente', 'Ciudad', 'Total']" [data]="['Auralux', 'Madrid', '18.200 EUR']"></josanz-main-template-card>
            <josanz-main-template-card title="Festival Sonido Sur" status="En proceso" statusVariant="en-proceso" [labels]="['Cliente', 'Ciudad', 'Total']" [data]="['Eventos del Sur', 'Cádiz', '9.800 EUR']"></josanz-main-template-card>
          </div>
          <footer class="flex justify-center rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-pagination [current]="2" [total]="9" [variant]="paginationVariant" [customColor]="brandColor"></josanz-pagination>
          </footer>
        </div>
      </section>
    `,
  }),
};

export const BillingSlice: Story = {
  args: {
    brandColor: '#0F1E2F',
    activeFilter: 'Pendientes',
    filterVariant: 'brand',
    searchShape: 'rounded',
    cardDensity: 'compact',
    paginationVariant: 'figma',
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Recorte de facturación: tarjetas compactas, estados de cobro y paginación Figma.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <section class="min-h-[820px] p-6" [style.--josanz-primary]="brandColor" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6">
          <header class="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <div>
              <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Showcase · Facturación</p>
              <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Facturas y cobros</h1>
            </div>
            <josanz-button label="Nueva factura" [customColor]="brandColor"></josanz-button>
          </header>
          <josanz-filter-tabs
            [options]="['Todas', 'Pendientes', 'Cobradas', 'Vencidas']"
            [selected]="activeFilter"
            [variant]="filterVariant"
            [customColor]="brandColor"
          ></josanz-filter-tabs>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <josanz-grid-list-card title="INV-2026-004" status="Pendiente" statusVariant="en-proceso" [density]="cardDensity" [fieldLabels]="['Cliente', 'Importe', 'Vence']" [previewLines]="['NovaByte', '1.250 EUR', '12 días']"></josanz-grid-list-card>
            <josanz-grid-list-card title="INV-2026-003" status="Cobrada" statusVariant="facturado" [density]="cardDensity" [fieldLabels]="['Cliente', 'Importe', 'Vence']" [previewLines]="['Auralux', '8.900 EUR', 'Pagada']"></josanz-grid-list-card>
          </div>
          <footer class="flex justify-center rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-pagination [current]="3" [total]="12" [variant]="paginationVariant" [customColor]="brandColor"></josanz-pagination>
          </footer>
        </div>
      </section>
    `,
  }),
};

export const EventOperationsSuite: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Showcase compuesto: planificación de evento combinando KPIs, calendario, horarios, documentos y galería.',
      },
    },
  },
  render: () => ({
    props: {
      eventImages: [
        {
          id: 'stage',
          src: 'https://picsum.photos/seed/josanz-suite-stage/720/520',
          alt: 'Escenario preparado',
          title: 'Escenario',
          subtitle: 'Montaje principal',
          badge: 'Foto',
        },
        {
          id: 'audio',
          src: 'https://picsum.photos/seed/josanz-suite-audio/720/520',
          alt: 'Control de audio',
          title: 'Audio',
          subtitle: 'Prueba técnica',
          badge: 'AV',
        },
      ],
      eventDates: ['2026-05-18', '2026-05-24', '2026-05-29'],
    },
    template: `
      <section class="min-h-[980px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-7xl gap-6">
          <header class="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <div>
              <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Suite compuesta</p>
              <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Operación · Gala Primavera 2026</h1>
              <p class="m-0 mt-2 text-sm" style="color: var(--josanz-text-muted);">Componentes genéricos combinados en una vista de producto real.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <josanz-secondary-button label="Exportar plan" type="pdf"></josanz-secondary-button>
              <josanz-button label="Guardar cambios" [showIcon]="false" customColor="#635BFF"></josanz-button>
            </div>
          </header>

          <div class="grid gap-5 md:grid-cols-3">
            <josanz-stat-card eyebrow="Presupuesto" title="Total" value="24.500 EUR" caption="Margen 18%" trendLabel="OK" trendDirection="flat" icon="invoice" customColor="#635BFF"></josanz-stat-card>
            <josanz-stat-card eyebrow="Equipo" title="Técnicos" value="6" caption="Sonido · luces · rigging" trendLabel="2" trendDirection="up" tone="success" icon="users"></josanz-stat-card>
            <josanz-stat-card eyebrow="Logística" title="Vehículos" value="3/4" caption="Uno pendiente de asignación" trendLabel="1" trendDirection="flat" tone="warning" icon="truck"></josanz-stat-card>
          </div>

          <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
            <josanz-calendar eyebrow="Agenda" month="2026-05" selectedDate="2026-05-24" [eventDates]="eventDates" customColor="#635BFF"></josanz-calendar>

            <div class="grid gap-6">
              <josanz-alert
                tone="warning"
                title="Permisos pendientes"
                description="Falta adjuntar la autorización municipal antes de cerrar la producción."
                actionLabel="Completar"
              ></josanz-alert>

              <section class="grid gap-5 rounded-3xl border border-solid p-6 md:grid-cols-3" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
                <josanz-date-time-picker label="Inicio montaje" value="2026-05-24T08:00" customColor="#635BFF"></josanz-date-time-picker>
                <josanz-time-picker label="Prueba sonido" value="12:00" customColor="var(--josanz-success)"></josanz-time-picker>
                <josanz-time-picker label="Apertura puertas" value="19:30" customColor="var(--josanz-warning)" shape="pill"></josanz-time-picker>
              </section>

              <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <josanz-gallery title="Galería técnica" description="Fotos asociadas al montaje" [items]="eventImages" selectedId="stage" [columns]="2" customColor="#635BFF"></josanz-gallery>
                <josanz-document-list uploadLabel="Subir documento" accentColor="#635BFF">
                  <josanz-document-item name="Contrato NovaByte.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
                  <josanz-document-item name="Rider técnico.pdf" statusColor="#635BFF" [showView]="true" [showDownload]="true"></josanz-document-item>
                  <josanz-document-item name="Permisos ayuntamiento.pdf" statusColor="var(--josanz-warning)" [showDownload]="true" [showDelete]="true"></josanz-document-item>
                </josanz-document-list>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
  }),
};

export const UiLibraryBasicsSuite: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Showcase de primitivas comunes en cualquier UI kit: navegación jerárquica, badges, stepper y skeletons de carga.',
      },
    },
  },
  render: () => ({
    props: {
      wizardSteps: [
        { id: 'client', label: 'Cliente', description: 'Datos fiscales' },
        { id: 'event', label: 'Evento', description: 'Fechas y equipo' },
        { id: 'docs', label: 'Documentos', description: 'Contrato y permisos' },
        {
          id: 'publish',
          label: 'Publicar',
          description: 'Enviar a producción',
        },
      ],
    },
    template: `
      <section class="min-h-[860px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-6xl gap-6">
          <header class="grid gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <josanz-breadcrumbs
              separator="›"
              [items]="[
                { label: 'ERP', href: '#' },
                { label: 'Eventos', href: '#' },
                { label: 'Gala Primavera 2026', current: true }
              ]"
            ></josanz-breadcrumbs>
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Primitivas de UI</p>
                <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Ficha de producción</h1>
              </div>
              <div class="flex flex-wrap gap-2">
                <josanz-badge label="Confirmado" tone="success" [dot]="true"></josanz-badge>
                <josanz-badge label="Permisos pendientes" tone="warning" variant="outline"></josanz-badge>
                <josanz-badge label="VIP" tone="custom" customColor="#635BFF"></josanz-badge>
              </div>
            </div>
          </header>

          <josanz-stepper [items]="wizardSteps" activeId="docs" customColor="#635BFF"></josanz-stepper>

          <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section class="grid gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <div class="flex flex-wrap gap-2">
                <josanz-badge label="Sonido" tone="primary" variant="soft"></josanz-badge>
                <josanz-badge label="Iluminación" tone="custom" customColor="#8B5CF6" variant="soft"></josanz-badge>
                <josanz-badge label="Escenario" tone="neutral" variant="outline"></josanz-badge>
              </div>
              <josanz-alert
                tone="info"
                title="Documentación en progreso"
                description="Estos componentes cubren estados, navegación y carga para cualquier módulo del ERP."
                actionLabel="Ver checklist"
              ></josanz-alert>
              <div class="grid gap-4 md:grid-cols-2">
                <josanz-skeleton variant="card"></josanz-skeleton>
                <div class="grid gap-4">
                  <josanz-skeleton variant="text" [lines]="5"></josanz-skeleton>
                  <josanz-skeleton variant="button" shape="pill"></josanz-skeleton>
                </div>
              </div>
            </section>

            <section class="grid gap-4 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Stepper vertical</p>
              <josanz-stepper [items]="wizardSteps" activeId="event" orientation="vertical" shape="pill"></josanz-stepper>
            </section>
          </div>
        </div>
      </section>
    `,
  }),
};

export const VisualRegressionMatrix: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Matriz estable para Chromatic: compara acciones, filtros, tarjetas, documentos y paginación con varias marcas y shapes.',
      },
    },
  },
  render: () => ({
    template: `
      <section class="min-h-[920px] p-6" style="background: var(--josanz-bg);">
        <div class="mx-auto grid max-w-7xl gap-6">
          <header class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
            <p class="m-0 text-xs font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Chromatic baseline</p>
            <h1 class="m-0 mt-2 text-3xl font-black" style="color: var(--josanz-text);">Matriz visual Josanz UI</h1>
            <p class="m-0 mt-2 max-w-3xl text-sm" style="color: var(--josanz-text-muted);">
              Esta story reúne superficies críticas para detectar regresiones de contraste, color de marca, estados y radios.
            </p>
          </header>

          <div class="grid gap-5 lg:grid-cols-3">
            <section class="rounded-3xl border border-solid p-5" style="--josanz-primary: #0F1E2F; background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Marca base · Rounded</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <josanz-button label="Nuevo cliente" [customColor]="'#0F1E2F'"></josanz-button>
                <josanz-secondary-button label="Exportar" type="excel" customColor="#0F1E2F"></josanz-secondary-button>
              </div>
              <div class="mt-5">
                <josanz-filter-tabs [options]="['Todos', 'Activos', 'Baja']" selected="Activos" variant="brand" customColor="#0F1E2F"></josanz-filter-tabs>
              </div>
            </section>

            <section class="rounded-3xl border border-solid p-5" style="--josanz-primary: #635BFF; background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Marca evento · Pill</p>
              <div class="mt-4 grid gap-3">
                <josanz-list-search-field placeholder="Buscar evento..." shape="pill" customColor="#635BFF"></josanz-list-search-field>
                <josanz-filter-tabs [options]="['Todos', 'Confirmados', 'Presupuesto']" selected="Confirmados" variant="figma" shape="pill" customColor="#635BFF"></josanz-filter-tabs>
              </div>
            </section>

            <section class="rounded-3xl border border-solid p-5" style="--josanz-primary: #B91C1C; background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Acciones críticas · Square</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <josanz-button label="Eliminar" variant="danger" shape="square" [showIcon]="false"></josanz-button>
                <josanz-secondary-button label="Cancelar" type="cancel" shape="square" customColor="#B91C1C"></josanz-secondary-button>
              </div>
              <div class="mt-5">
                <josanz-pagination [current]="7" [total]="12" variant="numbered" shape="square" customColor="#B91C1C"></josanz-pagination>
              </div>
            </section>
          </div>

          <div class="grid gap-5 lg:grid-cols-[1fr_360px]">
            <section class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Estados de flujo</p>
              <div class="mt-4 grid gap-3">
                <josanz-main-template-card title="Gala Primavera 2026" status="Confirmado" statusVariant="confirmado" [labels]="['Cliente', 'Ciudad', 'Equipo', 'Total']" [data]="['NovaByte', 'Sevilla', '6 técnicos', '24.500 EUR']"></josanz-main-template-card>
                <josanz-main-template-card title="Convención Retail Q3" status="En presupuesto" statusVariant="presupuesto" [labels]="['Cliente', 'Ciudad', 'Equipo', 'Total']" [data]="['Auralux', 'Madrid', '4 técnicos', '18.200 EUR']"></josanz-main-template-card>
                <josanz-main-template-card title="Festival Sonido Sur" status="Incidencia" statusVariant="incidencia" [labels]="['Cliente', 'Ciudad', 'Equipo', 'Total']" [data]="['Eventos del Sur', 'Cádiz', '8 técnicos', '9.800 EUR']"></josanz-main-template-card>
              </div>
            </section>

            <josanz-document-list uploadLabel="Subir contrato" accentColor="#635BFF">
              <josanz-document-item name="Contrato NovaByte.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
              <josanz-document-item name="Presupuesto Q3.xlsx" statusColor="var(--josanz-warning)" [showDownload]="true"></josanz-document-item>
              <josanz-document-item name="Anexo técnico.docx" statusColor="var(--josanz-primary)" [showView]="true" [showDownload]="true" [showDelete]="true"></josanz-document-item>
            </josanz-document-list>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
            <josanz-grid-list-card title="NovaByte" status="Activo" statusVariant="confirmado" density="comfortable" [fieldLabels]="['CIF', 'Email', 'Total']" [previewLines]="['B-12345678', 'contacto@novabyte.es', '12.450 EUR']"></josanz-grid-list-card>
            <josanz-grid-list-card title="Auralux" status="Borrador" statusVariant="borrador" density="compact" [fieldLabels]="['Lead', 'Origen', 'Valor']" [previewLines]="['María', 'Web', '8.900 EUR']"></josanz-grid-list-card>
            <josanz-grid-list-card title="Eventos del Sur" status="Proceso" statusVariant="en-proceso" density="dense" [fieldLabels]="['Ciudad', 'Próximo', 'Equipo']" [previewLines]="['Sevilla', 'Gala', '4 técnicos']"></josanz-grid-list-card>
          </div>

          <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div class="grid gap-5 sm:grid-cols-2">
              <josanz-stat-card eyebrow="Clientes" title="Activos" value="128" caption="12 nuevos este mes" trendLabel="9%" trendDirection="up" tone="success" icon="users"></josanz-stat-card>
              <josanz-stat-card eyebrow="Facturación" title="Pendiente" value="24.500 EUR" caption="8 facturas abiertas" trendLabel="12%" trendDirection="up" tone="primary" icon="invoice"></josanz-stat-card>
            </div>
            <josanz-empty-state
              eyebrow="Baseline vacío"
              title="Sin resultados"
              description="Estado común para listados y búsquedas. Valida icono, CTAs, surface y tokens de texto."
              icon="search"
              primaryLabel="Crear registro"
              secondaryLabel="Limpiar filtros"
              customColor="#635BFF"
            ></josanz-empty-state>
          </div>
        </div>
      </section>
    `,
  }),
};
