import type { Meta, StoryObj } from '@storybook/angular';
import { sbEmit, sbShapeArgTypes, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ListSearchFieldComponent } from './list-search-field';

const meta: Meta<ListSearchFieldComponent> = {
  component: ListSearchFieldComponent,
  title: 'Josanz UI / List Search Field',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Campo de búsqueda para listados. Usa `role=search`, emite `valueChange` y hereda el shape del tema salvo override. `customColor` acentúa borde y foco.',
        ),
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Texto placeholder' },
    value: { control: 'text', description: 'Valor controlado del input' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible del searchbox' },
    ...sbShapeArgTypes,
    valueChange: sbEmit('valueChange', 'Nuevo texto escrito'),
  },
};

export default meta;
type Story = StoryObj<ListSearchFieldComponent>;

export const Playground: Story = {
  args: {
    placeholder: 'Buscar clientes, CIF o email...',
    value: '',
    ariaLabel: 'Buscar clientes',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-md rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-search-field
          [placeholder]="placeholder"
          [value]="value"
          [ariaLabel]="ariaLabel"
          [shape]="shape"
          [customColor]="customColor"
          (valueChange)="valueChange($event)"
        ></josanz-list-search-field>
      </div>
    `,
  }),
};

export const SearchStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados habituales: vacío, con búsqueda activa y variaciones de shape.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-list-search-field placeholder="Buscar..." ariaLabel="Búsqueda vacía"></josanz-list-search-field>
        <josanz-list-search-field value="Novabyte" placeholder="Buscar cliente" ariaLabel="Búsqueda con valor"></josanz-list-search-field>
        <josanz-list-search-field shape="pill" placeholder="Búsqueda pill"></josanz-list-search-field>
        <josanz-list-search-field shape="square" placeholder="Búsqueda square"></josanz-list-search-field>
        <josanz-list-search-field value="Marca" customColor="#635BFF" placeholder="Acento personalizado"></josanz-list-search-field>
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
          'Buscadores contextualizados: clientes, eventos, facturas y documentos con placeholders específicos.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-5 rounded-3xl border border-solid p-6 md:grid-cols-2" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <section class="space-y-3">
          <h4 class="m-0 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Clientes</h4>
          <josanz-list-search-field value="Nova" placeholder="Buscar por cliente, CIF o email..." ariaLabel="Buscar clientes"></josanz-list-search-field>
        </section>
        <section class="space-y-3">
          <h4 class="m-0 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Eventos</h4>
          <josanz-list-search-field placeholder="Buscar evento, ciudad o responsable..." ariaLabel="Buscar eventos" shape="pill"></josanz-list-search-field>
        </section>
        <section class="space-y-3">
          <h4 class="m-0 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Facturación</h4>
          <josanz-list-search-field value="INV-2026" placeholder="Buscar factura o importe..." ariaLabel="Buscar facturas" customColor="var(--josanz-success)"></josanz-list-search-field>
        </section>
        <section class="space-y-3">
          <h4 class="m-0 text-xs font-black uppercase tracking-widest" style="color: var(--josanz-text-muted);">Documentos</h4>
          <josanz-list-search-field placeholder="Buscar contrato, anexo o PDF..." ariaLabel="Buscar documentos" shape="square" customColor="#635BFF"></josanz-list-search-field>
        </section>
      </div>
    `,
  }),
};
