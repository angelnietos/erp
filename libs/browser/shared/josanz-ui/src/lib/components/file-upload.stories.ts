import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { FileUploadComponent } from './file-upload';

const meta: Meta<FileUploadComponent> = {
  component: FileUploadComponent,
  title: 'Josanz UI / File Upload',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Zona de subida con input nativo oculto, soporte de múltiples archivos y emisión de `File[]` al seleccionar.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Título de la zona de subida' },
    description: { control: 'text', description: 'Texto descriptivo' },
    accept: { control: 'text', description: 'Tipos MIME o extensiones aceptadas' },
    multiple: { control: 'boolean', description: 'Permite seleccionar varios archivos' },
    disabled: { control: 'boolean', description: 'Bloquea selección' },
    filesSelected: sbEmit('filesSelected', 'Archivos seleccionados'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Playground: Story = {
  args: {
    title: 'Subir documentación',
    description: 'PDF, JPG o PNG hasta 10 MB.',
    accept: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    disabled: false,
    shape: 'rounded',
    filesSelected: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[420px]">
        <josanz-file-upload
          [title]="title"
          [description]="description"
          [accept]="accept"
          [multiple]="multiple"
          [disabled]="disabled"
          [shape]="shape"
          [customColor]="customColor"
          (filesSelected)="filesSelected($event)"
        ></josanz-file-upload>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Archivo único, múltiple, deshabilitado y color personalizado.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[840px] gap-5 md:grid-cols-2">
        <josanz-file-upload title="Factura PDF" description="Solo archivos .pdf" accept=".pdf"></josanz-file-upload>
        <josanz-file-upload title="Galería de daños" description="Selecciona varias fotos" accept="image/*" [multiple]="true"></josanz-file-upload>
        <josanz-file-upload title="Subida bloqueada" description="La orden ya está cerrada" [disabled]="true"></josanz-file-upload>
        <josanz-file-upload title="Importar CSV" description="Campaña con acento personalizado" accept=".csv" shape="pill" customColor="#10b981"></josanz-file-upload>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    title: 'Adjuntar factura',
    description: 'Selecciona un PDF de prueba.',
    accept: '.pdf',
    filesSelected: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[420px]">
        <josanz-file-upload
          [title]="title"
          [description]="description"
          [accept]="accept"
          (filesSelected)="filesSelected($event)"
        ></josanz-file-upload>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const file = new File(['factura'], 'factura.pdf', { type: 'application/pdf' });
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    await expect(args.filesSelected).toHaveBeenCalled();
    await expect(canvas.getByText(/factura\.pdf/i)).toBeVisible();
  },
};
