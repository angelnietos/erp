import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { AudioPlayerComponent, VideoPlayerComponent } from './media-player';

const meta: Meta = {
  title: 'Josanz UI / Media Player',
  decorators: [
    moduleMetadata({
      imports: [VideoPlayerComponent, AudioPlayerComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Players dedicados para vídeo y audio, útiles en documentación técnica, notas de voz y material de eventos.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Título del player.' },
    description: { control: 'text', description: 'Texto auxiliar bajo el título.' },
    src: { control: 'text', description: 'URL del recurso multimedia.' },
    poster: { control: 'text', description: 'Imagen de portada del vídeo.' },
  },
};

export default meta;
type Story = StoryObj;

export const Video: Story = {
  render: () => ({
    template: `
      <div class="max-w-3xl">
        <josanz-video-player
          title="Vídeo de montaje"
          description="Poster y controles nativos para documentación audiovisual."
          poster="https://picsum.photos/seed/josanz-video-dedicated/1200/675"
          src=""
        ></josanz-video-player>
      </div>
    `,
  }),
};

export const Audio: Story = {
  render: () => ({
    template: `
      <div class="max-w-xl">
        <josanz-audio-player
          title="Nota de voz"
          description="Brief rápido del responsable de taller o producción."
          src=""
        ></josanz-audio-player>
      </div>
    `,
  }),
};

export const MediaSuite: Story = {
  render: () => ({
    template: `
      <section class="grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <josanz-video-player title="Preview" description="Superficie principal" poster="https://picsum.photos/seed/josanz-media-suite/1200/675"></josanz-video-player>
        <josanz-audio-player title="Audio asociado" description="Grabación o nota interna"></josanz-audio-player>
      </section>
    `,
  }),
};
