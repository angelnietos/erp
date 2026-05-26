import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { CheckboxComponent } from './checkbox';

const meta: Meta<CheckboxComponent> = {
  component: CheckboxComponent,
  title: 'Josanz UI / Checkbox',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Checkbox CVA para preferencias, permisos y confirmaciones. Usa `shape` para la caja y `customColor` para el estado activo.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto principal' },
    description: { control: 'text', description: 'Ayuda secundaria' },
    checked: { control: 'boolean', description: 'Estado marcado' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    checkedChange: sbEmit('checkedChange', 'Cambio de selección'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Playground: Story = {
  args: {
    label: 'Aceptar condiciones',
    description: 'Confirmo que los datos del cliente son correctos.',
    checked: false,
    disabled: false,
    shape: 'rounded',
    checkedChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[360px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-checkbox
          [label]="label"
          [description]="description"
          [checked]="checked"
          [disabled]="disabled"
          [shape]="shape"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (checkedChange)="checkedChange($event)"
        ></josanz-checkbox>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Marcado, sin marcar, deshabilitado y acento personalizado.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[720px] gap-5 md:grid-cols-2">
        <josanz-checkbox label="Enviar copia por email" description="El cliente recibirá el justificante." [checked]="true"></josanz-checkbox>
        <josanz-checkbox label="Marcar como urgente" description="Prioriza la orden en el listado."></josanz-checkbox>
        <josanz-checkbox label="Permiso bloqueado" description="Solo perfiles admin pueden editarlo." [checked]="true" [disabled]="true"></josanz-checkbox>
        <josanz-checkbox label="Canal WhatsApp" description="Color de marca personalizado." shape="pill" customColor="#10b981" [checked]="true"></josanz-checkbox>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Avisar al cliente',
    description: 'Enviar notificación al cerrar la orden.',
    checkedChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[340px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-checkbox
          [label]="label"
          [description]="description"
          (checkedChange)="checkedChange($event)"
        ></josanz-checkbox>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: /avisar al cliente/i }));
    await expect(args.checkedChange).toHaveBeenCalledWith(true);
  },
};
