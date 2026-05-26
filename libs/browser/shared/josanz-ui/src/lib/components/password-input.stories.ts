import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  josanzStoryThemeDescription,
  sbEmit,
  sbShapeArgTypes,
} from '../../../.storybook/story-arg-types';
import { PasswordInputComponent } from './password-input';

const meta: Meta<PasswordInputComponent> = {
  component: PasswordInputComponent,
  title: 'Josanz UI / Password Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Campo de contraseña con botón mostrar/ocultar, indicador opcional de fortaleza y ControlValueAccessor.',
        ),
      },
    },
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta superior' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    hint: { control: 'text', description: 'Ayuda bajo el campo' },
    error: { control: 'text', description: 'Mensaje de error' },
    value: { control: 'text', description: 'Valor actual' },
    autocomplete: { control: 'text', description: 'Atributo autocomplete' },
    showStrength: { control: 'boolean', description: 'Mostrar medidor de fortaleza' },
    valueChange: sbEmit('valueChange', 'Cambio de contraseña'),
    ...sbShapeArgTypes,
  },
};

export default meta;
type Story = StoryObj<PasswordInputComponent>;

export const Playground: Story = {
  args: {
    label: 'Contraseña',
    placeholder: 'Mínimo 8 caracteres',
    hint: 'Usa letras, números y símbolos.',
    value: 'Josanz2026!',
    autocomplete: 'new-password',
    showStrength: true,
    shape: 'rounded',
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[400px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-password-input
          [label]="label"
          [placeholder]="placeholder"
          [hint]="hint"
          [error]="error"
          [value]="value"
          [autocomplete]="autocomplete"
          [shape]="shape"
          [customColor]="customColor"
          [showStrength]="showStrength"
          (valueChange)="valueChange($event)"
        ></josanz-password-input>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Estados con y sin fortaleza, error y variante `shape="pill"`.' },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[760px] gap-5 md:grid-cols-2">
        <josanz-password-input label="PIN supervisor" placeholder="4 dígitos" autocomplete="one-time-code" hint="No se muestra fortaleza."></josanz-password-input>
        <josanz-password-input label="Nueva contraseña" value="Taller2026!" [showStrength]="true" hint="Medidor activado."></josanz-password-input>
        <josanz-password-input label="Contraseña actual" value="abc" error="La contraseña no coincide."></josanz-password-input>
        <josanz-password-input label="Clave API" value="Josanz-api-2026!" shape="pill" customColor="#8b5cf6" [showStrength]="true"></josanz-password-input>
      </div>
    `,
  }),
};

export const ShowStrength: Story = {
  args: {
    label: 'Crear contraseña',
    value: 'Aa123456!',
    showStrength: true,
    hint: 'La fortaleza se recalcula al escribir.',
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[400px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-password-input
          [label]="label"
          [value]="value"
          [hint]="hint"
          [showStrength]="showStrength"
          (valueChange)="valueChange($event)"
        ></josanz-password-input>
      </div>
    `,
  }),
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Contraseñas en distintos flujos: acceso de usuario, clave API y PIN de supervisor.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="grid w-[min(900px,calc(100vw-2rem))] gap-5 md:grid-cols-3">
        <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-3 text-xs font-black uppercase tracking-wide" style="color: var(--josanz-text-muted);">Cuenta de usuario</p>
          <josanz-password-input label="Contraseña" placeholder="Mínimo 8 caracteres" [showStrength]="true" hint="Acceso al ERP y apps móviles."></josanz-password-input>
        </div>
        <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-3 text-xs font-black uppercase tracking-wide" style="color: var(--josanz-text-muted);">Integración API</p>
          <josanz-password-input label="Clave API" value="josanz_live_••••••••" shape="pill" customColor="#8b5cf6" autocomplete="off"></josanz-password-input>
        </div>
        <div class="rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <p class="m-0 mb-3 text-xs font-black uppercase tracking-wide" style="color: var(--josanz-text-muted);">Supervisor</p>
          <josanz-password-input label="PIN de autorización" placeholder="4 dígitos" autocomplete="one-time-code" hint="Anular descuento o cerrar orden con incidencia."></josanz-password-input>
        </div>
      </div>
    `,
  }),
};

export const Interactive: Story = {
  args: {
    label: 'Contraseña temporal',
    showStrength: true,
    valueChange: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[400px] rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-password-input
          [label]="label"
          [showStrength]="showStrength"
          (valueChange)="valueChange($event)"
        ></josanz-password-input>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText(/contraseña temporal/i);
    await userEvent.type(password, 'Aa123456!');
    await expect(args.valueChange).toHaveBeenCalled();
    await expect(canvas.getByText(/muy fuerte/i)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /mostrar/i }));
    await expect(password).toHaveAttribute('type', 'text');
  },
};
