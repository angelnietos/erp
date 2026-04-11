import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocumentGeneratorLayoutComponent } from './document-generator-layout.component';

@Component({
  selector: 'app-main-app-shell',
  standalone: true,
  imports: [RouterModule, DocumentGeneratorLayoutComponent],
  template: `
    <app-document-generator-layout>
      <router-outlet></router-outlet>
    </app-document-generator-layout>
  `,
})
export class MainAppShellComponent {}
