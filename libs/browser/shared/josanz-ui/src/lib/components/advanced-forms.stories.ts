import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { FileUploadComponent } from './file-upload';
import { AutocompleteComponent } from './autocomplete';
import { MultiSelectComponent } from './multi-select';

const meta: Meta = {
  title: 'Josanz UI / Forms / Advanced',
  decorators: [
    moduleMetadata({
      imports: [
        FileUploadComponent,
        AutocompleteComponent,
        MultiSelectComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Formularios avanzados: file upload, autocomplete y multi-select para flujos reales de backoffice.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

const clients = [
  { label: 'NovaByte', value: 'novabyte', description: 'Cliente activo' },
  { label: 'Auralux', value: 'auralux', description: 'Lead comercial' },
  {
    label: 'Eventos del Sur',
    value: 'eventos-sur',
    description: 'Evento en producción',
  },
  {
    label: 'Retail Max',
    value: 'retail-max',
    description: 'Facturación pendiente',
  },
];

const tags = [
  { label: 'Sonido', value: 'sonido' },
  { label: 'Iluminación', value: 'iluminacion' },
  { label: 'Streaming', value: 'streaming' },
  { label: 'Escenario', value: 'escenario' },
];

export const AdvancedFormSuite: Story = {
  args: {
    queryChange: fn(),
    optionSelect: fn(),
    valuesChange: fn(),
    filesSelected: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      clients,
      tags,
    },
    template: `
      <section class="grid max-w-4xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="grid gap-5 md:grid-cols-2">
          <josanz-autocomplete label="Cliente" placeholder="Buscar cliente..." [options]="clients" customColor="#635BFF" (queryChange)="queryChange($event)" (optionSelect)="optionSelect($event)"></josanz-autocomplete>
          <josanz-multi-select label="Servicios" [options]="tags" [values]="['sonido', 'streaming']" customColor="#635BFF" (valuesChange)="valuesChange($event)"></josanz-multi-select>
        </div>
        <josanz-file-upload title="Subir documentación" description="PDF, DOCX o imágenes del evento" accept=".pdf,.doc,.docx,image/*" [multiple]="true" customColor="#635BFF" (filesSelected)="filesSelected($event)"></josanz-file-upload>
      </section>
    `,
  }),
};

export const InteractiveAutocomplete: Story = {
  args: {
    optionSelect: fn(),
  },
  render: (args) => ({
    props: { ...args, clients },
    template: `<josanz-autocomplete label="Cliente" [options]="clients" (optionSelect)="optionSelect($event)"></josanz-autocomplete>`,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/cliente/i), 'Nova');
    await userEvent.click(canvas.getByRole('button', { name: /NovaByte/i }));
    await expect(args['optionSelect']).toHaveBeenCalledTimes(1);
  },
};
