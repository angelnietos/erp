import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { ChipInputComponent } from './chip-input';
import { ListItemComponent } from './list-item';
import { ProgressStepsComponent } from './progress-steps';
import { TagComponent } from './tag';

const meta: Meta = {
  title: 'Josanz UI / Lists & Form Helpers',
  decorators: [
    moduleMetadata({
      imports: [ListItemComponent, ChipInputComponent, ProgressStepsComponent, TagComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Filas de lista, etiquetas, chip input y progreso vertical para formularios y paneles laterales.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    tags: { control: 'object', description: 'Etiquetas visuales renderizadas como `josanz-tag`.' },
    values: { control: 'object', description: 'Chips iniciales del `chip-input`.' },
    steps: { control: 'object', description: 'Pasos del flujo vertical.' },
    valuesChange: sbEmit('valuesChange', 'Cambio de chips'),
    itemClick: sbEmit('itemClick', 'Fila de lista seleccionada'),
  },
};

export default meta;
type Story = StoryObj;

export const ListsAndTagsSuite: Story = {
  args: {
    valuesChange: fn(),
    itemClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/Añadir etiqueta/i);
    await userEvent.type(input, 'Urgente{enter}');
    await expect(args['valuesChange']).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: /Ana Muñoz/i }));
    await expect(args['itemClick']).toHaveBeenCalled();
  },
  render: (args) => ({
    props: {
      ...args,
      tags: ['Pendiente', 'Taller'],
      values: ['Facturación'],
      steps: [
        { id: '1', label: 'Datos', description: 'Cliente y vehículo', status: 'complete' },
        { id: '2', label: 'Diagnóstico', description: 'Checklist técnico', status: 'current' },
        { id: '3', label: 'Presupuesto', status: 'pending' },
      ],
    },
    template: `
      <section class="grid max-w-3xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex flex-wrap gap-2">
          @for (tag of tags; track tag) {
            <josanz-tag [label]="tag" tone="primary"></josanz-tag>
          }
          <josanz-tag label="Borrador" tone="neutral" [removable]="true"></josanz-tag>
        </div>
        <josanz-chip-input label="Etiquetas del parte" [values]="values" (valuesChange)="valuesChange($event)"></josanz-chip-input>
        <div class="overflow-hidden rounded-2xl border border-solid" style="border-color: var(--josanz-border);">
          <josanz-list-item title="Ana Muñoz" description="Orden #1042 · Revisión frenos" meta="09:40" trailingLabel="Urgente" avatarName="Ana Muñoz" avatarColor="#635BFF" (itemClick)="itemClick()"></josanz-list-item>
          <josanz-list-item title="Luis Romero" description="Orden #1038 · Aceite" meta="Ayer" avatarName="Luis Romero" avatarColor="#0F766E" (itemClick)="itemClick()"></josanz-list-item>
        </div>
        <josanz-progress-steps title="Flujo de orden" [steps]="steps"></josanz-progress-steps>
      </section>
    `,
  }),
};
