import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { sbRadio, sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { MainTabsComponent } from './main-tabs';

const meta: Meta<MainTabsComponent> = {
  component: MainTabsComponent,
  title: 'Josanz UI / Main Tabs',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Pestañas tipo “segmented control”: fondo de cada pestaña = `surface`, inactivos en `textMuted`, activos con borde y color de marca. `shape` y `customColor` opcionales.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Lista de opciones (array de strings). Editable como JSON en Controls.',
    },
    selection: { control: 'text', description: 'Pestaña activa (debe existir en `options`)' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas del grupo y de cada pestaña'),
    customColor: { control: 'color', description: 'Color del texto de la pestaña activa' },
    selectionChange: sbEmit('selectionChange', 'Nueva pestaña seleccionada'),
  },
};

export default meta;
type Story = StoryObj<MainTabsComponent>;

export const Playground: Story = {
  args: {
    options: ['General', 'Seguridad', 'Facturación', 'Usuarios'],
    selection: 'General',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-3xl">
        <josanz-main-tabs
          [options]="options"
          [selection]="selection"
          [shape]="shape"
          [customColor]="customColor"
          (selectionChange)="selectionChange($event)"
        ></josanz-main-tabs>
      </div>
    `,
  }),
};

export const NavigationExamples: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Dos layouts típicos: ficha de cliente y configuración de flota.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-12 p-10 bg-white shadow-inner rounded-3xl max-w-4xl">
        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Ficha de cliente</h4>
          <josanz-main-tabs
            [options]="['Datos Básicos', 'Operadores', 'Presupuestos', 'Facturas', 'Archivos']"
            selection="Datos Básicos"
          ></josanz-main-tabs>
        </section>

        <section>
          <h4 class="text-slate-300 text-xs font-bold uppercase tracking-widest mb-6">Configuración de flota</h4>
          <josanz-main-tabs
            [options]="['Vehículos', 'Conductores', 'Rutas', 'Mantenimiento']"
            selection="Vehículos"
          ></josanz-main-tabs>
        </section>
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
          'Tabs por contexto: ficha de cliente, detalle de evento y ajustes de aplicación.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-6 rounded-3xl p-6" style="background: var(--josanz-bg);">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-5 mt-0 text-sm font-black" style="color: var(--josanz-text);">Ficha de cliente</h4>
          <josanz-main-tabs [options]="['Datos', 'Operadores', 'Presupuestos', 'Facturas', 'Archivos']" selection="Datos"></josanz-main-tabs>
        </section>
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-5 mt-0 text-sm font-black" style="color: var(--josanz-text);">Evento</h4>
          <josanz-main-tabs [options]="['Resumen', 'Presupuesto', 'Equipo', 'Documentos']" selection="Presupuesto" shape="pill" customColor="#635BFF"></josanz-main-tabs>
        </section>
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h4 class="mb-5 mt-0 text-sm font-black" style="color: var(--josanz-text);">Ajustes</h4>
          <josanz-main-tabs [options]="['General', 'Personalización']" selection="Personalización" shape="square"></josanz-main-tabs>
        </section>
      </div>
    `,
  }),
};

export const InteractiveSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interaction test: al pulsar una pestaña, la story actualiza `selection` y muestra el contenido activo.',
      },
    },
  },
  args: {
    options: ['General', 'Seguridad', 'Facturación', 'Usuarios'],
    selection: 'General',
    shape: 'rounded',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-3xl rounded-2xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-main-tabs
          [options]="options"
          [selection]="selection"
          [shape]="shape"
          [customColor]="customColor"
          (selectionChange)="selection = $event; selectionChange($event)"
        ></josanz-main-tabs>
        <p data-testid="active-tab" class="m-0 text-sm font-bold" style="color: var(--josanz-text);">
          Activa: {{ selection }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('active-tab')).toHaveTextContent('Activa: General');
    await userEvent.click(canvas.getByRole('button', { name: 'Facturación' }));
    await expect(canvas.getByTestId('active-tab')).toHaveTextContent('Activa: Facturación');
  },
};
