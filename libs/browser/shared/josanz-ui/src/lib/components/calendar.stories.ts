import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, sbRadio, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { CalendarComponent } from './calendar';

const meta: Meta<CalendarComponent> = {
  component: CalendarComponent,
  title: 'Josanz UI / Calendar',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Calendario mensual genérico para planificación, agendas y disponibilidad. Marca eventos, fecha actual y fecha seleccionada.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    eyebrow: { control: 'text', description: 'Contexto superior' },
    month: { control: 'text', description: 'Mes visible en formato YYYY-MM' },
    selectedDate: { control: 'text', description: 'Fecha seleccionada YYYY-MM-DD' },
    eventDates: { control: 'object', description: 'Fechas con evento' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Override de shape'),
    customColor: { control: 'color', description: 'Color de selección/eventos' },
    selectedDateChange: sbEmit('selectedDateChange', 'Fecha seleccionada'),
    dateSelect: sbEmit('dateSelect', 'Click fecha'),
    monthChange: sbEmit('monthChange', 'Cambio de mes'),
  },
};

export default meta;
type Story = StoryObj<CalendarComponent>;

export const Playground: Story = {
  args: {
    eyebrow: 'Agenda',
    month: '2026-05',
    selectedDate: '2026-05-24',
    eventDates: ['2026-05-08', '2026-05-18', '2026-05-24', '2026-05-29'],
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const UseCases: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Planificación de evento y disponibilidad de equipo en paralelo.' } },
  },
  render: () => ({
    template: `
      <div class="grid max-w-5xl gap-6 md:grid-cols-2" style="background: var(--josanz-bg);">
        <josanz-calendar eyebrow="Eventos confirmados" month="2026-05" selectedDate="2026-05-24" [eventDates]="eventDates" customColor="#635BFF"></josanz-calendar>
        <josanz-calendar eyebrow="Disponibilidad flota" month="2026-06" selectedDate="2026-06-18" [eventDates]="fleetDates" customColor="var(--josanz-success)" shape="pill"></josanz-calendar>
      </div>
    `,
    props: {
      eventDates: ['2026-05-08', '2026-05-18', '2026-05-24', '2026-05-29'],
      fleetDates: ['2026-06-03', '2026-06-11', '2026-06-18'],
    },
  }),
};

export const InteractiveSelectDate: Story = {
  args: {
    eyebrow: 'Agenda',
    month: '2026-05',
    selectedDate: '',
    eventDates: ['2026-05-24'],
    selectedDateChange: fn(),
    dateSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /seleccionar 2026-05-24/i }));
    await expect(args.selectedDateChange).toHaveBeenCalledWith('2026-05-24');
    await expect(args.dateSelect).toHaveBeenCalledWith('2026-05-24');
  },
};
