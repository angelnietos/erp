import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import {
  sbEmit,
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { TextareaComponent } from './textarea';
import { CheckboxComponent } from './checkbox';
import { RadioGroupComponent } from './radio-group';
import { SwitchComponent } from './switch';
import { SelectComponent } from './select';

const meta: Meta = {
  title: 'Josanz UI / Forms / Controls',
  decorators: [
    moduleMetadata({
      imports: [
        TextareaComponent,
        CheckboxComponent,
        RadioGroupComponent,
        SwitchComponent,
        SelectComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Controles básicos de formulario que faltaban en la librería: textarea, checkbox, radio, switch y select.',
        ),
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj;

export const FormControlsSuite: Story = {
  args: {
    brandColor: '#635BFF',
    selectValue: 'eventos',
    radioValue: 'email',
    notes:
      'Cliente solicita refuerzo de iluminación y prueba de sonido a las 12:00.',
    accepted: true,
    enabled: true,
  },
  argTypes: {
    brandColor: { control: 'color' },
    selectValue: { control: 'text' },
    radioValue: { control: 'text' },
    notes: { control: 'text' },
    accepted: { control: 'boolean' },
    enabled: { control: 'boolean' },
  },
  render: (args) => ({
    props: {
      ...args,
      channelOptions: [
        {
          label: 'Email',
          value: 'email',
          description: 'Enviar resumen al cliente',
        },
        {
          label: 'SMS',
          value: 'sms',
          description: 'Aviso corto de confirmación',
        },
        {
          label: 'WhatsApp',
          value: 'whatsapp',
          description: 'Mensaje operativo',
        },
      ],
      moduleOptions: [
        { label: 'Clientes', value: 'clientes' },
        { label: 'Eventos', value: 'eventos' },
        { label: 'Facturación', value: 'facturacion' },
      ],
    },
    template: `
      <section class="grid max-w-4xl gap-6 rounded-3xl border border-solid p-6" [style.--josanz-primary]="brandColor" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="grid gap-5 md:grid-cols-2">
          <josanz-select
            label="Módulo"
            placeholder="Selecciona módulo"
            [options]="moduleOptions"
            [value]="selectValue"
            [customColor]="brandColor"
            hint="Select/dropdown básico"
          ></josanz-select>
          <josanz-textarea
            label="Notas internas"
            [value]="notes"
            placeholder="Escribe una nota..."
            [maxLength]="160"
            [customColor]="brandColor"
          ></josanz-textarea>
        </div>
        <josanz-radio-group label="Canal de notificación" [options]="channelOptions" [value]="radioValue" orientation="horizontal" [customColor]="brandColor"></josanz-radio-group>
        <div class="grid gap-4 md:grid-cols-2">
          <josanz-checkbox label="Acepto la política de datos" description="Requerido antes de publicar" [checked]="accepted" [customColor]="brandColor"></josanz-checkbox>
          <josanz-switch label="Notificaciones activas" description="Avisar al equipo de producción" [checked]="enabled" [customColor]="brandColor"></josanz-switch>
        </div>
      </section>
    `,
  }),
};

export const InteractiveControls: Story = {
  args: {
    checkedChange: fn(),
    valueChange: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      options: [
        { label: 'Opción A', value: 'a' },
        { label: 'Opción B', value: 'b' },
      ],
    },
    template: `
      <div class="grid max-w-md gap-4">
        <josanz-checkbox label="Activar" (checkedChange)="checkedChange($event)"></josanz-checkbox>
        <josanz-select label="Tipo" [options]="options" value="a" (valueChange)="valueChange($event)"></josanz-select>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText(/activar/i));
    await userEvent.selectOptions(canvas.getByLabelText(/tipo/i), 'b');
    await expect(args['checkedChange']).toHaveBeenCalledWith(true);
    await expect(args['valueChange']).toHaveBeenCalledWith('b');
  },
};

export const ShapeMatrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      options: [
        { label: 'Rounded', value: 'rounded' },
        { label: 'Pill', value: 'pill' },
        { label: 'Square', value: 'square' },
      ],
    },
    template: `
      <div class="grid max-w-5xl gap-5 md:grid-cols-3">
        <josanz-select label="Rounded" [options]="options" value="rounded" shape="rounded"></josanz-select>
        <josanz-select label="Pill" [options]="options" value="pill" shape="pill" customColor="#635BFF"></josanz-select>
        <josanz-select label="Square" [options]="options" value="square" shape="square"></josanz-select>
      </div>
    `,
  }),
};
