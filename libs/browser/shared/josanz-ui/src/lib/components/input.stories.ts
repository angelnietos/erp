import type { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { sbRadio } from '../../../.storybook/story-arg-types';
import { InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Josanz UI / Input',
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      ...story,
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    placeholder: { control: 'text', description: 'Placeholder del input' },
    type: sbRadio(['text', 'email', 'password', 'number'] as const, 'Tipo de entrada'),
    controlName: { control: 'text', description: 'Nombre del control en el formulario' },
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

const form = new FormGroup({
  testControl: new FormControl(''),
});

export const Playground: Story = {
  args: {
    label: 'Nombre Completo',
    placeholder: 'Ej: Juan Pérez',
    type: 'text',
    controlName: 'testControl',
    parentForm: form,
  },
};

export const CommonTypes: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        name: new FormControl(''),
        email: new FormControl(''),
        pass: new FormControl(''),
        age: new FormControl(''),
      }),
    },
    template: `
      <div class="flex flex-col gap-8 p-6 max-w-md bg-slate-50 rounded-xl">
        <section>
          <h4 class="text-slate-400 text-xs uppercase tracking-widest mb-4 font-bold">Registro de Usuario</h4>
          <div class="flex flex-col gap-4">
            <josanz-input label="Nombre" placeholder="Tu nombre..." controlName="name" [parentForm]="form"></josanz-input>
            <josanz-input label="Email" type="email" placeholder="correo@ejemplo.com" controlName="email" [parentForm]="form"></josanz-input>
            <josanz-input label="Contraseña" type="password" placeholder="Min 8 caracteres" controlName="pass" [parentForm]="form"></josanz-input>
            <josanz-input label="Edad" type="number" placeholder="0" controlName="age" [parentForm]="form"></josanz-input>
          </div>
        </section>
      </div>
    `,
  }),
};
