import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DocumentListComponent } from './document-list';
import { DocumentItemComponent } from './document-item';

const meta: Meta<DocumentListComponent> = {
  component: DocumentListComponent,
  title: 'Josanz UI / Document List',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DocumentItemComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Contenedor de documentos con accion de subida opcional y slot para `josanz-document-item`. Ideal para fichas de cliente, eventos y presupuestos.',
        ),
      },
    },
  },
  argTypes: {
    uploadLabel: { control: 'text', description: 'Texto del boton de subida' },
    showUpload: { control: 'boolean', description: 'Muestra/oculta la zona de subida' },
    empty: { control: 'boolean', description: 'Muestra estado vacio' },
    accentColor: { control: 'color', description: 'Color de acento opcional' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    upload: sbEmit('upload', 'Click en subir documento'),
  },
};

export default meta;
type Story = StoryObj<DocumentListComponent>;

export const Playground: Story = {
  args: {
    uploadLabel: 'Subir documentacion',
    showUpload: true,
    empty: false,
    accentColor: '#0F1E2F',
    shape: 'rounded',
  },
  render: (args) => ({
    props: {
      ...args,
      viewAction: () => undefined,
      downloadAction: () => undefined,
      deleteAction: () => undefined,
    },
    template: `
      <div class="max-w-2xl">
        <josanz-document-list [uploadLabel]="uploadLabel" [showUpload]="showUpload" [empty]="empty" [accentColor]="accentColor" [shape]="shape" (upload)="upload($event)">
          <josanz-document-item name="Contrato firmado.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true" [showDelete]="true" (view)="viewAction()" (download)="downloadAction()" (delete)="deleteAction()"></josanz-document-item>
          <josanz-document-item name="Presupuesto inicial.xlsx" statusColor="var(--josanz-warning)" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Briefing del evento.docx" statusColor="var(--josanz-primary)" [showView]="true" [showDownload]="true"></josanz-document-item>
        </josanz-document-list>
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  args: {
    uploadLabel: 'Subir primer documento',
    showUpload: true,
    empty: true,
  },
};
