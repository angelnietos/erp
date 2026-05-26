import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { EmptyStateComponent, type JosanzEmptyStateIcon } from './empty-state';

const meta: Meta<EmptyStateComponent> = {
  component: EmptyStateComponent,
  title: 'Josanz UI / Empty State',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Estado vacío reutilizable para listados, búsquedas, documentos y errores. Usa tokens del tema, respeta `shape`, admite color de marca y expone acciones primaria/secundaria.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    eyebrow: { control: 'text', description: 'Texto contextual superior' },
    title: { control: 'text', description: 'Título principal' },
    description: { control: 'text', description: 'Descripción de ayuda' },
    icon: sbRadio(
      ['search', 'documents', 'users', 'calendar', 'error', 'inbox'] as readonly JosanzEmptyStateIcon[],
      'Icono semántico',
    ),
    primaryLabel: { control: 'text', description: 'Etiqueta de acción primaria' },
    secondaryLabel: { control: 'text', description: 'Etiqueta de acción secundaria' },
    showPrimaryIcon: { control: 'boolean', description: 'Muestra icono + en acción primaria' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de acento para icono y acciones' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible del estado' },
    primaryAction: sbEmit('primaryAction', 'Click en acción primaria'),
    secondaryAction: sbEmit('secondaryAction', 'Click en acción secundaria'),
  },
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Playground: Story = {
  args: {
    eyebrow: 'Clientes',
    title: 'No hay clientes con estos filtros',
    description: 'Prueba con otra búsqueda o crea un nuevo cliente para empezar a trabajar.',
    icon: 'search',
    primaryLabel: 'Nuevo cliente',
    secondaryLabel: 'Limpiar filtros',
    showPrimaryIcon: true,
    shape: 'rounded',
    customColor: '',
    ariaLabel: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="p-6" style="background: var(--josanz-bg);">
        <josanz-empty-state
          [eyebrow]="eyebrow"
          [title]="title"
          [description]="description"
          [icon]="icon"
          [primaryLabel]="primaryLabel"
          [secondaryLabel]="secondaryLabel"
          [showPrimaryIcon]="showPrimaryIcon"
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (primaryAction)="primaryAction($event)"
          (secondaryAction)="secondaryAction($event)"
        ></josanz-empty-state>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos comunes de producto: búsqueda sin resultados, documentos vacíos, calendario sin eventos y error recuperable.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid max-w-7xl gap-5 p-4 lg:grid-cols-2" style="background: var(--josanz-bg);">
        <josanz-empty-state
          eyebrow="Clientes"
          title="Sin resultados"
          description="No encontramos clientes que coincidan con “Nova”. Ajusta los filtros o crea uno nuevo."
          icon="search"
          primaryLabel="Nuevo cliente"
          secondaryLabel="Limpiar filtros"
        ></josanz-empty-state>

        <josanz-empty-state
          eyebrow="Documentos"
          title="Aún no hay adjuntos"
          description="Sube contratos, presupuestos o anexos para mantener la ficha completa."
          icon="documents"
          primaryLabel="Subir documento"
          customColor="#635BFF"
          shape="pill"
        ></josanz-empty-state>

        <josanz-empty-state
          eyebrow="Eventos"
          title="Agenda despejada"
          description="No hay eventos programados para esta semana. Puedes crear un evento o revisar otro rango."
          icon="calendar"
          primaryLabel="Crear evento"
          secondaryLabel="Cambiar rango"
          customColor="var(--josanz-success)"
        ></josanz-empty-state>

        <josanz-empty-state
          eyebrow="Error"
          title="No se pudo cargar la información"
          description="La conexión ha tardado más de lo esperado. Reintenta la carga o vuelve al listado."
          icon="error"
          primaryLabel="Reintentar"
          secondaryLabel="Volver"
          customColor="var(--josanz-danger)"
          shape="square"
        ></josanz-empty-state>
      </div>
    `,
  }),
};

export const InteractiveActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pulsa ambas acciones y valida que el componente emite los eventos esperados.',
      },
    },
  },
  args: {
    eyebrow: 'Clientes',
    title: 'No hay clientes',
    description: 'Crea el primer cliente o vuelve al listado general.',
    icon: 'users',
    primaryLabel: 'Nuevo cliente',
    secondaryLabel: 'Volver',
    showPrimaryIcon: true,
    shape: 'rounded',
    primaryAction: fn(),
    secondaryAction: fn(),
  },
  render: Playground.render,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /volver/i }));
    await userEvent.click(canvas.getByRole('button', { name: /nuevo cliente/i }));
    await expect(args.secondaryAction).toHaveBeenCalledTimes(1);
    await expect(args.primaryAction).toHaveBeenCalledTimes(1);
  },
};
