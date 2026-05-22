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
