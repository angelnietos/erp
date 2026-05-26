import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbRadio,
} from '../../../.storybook/story-arg-types';
import { RadioGroupComponent } from './radio-group';

const workshopOptions = [
  { label: 'Recepción', value: 'reception', description: 'Entrada y validación inicial.' },
  { label: 'Taller', value: 'workshop', description: 'Diagnóstico y reparación.' },
  { label: 'Facturación', value: 'billing', description: 'Cierre administrativo.' },
];

const meta: Meta<RadioGroupComponent> = {
  component: RadioGroupComponent,
  title: 'Josanz UI / Radio Group',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Grupo de opciones exclusivas con orientación vertical u horizontal. Emite el valor y la opción completa seleccionada.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Leyenda del grupo' },
    options: { control: 'object', description: 'Opciones disponibles' },
    value: { control: 'text', description: 'Valor seleccionado' },
    name: { control: 'text', description: 'Nombre HTML del grupo' },
    orientation: sbRadio(['vertical', 'horizontal'] as const, 'Distribución visual'),
    customColor: { control: 'color', description: 'Acento del radio activo' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    valueChange: sbEmit('valueChange', 'Cambio de valor'),
    optionSelect: sbEmit('optionSelect', 'Opción seleccionada'),
  },
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

export const Playground: Story = {
  args: {
    label: 'Estado de la orden',
    options: workshopOptions,
    value: 'workshop',
    orientation: 'vertical',
    customColor: '#2563eb',
    valueChange: fn(),
    optionSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[460px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-radio-group
          [label]="label"
          [options]="options"
          [value]="value"
          [name]="name"
          [orientation]="orientation"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (valueChange)="valueChange($event)"
          (optionSelect)="optionSelect($event)"
        ></josanz-radio-group>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Orientación vertical, horizontal, opción deshabilitada y color de marca local.' },
    },
  },
  render: () => ({
    props: {
      workshopOptions,
      priorityOptions: [
        { label: 'Normal', value: 'normal', description: 'SLA estándar.' },
        { label: 'Urgente', value: 'urgent', description: 'Atención prioritaria.' },
        { label: 'Bloqueada', value: 'blocked', description: 'No disponible para este cliente.', disabled: true },
      ],
    },
    template: `
      <div class="grid w-[820px] gap-6">
        <josanz-radio-group label="Flujo de trabajo" [options]="workshopOptions" value="reception"></josanz-radio-group>
        <josanz-radio-group label="Prioridad" [options]="priorityOptions" value="urgent" orientation="horizontal" customColor="#f97316"></josanz-radio-group>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Canal de contacto',
    options: [
      { label: 'Teléfono', value: 'phone', description: 'Llamada directa.' },
      { label: 'Email', value: 'email', description: 'Confirmación por correo.' },
      { label: 'WhatsApp', value: 'whatsapp', description: 'Mensaje rápido.' },
    ],
    value: 'email',
    valueChange: fn(),
    optionSelect: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[420px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-radio-group
          [label]="label"
          [options]="options"
          [value]="value"
          (valueChange)="valueChange($event)"
          (optionSelect)="optionSelect($event)"
        ></josanz-radio-group>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /whatsapp/i }));
    await expect(args.valueChange).toHaveBeenCalledWith('whatsapp');
    await expect(args.optionSelect).toHaveBeenCalled();
  },
};
