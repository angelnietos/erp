import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Josanz UI / Input',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    type: {
      control: 'radio',
      options: ['text', 'email', 'password', 'number'],
      description: 'Tipo de entrada HTML',
    },
    controlName: { control: 'text', description: 'Nombre del control en el FormGroup' },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

const sharedForm = new FormGroup({
  testControl: new FormControl(''),
  name: new FormControl(''),
  email: new FormControl(''),
  pass: new FormControl(''),
  age: new FormControl(''),
});

export const Playground: Story = {
  args: {
    label: 'Nombre Completo',
    placeholder: 'Ej: Juan Pérez',
    type: 'text',
    controlName: 'testControl',
    parentForm: sharedForm,
  },
  render: (args) => ({
    props: { ...args, parentForm: sharedForm },
    template: `
      <div class="p-8 bg-slate-50 max-w-sm rounded-2xl">
        <josanz-input
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [controlName]="controlName"
          [parentForm]="parentForm"
        ></josanz-input>
      </div>
    `,
  }),
};

export const CommonTypes: Story = {
  render: () => ({
    props: { form: sharedForm },
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
  }),
};
