import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppNavComponent } from './app-nav.component';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'frontend';
}
