import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { sbEmit, josanzStoryThemeDescription } from '../../../.storybook/story-arg-types';
import { BreadcrumbNavComponent } from './breadcrumb-nav';

const meta: Meta<BreadcrumbNavComponent> = {
  component: BreadcrumbNavComponent,
  title: 'Josanz UI / Breadcrumb Nav',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: josanzStoryThemeDescription(
          'Breadcrumb de navegación con soporte para href o routerLink opcional, current page y estado disabled.',
        ),
      },
    },
    layout: 'padded',
  },
  argTypes: {
    itemClick: sbEmit('itemClick', 'Click en elemento navegable'),
  },
};

export default meta;
type Story = StoryObj<BreadcrumbNavComponent>;

export const Playground: Story = {
  args: {
    separator: '/',
    itemClick: fn(),
    items: [
      { label: 'Inicio', href: '#' },
      { label: 'Órdenes', href: '#' },
      { label: 'Orden #1042', current: true },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Órdenes'));
    await expect(args['itemClick']).toHaveBeenCalled();
  },
};

export const DisabledStep: Story = {
  args: {
    separator: '>',
    items: [
      { label: 'ERP', href: '#' },
      { label: 'Administración', disabled: true },
      { label: 'Permisos', current: true },
    ],
  },
};
