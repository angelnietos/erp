import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocumentGeneratorLayoutComponent } from '@josanz-erp/document-generator-shell';

@Component({
  selector: 'app-main-app-shell',
  standalone: true,
  imports: [RouterModule, DocumentGeneratorLayoutComponent],
  template: `
    <lib-document-generator-layout>
      <router-outlet></router-outlet>
    </lib-document-generator-layout>
  `,
})
export class MainAppShellComponent {}
