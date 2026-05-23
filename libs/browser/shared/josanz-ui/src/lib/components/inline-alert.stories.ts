import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { InlineAlertComponent } from './inline-alert';

const meta: Meta<InlineAlertComponent> = {
  component: InlineAlertComponent,
  title: 'Josanz UI / Inline Alert',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [InlineAlertComponent] })],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription('Aviso compacto en página para estados operativos sin bloquear el flujo.'),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    dismiss: sbEmit('dismiss', 'Cerrar aviso'),
  },
};

export default meta;
type Story = StoryObj<InlineAlertComponent>;

export const Playground: Story = {
  args: {
    title: 'Sincronización pendiente',
    message: 'Los cambios locales se subirán cuando vuelva la conexión.',
    tone: 'warning',
    dismissible: true,
    dismiss: fn(),
  },
};
