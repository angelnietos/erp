import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { JosanzUiComponent } from '@josanz-erp/josanz-ui';

@Component({
  imports: [NxWelcome, RouterModule, JosanzUiComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'josanz-web-app';
}
