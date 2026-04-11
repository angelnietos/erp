import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bot } from 'lucide-angular';

@Component({
  selector: 'app-document-generator-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">
                Generador de Documentos
              </h1>
            </div>
            <nav class="flex space-x-8">
              <a
                routerLink="/documents/list"
                routerLinkActive="text-blue-600"
                class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Documentos
              </a>
              <a
                routerLink="/documents/create"
                routerLinkActive="text-blue-600"
                class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Crear Nuevo
              </a>
              <a
                routerLink="/documents/bot"
                routerLinkActive="text-blue-600"
                class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <lucide-icon [img]="BotIcon" class="w-4 h-4"></lucide-icon>
                Asistente
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class DocumentGeneratorLayoutComponent {
  protected readonly BotIcon = Bot;
}
