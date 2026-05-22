import { Component } from '@angular/core';

@Component({
  selector: 'josanz-ui-root',
  standalone: true,
  imports: [],
  template: `
    <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div class="shrink-0">
        <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">J</div>
      </div>
      <div>
        <div class="text-xl font-medium text-black">Josanz UI</div>
        <p class="text-slate-500">Shared UI Library for Josanz Web App</p>
      </div>
    </div>
  `,
  styles: [],
})
export class JosanzUiComponent {}
