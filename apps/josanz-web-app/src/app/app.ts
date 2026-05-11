import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { NxWelcome } from './nx-welcome';
import { JosanzUiComponent, MainTemplateCardComponent, ButtonComponent } from '@josanz-erp/josanz-ui';

@Component({
  imports: [ RouterModule, JosanzUiComponent, MainTemplateCardComponent, ButtonComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'josanz-web-app';
}
