import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DocumentItemComponent } from './document-item';

const meta: Meta<DocumentItemComponent> = {
  component: DocumentItemComponent,
  title: 'Josanz UI / Document Item',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Fila de documento con indicador de estado, nombre truncado y acciones opcionales (ver, descargar, eliminar). El color del punto usa `statusColor` (CSS).',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    name: { control: 'text', description: 'Nombre del archivo' },
    statusColor: { control: 'color', description: 'Color del indicador de estado' },
    showView: { control: 'boolean', description: 'Muestra botón ver' },
    showDownload: { control: 'boolean', description: 'Muestra botón descargar' },
    showDelete: { control: 'boolean', description: 'Muestra botón eliminar' },
    view: sbEmit('view', 'Ver documento'),
    download: sbEmit('download', 'Descargar'),
    delete: sbEmit('delete', 'Eliminar'),
  },
};

export default meta;
type Story = StoryObj<DocumentItemComponent>;

export const Playground: Story = {
  args: {
    name: 'Contrato marco firmado.pdf',
    statusColor: '#22c55e',
    showView: true,
    showDownload: true,
    showDelete: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-xl overflow-hidden rounded-2xl border border-solid" style="border-color: var(--josanz-stroke-widget); background: var(--josanz-surface);">
        <josanz-document-item
          [name]="name"
          [statusColor]="statusColor"
          [showView]="showView"
          [showDownload]="showDownload"
          [showDelete]="showDelete"
          (view)="view($event)"
          (download)="download($event)"
          (delete)="delete($event)"
        ></josanz-document-item>
      </div>
    `,
  }),
};

export const ActionMatrix: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Combinaciones típicas de acciones en fichas de cliente y eventos.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="max-w-xl overflow-hidden rounded-2xl border border-solid divide-y" style="border-color: var(--josanz-stroke-widget); background: var(--josanz-surface);">
        <josanz-document-item name="Solo descarga.pdf" statusColor="var(--josanz-success)" [showDownload]="true"></josanz-document-item>
        <josanz-document-item name="Ver y descargar.pdf" statusColor="var(--josanz-primary)" [showView]="true" [showDownload]="true"></josanz-document-item>
        <josanz-document-item name="Con eliminar.pdf" statusColor="var(--josanz-warning)" [showView]="true" [showDownload]="true" [showDelete]="true"></josanz-document-item>
        <josanz-document-item name="Pendiente de revision.docx" statusColor="var(--josanz-danger)" [showView]="true"></josanz-document-item>
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
          'Filas de documento en contexto: contrato validado, presupuesto pendiente, archivo interno y documento con eliminación.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-5 md:grid-cols-2">
        <section class="overflow-hidden rounded-2xl border border-solid" style="border-color: var(--josanz-stroke-widget); background: var(--josanz-surface);">
          <div class="border-b border-solid p-4" style="border-color: var(--josanz-border);">
            <h4 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Ficha de cliente</h4>
          </div>
          <josanz-document-item name="Contrato marco firmado.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Anexo RGPD pendiente.docx" statusColor="var(--josanz-warning)" [showView]="true" [showDownload]="true" [showDelete]="true"></josanz-document-item>
        </section>

        <section class="overflow-hidden rounded-2xl border border-solid" style="border-color: var(--josanz-stroke-widget); background: var(--josanz-surface);">
          <div class="border-b border-solid p-4" style="border-color: var(--josanz-border);">
            <h4 class="m-0 text-sm font-black" style="color: var(--josanz-text);">Evento</h4>
          </div>
          <josanz-document-item name="Rider técnico.pdf" statusColor="var(--josanz-primary)" [showView]="true" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Plano escenario v3.png" statusColor="#635BFF" [showView]="true"></josanz-document-item>
        </section>
      </div>
    `,
  }),
};
