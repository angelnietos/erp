import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { AutocompleteComponent } from './autocomplete';

const clientOptions = [
  { label: 'NovaByte S.L.', value: 'novabyte', description: 'Madrid · CIF B12345678' },
  { label: 'Talleres Norte', value: 'norte', description: 'Bilbao · Cliente preferente' },
  { label: 'Auto Rapid Valencia', value: 'rapid-vlc', description: 'Valencia · 12 órdenes' },
  { label: 'Logística Mediterráneo', value: 'med', description: 'Alicante · Cuenta empresa' },
  { label: 'Servicios Delta', value: 'delta', description: 'Sevilla · Facturación mensual' },
  { label: 'Repuestos Central', value: 'central', description: 'Proveedor habitual' },
  { label: 'North Motors', value: 'north-motors', description: 'Barcelona · Flota' },
];

const meta: Meta<AutocompleteComponent> = {
  component: AutocompleteComponent,
  title: 'Josanz UI / Autocomplete',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Autocomplete filtrado en cliente con lista flotante, descripciones y eventos separados para query y selección.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Placeholder del buscador' },
    query: { control: 'text', description: 'Texto actual de búsqueda' },
    options: { control: 'object', description: 'Opciones filtrables' },
    customColor: { control: 'color', description: 'Acento de foco' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    queryChange: sbEmit('queryChange', 'Cambio de búsqueda'),
    optionSelect: sbEmit('optionSelect', 'Opción elegida'),
  },
};

export default meta;
type Story = StoryObj<AutocompleteComponent>;

export const Playground: Story = {
  args: {
    label: 'Cliente',
    placeholder: 'Buscar cliente...',
    query: '',
    options: clientOptions,
    queryChange: fn(),
    optionSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[420px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-autocomplete
          [label]="label"
          [placeholder]="placeholder"
          [query]="query"
          [options]="options"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (queryChange)="queryChange($event)"
          (optionSelect)="optionSelect($event)"
        ></josanz-autocomplete>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Lista inicial, filtro con coincidencias y estado sin resultados.' },
    },
  },
  render: () => ({
    props: { clientOptions },
    template: `
      <div class="grid w-[820px] gap-5 md:grid-cols-2">
        <josanz-autocomplete label="Cliente" placeholder="Foco para ver opciones..." [options]="clientOptions"></josanz-autocomplete>
        <josanz-autocomplete label="Búsqueda filtrada" query="Auto" [options]="clientOptions" customColor="#10b981"></josanz-autocomplete>
        <josanz-autocomplete label="Sin coincidencias" query="zzz" [options]="clientOptions"></josanz-autocomplete>
        <josanz-autocomplete label="Proveedor" placeholder="Buscar proveedor..." [options]="clientOptions" customColor="#8b5cf6"></josanz-autocomplete>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Buscar cliente',
    placeholder: 'Escribe para filtrar...',
    options: clientOptions,
    queryChange: fn(),
    optionSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[430px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-autocomplete
          [label]="label"
          [placeholder]="placeholder"
          [options]="options"
          (queryChange)="queryChange($event)"
          (optionSelect)="optionSelect($event)"
        ></josanz-autocomplete>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /buscar cliente/i }), 'Nova');
    await expect(args.queryChange).toHaveBeenCalledWith('Nova');
    await userEvent.click(canvas.getByRole('button', { name: /novabyte/i }));
    await expect(args.optionSelect).toHaveBeenCalledWith(clientOptions[0]);
  },
};
