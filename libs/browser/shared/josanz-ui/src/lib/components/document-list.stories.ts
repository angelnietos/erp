import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
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
  parameters: {
    docs: {
      description: {
        story: 'Estado vacío con CTA de subida visible.',
      },
    },
  },
  args: {
    uploadLabel: 'Subir primer documento',
    showUpload: true,
    empty: true,
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-2xl">
        <josanz-document-list
          [uploadLabel]="uploadLabel"
          [showUpload]="showUpload"
          [empty]="empty"
          [accentColor]="accentColor"
          [shape]="shape"
          (upload)="upload($event)"
        ></josanz-document-list>
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
          'Documentos por contexto de negocio: contratos de cliente, documentación de evento y presupuesto/factura.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-6xl gap-6 lg:grid-cols-3">
        <josanz-document-list uploadLabel="Subir contrato" accentColor="var(--josanz-primary)">
          <josanz-document-item name="Contrato marco NovaByte.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="NDA firmado.pdf" statusColor="var(--josanz-success)" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Anexo condiciones 2026.docx" statusColor="var(--josanz-warning)" [showView]="true" [showDownload]="true" [showDelete]="true"></josanz-document-item>
        </josanz-document-list>

        <josanz-document-list uploadLabel="Subir rider" accentColor="#635BFF" shape="pill">
          <josanz-document-item name="Rider técnico.pdf" statusColor="#635BFF" [showView]="true" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Plano escenario.png" statusColor="var(--josanz-primary)" [showView]="true"></josanz-document-item>
          <josanz-document-item name="Permisos ayuntamiento.pdf" statusColor="var(--josanz-warning)" [showDownload]="true"></josanz-document-item>
        </josanz-document-list>

        <josanz-document-list uploadLabel="Adjuntar factura" accentColor="var(--josanz-success)">
          <josanz-document-item name="Presupuesto aprobado.xlsx" statusColor="var(--josanz-success)" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Factura emitida.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
          <josanz-document-item name="Justificante pago.pdf" statusColor="var(--josanz-primary)" [showDownload]="true" [showDelete]="true"></josanz-document-item>
        </josanz-document-list>
      </div>
    `,
  }),
};

export const InteractiveUpload: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pulsa la zona de subida y valida que se emite `upload`.',
      },
    },
  },
  args: {
    uploadLabel: 'Subir contrato',
    showUpload: true,
    empty: false,
    accentColor: '#635BFF',
    shape: 'rounded',
    upload: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-2xl">
        <josanz-document-list
          [uploadLabel]="uploadLabel"
          [showUpload]="showUpload"
          [empty]="empty"
          [accentColor]="accentColor"
          [shape]="shape"
          (upload)="upload($event)"
        >
          <josanz-document-item name="Contrato marco.pdf" statusColor="var(--josanz-success)" [showView]="true" [showDownload]="true"></josanz-document-item>
        </josanz-document-list>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /subir contrato/i }));
    await expect(args.upload).toHaveBeenCalledTimes(1);
  },
};
