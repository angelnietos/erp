import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit, sbRadio } from '../../../.storybook/story-arg-types';
import { AccordionComponent, type JosanzAccordionItem } from './accordion';

const meta: Meta<AccordionComponent> = {
  component: AccordionComponent,
  title: 'Josanz UI / Data / Accordion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Acordeón para agrupar información progresiva: modo exclusivo o múltiple, soporte de items deshabilitados, `shape` global/local y color de acento personalizable. Emite `openIdsChange` e `itemToggle`.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text', description: 'Título opcional del grupo' },
    items: { control: 'object', description: 'Paneles del acordeón' },
    openIds: { control: 'object', description: 'IDs abiertos' },
    multiple: { control: 'boolean', description: 'Permite abrir varios paneles' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Forma de cada panel'),
    customColor: { control: 'color', description: 'Color local para el acento abierto' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    openIdsChange: sbEmit('openIdsChange', 'Cambio de paneles abiertos'),
    itemToggle: sbEmit('itemToggle', 'Panel pulsado'),
  },
};

export default meta;
type Story = StoryObj<AccordionComponent>;

const items: JosanzAccordionItem[] = [
  {
    id: 'datos',
    eyebrow: 'Paso 1',
    title: 'Datos del cliente',
    content: 'Comprueba nombre fiscal, NIF, persona de contacto y preferencias de comunicación.',
  },
  {
    id: 'vehiculo',
    eyebrow: 'Paso 2',
    title: 'Vehículo y kilometraje',
    content: 'Registra matrícula, bastidor, lectura de kilometraje y observaciones del asesor.',
  },
  {
    id: 'facturacion',
    eyebrow: 'Paso 3',
    title: 'Facturación',
    content: 'Valida forma de pago, descuentos aplicados y vencimiento antes de cerrar la orden.',
  },
  {
    id: 'bloqueado',
    eyebrow: 'Bloqueado',
    title: 'Garantía pendiente',
    content: 'Este panel queda inactivo hasta recibir autorización del fabricante.',
    disabled: true,
  },
];

export const Playground: Story = {
  args: {
    title: 'Alta de orden',
    items,
    openIds: ['datos'],
    multiple: false,
    shape: 'rounded',
    customColor: '#0ea5e9',
    ariaLabel: 'Secciones de alta de orden',
    openIdsChange: fn(),
    itemToggle: fn(),
  },
};

export const VariantStates: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Variantes de estado: apertura exclusiva, múltiple, panel deshabilitado y formas visuales.',
      },
    },
  },
  render: () => ({
    props: { items },
    template: `
      <div class="grid w-[min(920px,calc(100vw-2rem))] gap-6 md:grid-cols-2">
        <josanz-accordion
          title="Exclusivo"
          [items]="items"
          [openIds]="['datos']"
          [multiple]="false"
        ></josanz-accordion>

        <josanz-accordion
          title="Multiple"
          [items]="items"
          [openIds]="['datos', 'facturacion']"
          [multiple]="true"
          shape="pill"
          customColor="#10b981"
        ></josanz-accordion>

        <josanz-accordion
          title="Square"
          [items]="items.slice(0, 3)"
          [openIds]="['vehiculo']"
          shape="square"
          customColor="#f59e0b"
        ></josanz-accordion>

        <josanz-accordion
          title="Todos cerrados"
          [items]="items"
          [openIds]="[]"
          [multiple]="true"
          customColor="#8b5cf6"
        ></josanz-accordion>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Casos reales: checklist de alta, FAQ de soporte y desglose de una orden.',
      },
    },
  },
  render: () => ({
    props: {
      onboarding: items,
      faq: [
        {
          id: 'sla',
          title: '¿Cuándo vence el SLA?',
          content: 'Las órdenes urgentes vencen en 24 horas; las estándar en 72 horas laborables.',
        },
        {
          id: 'docs',
          title: '¿Qué documentos son obligatorios?',
          content: 'Parte firmado, fotos del vehículo y presupuesto aceptado si supera el umbral configurado.',
        },
      ],
    },
    template: `
      <div class="grid w-[min(980px,calc(100vw-2rem))] gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-accordion title="Checklist operativo" [items]="onboarding" [openIds]="['datos']"></josanz-accordion>
        </section>

        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-accordion title="FAQ interna" [items]="faq" [openIds]="['sla']" [multiple]="true" shape="pill"></josanz-accordion>
        </section>
      </div>
    `,
  }),
};

export const InteractiveToggle: Story = {
  args: {
    title: 'Acordeón interactivo',
    items,
    openIds: ['datos'],
    multiple: true,
    openIdsChange: fn(),
    itemToggle: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /facturación/i }));
    await expect(args.openIdsChange).toHaveBeenCalledWith(['datos', 'facturacion']);
    await expect(args.itemToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'facturacion' }));

    await userEvent.click(canvas.getByRole('button', { name: /garantía pendiente/i }));
    await expect(args.itemToggle).toHaveBeenCalledTimes(1);
  },
};
