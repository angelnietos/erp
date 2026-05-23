import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fireEvent, fn, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { DateTimePickerComponent } from './date-time-picker';

const meta: Meta<DateTimePickerComponent> = {
  component: DateTimePickerComponent,
  title: 'Josanz UI / Date Time Picker',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Picker genérico basado en `datetime-local`, estilizado con tokens Josanz. Útil para inicio/fin de eventos, citas y vencimientos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text', description: 'Etiqueta del campo' },
    value: { control: 'text', description: 'Valor datetime-local' },
    min: { control: 'text', description: 'Valor mínimo' },
    max: { control: 'text', description: 'Valor máximo' },
    hint: { control: 'text', description: 'Ayuda inferior' },
    disabled: { control: 'boolean', description: 'Estado deshabilitado' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de acento' },
    valueChange: sbEmit('valueChange', 'Nuevo valor'),
  },
};

export default meta;
type Story = StoryObj<DateTimePickerComponent>;

export const Playground: Story = {
  args: {
    label: 'Inicio del evento',
    value: '2026-05-24T18:30',
    min: '2026-05-01T00:00',
    max: '2026-12-31T23:59',
    hint: 'Hora local del recinto.',
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Campos habituales para eventos y vencimientos.' } },
  },
  render: () => ({
    template: `
      <div class="grid max-w-4xl gap-5 rounded-3xl border border-solid p-6 md:grid-cols-2" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-date-time-picker label="Inicio montaje" value="2026-05-24T08:00" hint="Llegada de equipo técnico" customColor="#635BFF"></josanz-date-time-picker>
        <josanz-date-time-picker label="Fin desmontaje" value="2026-05-25T02:00" hint="Salida estimada del recinto" shape="pill" customColor="var(--josanz-success)"></josanz-date-time-picker>
        <josanz-date-time-picker label="Vencimiento presupuesto" value="2026-05-30T23:59" hint="Fecha límite de aceptación" customColor="var(--josanz-warning)"></josanz-date-time-picker>
        <josanz-date-time-picker label="Bloqueado" value="2026-06-01T10:00" hint="Bloqueado por cierre de almac�n" [disabled]="true"></josanz-date-time-picker>
      </div>
    `,
  }),
};

export const InteractiveChange: Story = {
  args: {
    label: 'Inicio del evento',
    value: '2026-05-24T18:30',
    valueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/inicio del evento/i);
    await fireEvent.input(input, { target: { value: '2026-05-24T20:00' } });
    await expect(args.valueChange).toHaveBeenCalledWith('2026-05-24T20:00');
  },
};

