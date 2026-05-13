import { moduleMetadata } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'Josanz UI / Sidebar',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
    })
  ],
  argTypes: {
    userName: { control: 'text' },
    userRole: { control: 'text' },
    isOpen: { control: 'boolean' },
  }
};
export default meta;

type Story = StoryObj<SidebarComponent>;

export const Playground: Story = {
  args: {
    userName: 'Juan Pérez',
    userRole: 'Administrador de Flota',
    isOpen: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[600px] w-full bg-slate-100 flex overflow-hidden rounded-3xl">
        <josanz-sidebar [userName]="userName" [userRole]="userRole" [isOpen]="isOpen"></josanz-sidebar>
        <div class="flex-1 p-8 text-slate-400 font-medium">
          Dashboard Content Area...
        </div>
      </div>
    `,
  }),
};
