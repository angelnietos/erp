import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Josanz UI / Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Campo con etiqueta en `FormGroup` reactivo. Fondo y borde siguen `atmosphere.surface` / `atmosphere.border`; el foco usa el color de marca. `shape` y `customColor` alinean el campo con `josanz-button`. No pongas `FormGroup` en `args` de Storybook.',
        ),
      },
    },
    layout: 'centered',
  },
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    type: sbRadio(['text', 'email', 'password', 'number'] as const, 'Tipo de entrada HTML'),
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Esquinas del campo'),
    customColor: { control: 'color', description: 'Acento de foco / borde' },
    controlName: { control: 'text', description: 'Nombre del control en el FormGroup' },
    /** Nunca en `args`: Storybook serializa args a JSON y FormGroup es circular. */
    parentForm: { table: { disable: true }, control: false },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

function playgroundForm(controlName: string): FormGroup {
  const key = controlName?.trim() || 'testControl';
  return new FormGroup({
    [key]: new FormControl(''),
  });
}

export const Playground: Story = {
  args: {
    label: 'Nombre Completo',
    placeholder: 'Ej: Juan Pérez',
    type: 'text',
    controlName: 'testControl',
    shape: 'rounded',
  },
  render: (args) => {
    const parentForm = playgroundForm(args.controlName ?? 'testControl');
    return {
      props: {
        label: args.label,
        placeholder: args.placeholder,
        type: args.type,
        controlName: args.controlName,
        shape: args.shape,
        customColor: args.customColor,
        parentForm,
      },
      template: `
      <div class="p-8 bg-slate-50 max-w-sm rounded-2xl">
        <josanz-input
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [controlName]="controlName"
          [shape]="shape"
          [customColor]="customColor"
          [parentForm]="parentForm"
        ></josanz-input>
      </div>
    `,
    };
  },
};

export const ValidationError: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Campo requerido marcado como inválido y touched para mostrar el mensaje "Requerido".',
      },
    },
  },
  render: () => {
    const parentForm = new FormGroup({
      company: new FormControl('', { validators: Validators.required }),
    });
    parentForm.get('company')?.markAsTouched();
    return {
      props: {
        parentForm,
        label: 'Razón social',
        placeholder: 'Ej: NovaByte S.L.',
        controlName: 'company',
        shape: 'rounded' as const,
      },
      template: `
        <div class="max-w-sm rounded-2xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <josanz-input
            [label]="label"
            [placeholder]="placeholder"
            controlName="company"
            [shape]="shape"
            [parentForm]="parentForm"
          ></josanz-input>
        </div>
      `,
    };
  },
};

export const CommonTypes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Formulario de registro con cuatro tipos de campo a la vez.' },
    },
  },
  render: () => {
    const form = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      pass: new FormControl(''),
      age: new FormControl(''),
    });
    return {
      props: { form },
      template: `
      <div class="flex flex-col gap-8 p-8 max-w-md bg-slate-50 rounded-2xl border border-slate-100">
        <h4 class="text-slate-400 text-xs uppercase tracking-widest font-bold">Formulario de Registro</h4>
        <div class="flex flex-col gap-4">
          <josanz-input label="Nombre" placeholder="Tu nombre..." controlName="name" [parentForm]="form"></josanz-input>
          <josanz-input label="Email" type="email" placeholder="correo@ejemplo.com" controlName="email" [parentForm]="form"></josanz-input>
          <josanz-input label="Contraseña" type="password" placeholder="Mín. 8 caracteres" controlName="pass" [parentForm]="form"></josanz-input>
          <josanz-input label="Edad" type="number" placeholder="0" controlName="age" [parentForm]="form"></josanz-input>
        </div>
      </div>
    `,
    };
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Campos organizados como aparecen en alta de cliente: datos fiscales, contacto y condiciones comerciales.',
      },
    },
  },
  render: () => {
    const clientForm = new FormGroup({
      legalName: new FormControl('NovaByte S.L.', { validators: Validators.required }),
      cif: new FormControl('B-12345678'),
      email: new FormControl('facturacion@novabyte.es'),
      phone: new FormControl('910 000 123'),
      city: new FormControl('Madrid'),
      paymentDays: new FormControl('30'),
    });
    return {
      props: { clientForm },
      template: `
        <div class="max-w-4xl rounded-3xl border border-solid p-8" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <div class="mb-6">
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" style="color: var(--josanz-text-muted);">Alta de cliente</p>
            <h3 class="m-0 mt-2 text-2xl font-black" style="color: var(--josanz-text);">Datos principales</h3>
          </div>
          <div class="grid gap-x-5 md:grid-cols-2">
            <josanz-input label="Razón social" placeholder="Ej: NovaByte S.L." controlName="legalName" [parentForm]="clientForm"></josanz-input>
            <josanz-input label="CIF" placeholder="B-00000000" controlName="cif" [parentForm]="clientForm"></josanz-input>
            <josanz-input label="Email de facturación" type="email" placeholder="facturacion@empresa.es" controlName="email" [parentForm]="clientForm"></josanz-input>
            <josanz-input label="Teléfono" placeholder="910 000 000" controlName="phone" [parentForm]="clientForm"></josanz-input>
            <josanz-input label="Ciudad" placeholder="Madrid" controlName="city" [parentForm]="clientForm"></josanz-input>
            <josanz-input label="Plazo de pago" type="number" placeholder="30" controlName="paymentDays" [parentForm]="clientForm" customColor="var(--josanz-primary)"></josanz-input>
          </div>
        </div>
      `,
    };
  },
};
