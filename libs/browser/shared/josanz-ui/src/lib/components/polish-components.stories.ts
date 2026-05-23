import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription, sbEmit } from '../../../.storybook/story-arg-types';
import { AvatarGroupComponent } from './avatar-group';
import { ColorPickerComponent } from './color-picker';
import { CopyButtonComponent } from './copy-button';
import { KeyboardShortcutComponent } from './keyboard-shortcut';
import { RatingComponent } from './rating';
import { SegmentedControlComponent } from './segmented-control';

const meta: Meta = {
  title: 'Josanz UI / Polish Components',
  decorators: [
    moduleMetadata({
      imports: [
        SegmentedControlComponent,
        AvatarGroupComponent,
        RatingComponent,
        ColorPickerComponent,
        CopyButtonComponent,
        KeyboardShortcutComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Componentes pequeños de acabado que suelen aparecer en UI kits maduros: segmented control, avatar group, rating, color picker, copy button y keyboard shortcut.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    people: { control: 'object', description: 'Avatares del equipo asignado.' },
    segments: { control: 'object', description: 'Opciones del segmented control.' },
    segmentChange: sbEmit('segmentChange', 'Segmento seleccionado'),
    ratingChange: sbEmit('ratingChange', 'Valor de rating actualizado'),
    colorChange: sbEmit('colorChange', 'Color seleccionado'),
    copiedText: sbEmit('copiedText', 'Texto copiado al portapapeles'),
  },
};

export default meta;
type Story = StoryObj;

const people = [
  { name: 'Ana Muñoz', color: '#635BFF' },
  { name: 'Luis Romero', color: '#0F766E' },
  { name: 'Sara Vega', color: '#B45309' },
  { name: 'Mario López', color: '#BE123C' },
  { name: 'Nora Díaz', color: '#475569' },
];

export const PolishSuite: Story = {
  args: {
    segmentChange: fn(),
    ratingChange: fn(),
    colorChange: fn(),
    copiedText: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      people,
      segments: [
        { label: 'Día', value: 'day' },
        { label: 'Semana', value: 'week' },
        { label: 'Mes', value: 'month' },
      ],
    },
    template: `
      <section class="grid max-w-4xl gap-6 rounded-3xl border border-solid p-6" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <josanz-segmented-control [options]="segments" value="week" customColor="#635BFF" (valueChange)="segmentChange($event)"></josanz-segmented-control>
          <josanz-keyboard-shortcut [keys]="['Ctrl', 'K']"></josanz-keyboard-shortcut>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <div class="grid gap-4 rounded-3xl border border-solid p-5" style="border-color: var(--josanz-border);">
            <p class="m-0 text-sm font-black" style="color: var(--josanz-text);">Equipo asignado</p>
            <josanz-avatar-group [items]="people" [max]="4"></josanz-avatar-group>
            <josanz-rating label="Satisfacción" [value]="4" customColor="#F59E0B" (valueChange)="ratingChange($event)"></josanz-rating>
          </div>
          <div class="grid gap-4 rounded-3xl border border-solid p-5" style="border-color: var(--josanz-border);">
            <josanz-color-picker label="Color de campaña" value="#635BFF" (valueChange)="colorChange($event)"></josanz-color-picker>
            <josanz-copy-button text="erp-production-f06c.up.railway.app" label="Copiar URL" (copiedText)="copiedText($event)"></josanz-copy-button>
          </div>
        </div>
      </section>
    `,
  }),
};

export const InteractivePolish: Story = {
  args: {
    segmentChange: fn(),
    ratingChange: fn(),
    copiedText: fn(),
  },
  render: (args) => ({
    props: {
      ...args,
      segments: [
        { label: 'Lista', value: 'list' },
        { label: 'Grid', value: 'grid' },
      ],
    },
    template: `
      <div class="grid max-w-md gap-5">
        <josanz-segmented-control [options]="segments" value="list" (valueChange)="segmentChange($event)"></josanz-segmented-control>
        <josanz-rating [value]="3" (valueChange)="ratingChange($event)"></josanz-rating>
        <josanz-copy-button text="copiable" (copiedText)="copiedText($event)"></josanz-copy-button>
      </div>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: /grid/i }));
    await userEvent.click(canvas.getByRole('radio', { name: /valorar 5/i }));
    await userEvent.click(canvas.getByRole('button', { name: /copiar/i }));
    await expect(args['segmentChange']).toHaveBeenCalledWith('grid');
    await expect(args['ratingChange']).toHaveBeenCalledWith(5);
    await expect(args['copiedText']).toHaveBeenCalledWith('copiable');
  },
};
