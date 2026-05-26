import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import {
  sbEmit,
  sbRadio,
  josanzStoryThemeDescription,
} from '../../../.storybook/story-arg-types';
import { CarouselComponent } from './carousel';

const demoItems = [
  {
    id: 'stage',
    src: 'https://picsum.photos/seed/josanz-carousel-stage/1200/675',
    alt: 'Escenario iluminado',
    eyebrow: 'Evento',
    title: 'Gala Primavera 2026',
    description:
      'Montaje principal con iluminación, audio y rigging coordinado.',
  },
  {
    id: 'audio',
    src: 'https://picsum.photos/seed/josanz-carousel-audio/1200/675',
    alt: 'Mesa de audio',
    eyebrow: 'Producción',
    title: 'Prueba de sonido',
    description: 'Checklist técnico previo a la apertura de puertas.',
  },
  {
    id: 'team',
    src: 'https://picsum.photos/seed/josanz-carousel-team/1200/675',
    alt: 'Equipo técnico trabajando',
    eyebrow: 'Equipo',
    title: 'Coordinación técnica',
    description:
      'Turnos, responsables y rutas de montaje en una vista compacta.',
  },
];

const meta: Meta<CarouselComponent> = {
  component: CarouselComponent,
  title: 'Josanz UI / Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Carrusel genérico para hero, galerías destacadas, banners de producto y contenido multimedia.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    activeIndex: { control: { type: 'range', min: 0, max: 2, step: 1 } },
    showControls: { control: 'boolean' },
    showIndicators: { control: 'boolean' },
    showOverlay: { control: 'boolean' },
    shape: sbRadio(['rounded', 'pill', 'square'] as const, 'Shape'),
    customColor: { control: 'color' },
    activeIndexChange: sbEmit('activeIndexChange', 'Cambio de slide'),
    itemSelect: sbEmit('itemSelect', 'Slide seleccionado'),
  },
};

export default meta;
type Story = StoryObj<CarouselComponent>;

export const Playground: Story = {
  args: {
    title: 'Producción destacada',
    description: 'Carrusel de piezas visuales asociadas a un evento.',
    items: demoItems,
    activeIndex: 0,
    showControls: true,
    showIndicators: true,
    showOverlay: true,
    shape: 'rounded',
    customColor: '#635BFF',
  },
};

export const HeroUseCase: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { demoItems },
    template: `
      <div class="max-w-5xl rounded-3xl border border-solid p-5" style="background: var(--josanz-surface); border-color: var(--josanz-border);">
        <josanz-carousel title="Portfolio audiovisual" description="Casos recientes listos para presentar al cliente." [items]="demoItems" customColor="#0F1E2F"></josanz-carousel>
      </div>
    `,
  }),
};

export const InteractiveNavigation: Story = {
  args: {
    items: demoItems,
    activeIndex: 0,
    activeIndexChange: fn(),
    itemSelect: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /imagen siguiente/i }),
    );
    await expect(args.activeIndexChange).toHaveBeenCalledWith(1);
    await expect(args.itemSelect).toHaveBeenCalledTimes(1);
  },
};
