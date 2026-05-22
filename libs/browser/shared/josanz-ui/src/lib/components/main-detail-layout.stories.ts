import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MainDetailLayoutComponent } from './main-detail-layout';
import { DetailCardComponent } from './detail-card';
import { DocumentListComponent } from './document-list';
import { DocumentItemComponent } from './document-item';
import { SecondaryButtonComponent } from './secondary-button';
import { GridListCardComponent } from './grid-list-card';

const meta: Meta<MainDetailLayoutComponent> = {
  component: MainDetailLayoutComponent,
  title: 'Josanz UI / Main Detail Layout',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DetailCardComponent, DocumentListComponent, DocumentItemComponent, SecondaryButtonComponent, GridListCardComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Layout para pantallas de alta/edicion/detalle. Documenta cabecera, tabs, slot de acciones, contenido proyectado y footer fijo de guardar/cancelar.',
        ),
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text', description: 'Titulo del detalle' },
    tabs: { control: 'object', description: 'Tabs de navegacion interna' },
    activeTab: { control: 'text', description: 'Tab seleccionada' },
    saveLabel: { control: 'text', description: 'Texto del boton guardar' },
    cancelLabel: { control: 'text', description: 'Texto del boton cancelar' },
    layoutVariant: sbRadio(['default', 'figma-event'] as const, 'Variante de layout'),
    statusLabel: { control: 'text', description: 'Estado visible en variante Figma' },
    statusPillKey: sbRadio(['borrador', 'en-proceso', 'confirmado', 'cancelado'] as const, 'Token de estado'),
    showFooterActions: { control: 'boolean' },
    saveDisabled: { control: 'boolean' },
    back: sbEmit('back', 'Volver'),
    tabChange: sbEmit('tabChange', 'Cambio de tab'),
    save: sbEmit('save', 'Guardar'),
    cancel: sbEmit('cancel', 'Cancelar'),
  },
};

export default meta;
type Story = StoryObj<MainDetailLayoutComponent>;

export const Playground: Story = {
  args: {
    title: 'Nuevo Cliente',
    tabs: ['Datos', 'Operadores', 'Documentos'],
    activeTab: 'Datos',
    saveLabel: 'Anadir cliente',
    cancelLabel: 'Cancelar',
    layoutVariant: 'default',
    showFooterActions: true,
    saveDisabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[760px] overflow-hidden" style="background: var(--josanz-bg);">
        <josanz-main-detail-layout
          [title]="title"
          [tabs]="tabs"
          [activeTab]="activeTab"
          [saveLabel]="saveLabel"
          [cancelLabel]="cancelLabel"
          [layoutVariant]="layoutVariant"
          [showFooterActions]="showFooterActions"
          [saveDisabled]="saveDisabled"
          (back)="back($event)"
          (tabChange)="tabChange($event)"
          (save)="save($event)"
          (cancel)="cancel($event)"
        >
          <div header-actions>
            <josanz-secondary-button label="Importar CSV" type="excel"></josanz-secondary-button>
          </div>
          <div class="grid gap-5 p-4 md:grid-cols-[1.1fr_0.9fr]">
            <lib-detail-card
              title="NovaByte S.L."
              badgeText="Cliente premium"
              subtitle="contacto@novabyte.es"
              description="Ficha de cliente usada para validar layouts de detalle, documentos y acciones fijas."
              [data]="['Madrid']"
              [tags]="['Eventos', 'Tecnologia', 'Alta prioridad']"
              imageUrl="https://i.pravatar.cc/150?u=novabyte"
            ></lib-detail-card>
            <josanz-document-list uploadLabel="Subir contrato">
              <josanz-document-item name="Contrato marco.pdf" [showView]="true" [showDownload]="true"></josanz-document-item>
              <josanz-document-item name="NDA firmado.pdf" statusColor="var(--josanz-warning)" [showDownload]="true" [showDelete]="true"></josanz-document-item>
            </josanz-document-list>
          </div>
        </josanz-main-detail-layout>
      </div>
    `,
  }),
};

export const FigmaEventVariant: Story = {
  args: {
    title: 'Gala Primavera 2026',
    tabs: ['Resumen', 'Presupuesto', 'Equipo', 'Documentos'],
    activeTab: 'Resumen',
    layoutVariant: 'figma-event',
    statusLabel: 'Confirmado',
    statusPillKey: 'confirmado',
    userLabel: 'Lucia',
    saveLabel: 'Guardar',
    saveDisabled: false,
    showFooterActions: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[720px] overflow-hidden" style="background: var(--josanz-bg);">
        <josanz-main-detail-layout
          [title]="title"
          [tabs]="tabs"
          [activeTab]="activeTab"
          [layoutVariant]="layoutVariant"
          [statusLabel]="statusLabel"
          [statusPillKey]="statusPillKey"
          [userLabel]="userLabel"
          [saveLabel]="saveLabel"
          [saveDisabled]="saveDisabled"
          [showFooterActions]="showFooterActions"
          (back)="back($event)"
          (tabChange)="tabChange($event)"
          (save)="save($event)"
        >
          <div class="grid gap-4 p-4 md:grid-cols-3">
            <josanz-grid-list-card title="Presupuesto" status="OK" statusVariant="confirmado" [previewLines]="['24.500 EUR', 'Margen 18%']" [fieldLabels]="['Total', 'Rentabilidad']"></josanz-grid-list-card>
            <josanz-grid-list-card title="Tecnicos" status="4" statusVariant="en-proceso" [previewLines]="['Sonido', 'Iluminacion']" [fieldLabels]="['Equipo', 'Areas']"></josanz-grid-list-card>
            <josanz-grid-list-card title="Cliente" status="VIP" statusVariant="borrador" [previewLines]="['NovaByte', 'Madrid']" [fieldLabels]="['Empresa', 'Ciudad']"></josanz-grid-list-card>
          </div>
        </josanz-main-detail-layout>
      </div>
    `,
  }),
};
