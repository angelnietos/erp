import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { ProgressStepsComponent, type JosanzProgressStep } from './progress-steps';

const steps: JosanzProgressStep[] = [
  { id: 'created', label: 'Orden creada', description: 'Entrada registrada', status: 'complete' },
  { id: 'diagnosis', label: 'Diagnostico', description: 'Tecnico revisando', status: 'current' },
  { id: 'approval', label: 'Aprobacion', description: 'Pendiente del cliente', status: 'pending' },
  { id: 'delivery', label: 'Entrega', description: 'Cierre y factura', status: 'pending' },
];

const meta: Meta<ProgressStepsComponent> = {
  component: ProgressStepsComponent,
  title: 'Josanz UI / Progress Steps',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Timeline vertical de pasos para procesos de taller, onboarding o flujos con estados semanticos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    steps: { control: 'object' },
    ariaLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ProgressStepsComponent>;

export const Playground: Story = {
  args: {
    title: 'Progreso de orden',
    steps,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-md rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-progress-steps [title]="title" [steps]="steps" [ariaLabel]="ariaLabel"></josanz-progress-steps>
      </div>
    `,
  }),
};

export const StatesAndVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      completeSteps: steps.map((step) => ({ ...step, status: 'complete' })),
      errorSteps: [
        { id: 'created', label: 'Orden creada', status: 'complete' },
        { id: 'parts', label: 'Recambios', description: 'Sin stock', status: 'error' },
        { id: 'delivery', label: 'Entrega', status: 'pending' },
      ],
    },
    template: `
      <div class="grid max-w-3xl gap-6 md:grid-cols-2">
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h3 class="m-0 mb-4 text-sm font-black" style="color: var(--josanz-text);">Completado</h3>
          <josanz-progress-steps title="Completado" [steps]="completeSteps"></josanz-progress-steps>
        </section>
        <section class="rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
          <h3 class="m-0 mb-4 text-sm font-black" style="color: var(--josanz-text);">Con error</h3>
          <josanz-progress-steps title="Con error" [steps]="errorSteps"></josanz-progress-steps>
        </section>
      </div>
    `,
  }),
};

export const AccessibilityCheck: Story = {
  args: {
    title: 'Alta de cliente',
    steps,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/alta de cliente/i)).toBeInTheDocument();
    await expect(canvas.getByText(/diagnostico/i)).toBeInTheDocument();
  },
};
