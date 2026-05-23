import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { SwitchComponent } from './switch';

const meta: Meta<SwitchComponent> = {
  component: SwitchComponent,
  title: 'Josanz UI / Switch',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Interruptor accesible con `role="switch"` y ControlValueAccessor para booleanos de configuración, preferencias y flags operativos.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Texto principal' },
    description: { control: 'text', description: 'Texto descriptivo' },
    checked: { control: 'boolean', description: 'Estado activo' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    customColor: { control: 'color', description: 'Color del estado activo' },
    ariaLabel: { control: 'text', description: 'Etiqueta accesible alternativa' },
    checkedChange: sbEmit('checkedChange', 'Cambio de estado'),
  },
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Playground: Story = {
  args: {
    label: 'Avisos automáticos',
    description: 'Notificar al cliente cuando cambie el estado.',
    checked: true,
    disabled: false,
    checkedChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[360px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-switch
          [label]="label"
          [description]="description"
          [checked]="checked"
          [disabled]="disabled"
          [customColor]="customColor"
          [ariaLabel]="ariaLabel"
          (checkedChange)="checkedChange($event)"
        ></josanz-switch>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Activo, inactivo, deshabilitado y con acento de marca alternativo.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[720px] gap-5 md:grid-cols-2">
        <josanz-switch label="Recordatorios" description="Enviar aviso 24h antes." [checked]="true"></josanz-switch>
        <josanz-switch label="Modo borrador" description="No publicar cambios todavía."></josanz-switch>
        <josanz-switch label="Integración bloqueada" description="Gestionado desde administración." [checked]="true" [disabled]="true"></josanz-switch>
        <josanz-switch label="Canal premium" description="Color personalizado para planes activos." customColor="#8b5cf6" [checked]="true"></josanz-switch>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Publicar automáticamente',
    description: 'Activa la publicación al cerrar la revisión.',
    checkedChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[380px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-switch
          [label]="label"
          [description]="description"
          (checkedChange)="checkedChange($event)"
        ></josanz-switch>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: /publicar automáticamente/i });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(toggle);
    await expect(args.checkedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};
