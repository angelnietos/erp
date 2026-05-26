import type { Meta, StoryObj } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { TimelineComponent, type JosanzTimelineItem } from './timeline';

const readOnlyOutputNote = String(sbEmit('timelineReadOnly', 'Componente presentacional sin @Output.').description);

const meta: Meta<TimelineComponent> = {
  component: TimelineComponent,
  title: 'Josanz UI / Data / Timeline',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          `Timeline vertical para histórico de actividad, auditoría y seguimiento operativo. ${readOnlyOutputNote} Los tonos se resuelven con tokens \`primary\`, \`success\`, \`warning\`, \`danger\` y \`neutral\`.`,
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Título opcional del timeline' },
    items: { control: 'object', description: 'Eventos cronológicos' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
  },
};

export default meta;
type Story = StoryObj<TimelineComponent>;

const serviceItems: JosanzTimelineItem[] = [
  {
    id: 'created',
    title: 'Orden creada',
    description: 'Recepción registró la entrada del vehículo y abrió el expediente.',
    timestamp: '08:32',
    tone: 'primary',
  },
  {
    id: 'diagnosis',
    title: 'Diagnóstico completado',
    description: 'El técnico identificó desgaste en pastillas delanteras y fuga menor.',
    timestamp: '10:15',
    tone: 'success',
  },
  {
    id: 'approval',
    title: 'Pendiente de aprobación',
    description: 'Presupuesto enviado al cliente para autorización antes de continuar.',
    timestamp: '11:05',
    tone: 'warning',
  },
  {
    id: 'blocked',
    title: 'Pieza sin stock',
    description: 'Recambio solicitado al proveedor; fecha estimada de llegada mañana.',
    timestamp: '12:40',
    tone: 'danger',
  },
];

export const Playground: Story = {
  args: {
    title: 'Seguimiento de orden',
    items: serviceItems,
    ariaLabel: 'Histórico de eventos de orden',
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Estados visuales: todos los tonos, eventos compactos y timeline sin timestamps.',
      },
    },
  },
  render: () => ({
    props: {
      serviceItems,
      toneItems: [
        { id: 'primary', title: 'Primary', description: 'Evento informativo principal.', tone: 'primary' },
        { id: 'success', title: 'Success', description: 'Evento completado correctamente.', tone: 'success' },
        { id: 'warning', title: 'Warning', description: 'Evento que requiere atención.', tone: 'warning' },
        { id: 'danger', title: 'Danger', description: 'Bloqueo o incidencia crítica.', tone: 'danger' },
        { id: 'neutral', title: 'Neutral', description: 'Nota secundaria o registro de sistema.', tone: 'neutral' },
      ] satisfies JosanzTimelineItem[],
      compactItems: serviceItems.map(({ id, title, tone }) => ({ id, title, tone })),
    },
    template: `
      <div class="grid w-[min(1000px,calc(100vw-2rem))] gap-6 lg:grid-cols-3">
        <section class="rounded-3xl border border-solid p-6 lg:col-span-2" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-timeline title="Tonos completos" [items]="toneItems"></josanz-timeline>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-timeline title="Compacto" [items]="compactItems"></josanz-timeline>
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
        story: 'Casos reales para actividad de órdenes, auditoría de cliente y pasos de entrega.',
      },
    },
  },
  render: () => ({
    props: {
      serviceItems,
      auditItems: [
        {
          id: 'profile',
          title: 'Ficha actualizada',
          description: 'Se modificó el teléfono de contacto principal.',
          timestamp: 'Ayer',
          tone: 'neutral',
        },
        {
          id: 'consent',
          title: 'Consentimiento firmado',
          description: 'El cliente aceptó comunicaciones por email.',
          timestamp: 'Hoy',
          tone: 'success',
        },
        {
          id: 'risk',
          title: 'Validación requerida',
          description: 'Importe acumulado supera el límite operativo del mes.',
          timestamp: 'Ahora',
          tone: 'warning',
        },
      ] satisfies JosanzTimelineItem[],
    },
    template: `
      <div class="grid w-[min(980px,calc(100vw-2rem))] gap-6 md:grid-cols-2">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-timeline title="Orden de taller" [items]="serviceItems"></josanz-timeline>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-timeline title="Auditoría de cliente" [items]="auditItems"></josanz-timeline>
        </section>
      </div>
    `,
  }),
};
