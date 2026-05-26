import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fireEvent, fn, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { TimePickerComponent } from './time-picker';

const meta: Meta<TimePickerComponent> = {
  component: TimePickerComponent,
  title: 'Josanz UI / Time Picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Picker de hora genérico, basado en input nativo `time` y estilizado con tokens Josanz.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    value: { control: 'text', description: 'Hora actual HH:mm' },
    min: { control: 'text', description: 'Hora mínima' },
    max: { control: 'text', description: 'Hora máxima' },
    step: { control: 'number', description: 'Step en segundos' },
    hint: { control: 'text', description: 'Ayuda inferior' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de acento' },
    valueChange: sbEmit('valueChange', 'Nueva hora'),
  },
};

export default meta;
type Story = StoryObj<TimePickerComponent>;

export const Playground: Story = {
  args: {
    label: 'Hora de llegada',
    value: '08:30',
    min: '06:00',
    max: '23:00',
    step: 300,
    hint: 'Franjas de 5 minutos.',
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Horarios de operación típicos: llegada, prueba de sonido y salida.' } },
  },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 rounded-3xl border border-solid p-6 md:grid-cols-3" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-time-picker label="Llegada" value="08:30" hint="Equipo técnico" customColor="#635BFF"></josanz-time-picker>
        <josanz-time-picker label="Prueba sonido" value="12:00" hint="Sala principal" shape="pill" customColor="var(--josanz-success)"></josanz-time-picker>
        <josanz-time-picker label="Salida" value="23:30" hint="Desmontaje" customColor="var(--josanz-warning)"></josanz-time-picker>
      </div>
    `,
  }),
};

export const InteractiveChange: Story = {
  args: {
    label: 'Hora de llegada',
    value: '08:30',
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/hora de llegada/i);
    await fireEvent.input(input, { target: { value: '10:15' } });
    await expect(args.valueChange).toHaveBeenCalledWith('10:15');
  },
};
