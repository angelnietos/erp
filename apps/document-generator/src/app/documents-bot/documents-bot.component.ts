import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UIMascotComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'app-documents-bot',
  standalone: true,
  imports: [RouterModule, UIMascotComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="mb-8 text-center">
        <div class="w-36 h-36 mx-auto mb-6">
          <ui-mascot
            type="projects"
            personality="tech"
            bodyShape="mushroom-full"
            eyesType="dots"
            mouthType="smile"
          ></ui-mascot>
        </div>

        <h1 class="text-3xl font-bold text-slate-900 mb-2">
          Asistente de Documentos IA
        </h1>
        <p class="text-slate-600 max-w-xl mx-auto">
          Escribe cualquier texto Markdown y te ayudo a mejorarlo, formatearlo,
          generar contenido o convertirlo directamente a PDF
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10"
        >
          <a
            routerLink="/documents/create"
            class="group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
          >
            <div class="text-3xl mb-3">📝</div>
            <div
              class="text-lg font-bold text-slate-900 group-hover:text-blue-700 mb-2"
            >
              Editor Markdown
            </div>
            <div class="text-sm text-slate-500">
              Escribe y previsualiza Markdown en tiempo real
            </div>
          </a>

          <a
            routerLink="/documents/list"
            class="group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
          >
            <div class="text-3xl mb-3">📁</div>
            <div
              class="text-lg font-bold text-slate-900 group-hover:text-blue-700 mb-2"
            >
              Mis Documentos
            </div>
            <div class="text-sm text-slate-500">
              Ver y gestionar documentos generados
            </div>
          </a>

          <a
            routerLink="/documents/create"
            class="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer"
          >
            <div class="text-3xl mb-3">⚡</div>
            <div class="text-lg font-bold text-blue-700 mb-2">Generar PDF</div>
            <div class="text-sm text-slate-500">
              Convertir Markdown a PDF profesional
            </div>
          </a>
        </div>

        <div class="text-center">
          <div
            class="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full text-sm text-slate-600 mb-6"
          >
            <span
              class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            ></span>
            Asistente activo y listo para ayudarte
          </div>

          <p class="text-slate-500 text-sm">
            Todas las navegaciones funcionan correctamente. Puedes usar
            cualquiera de las opciones de arriba.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class DocumentsBotComponent {}
