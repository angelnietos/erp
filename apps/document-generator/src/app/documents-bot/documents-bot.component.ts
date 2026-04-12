import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UIMascotComponent } from '@josanz-erp/shared-ui-kit';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-documents-bot',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, UIMascotComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Panel Mascota -->
        <div class="lg:col-span-4">
          <div
            class="bg-surface rounded-2xl shadow-xl border border-soft p-6 sticky top-8"
          >
            <div class="w-full h-48 mx-auto mb-4">
              <ui-mascot
                type="projects"
                personality="tech"
                bodyShape="mushroom-full"
                eyesType="dots"
                mouthType="smile"
              ></ui-mascot>
            </div>

            <div class="text-center">
              <h2 class="text-xl font-bold text-primary mb-1">Josanz Bot</h2>
              <p class="text-sm text-muted mb-4">Asistente de Documentos</p>

              <div
                class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full text-xs text-green-700"
              >
                <span
                  class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                ></span>
                Conectado
              </div>
            </div>

            <div class="mt-6 space-y-3">
              <button
                (click)="quickAction('markdown')"
                class="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 rounded-xl text-sm text-slate-700 hover:text-blue-700 transition-all flex items-center gap-3"
              >
                <span>✨</span>
                <span>Mejorar mi Markdown</span>
              </button>

              <button
                (click)="quickAction('templates')"
                class="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 rounded-xl text-sm text-slate-700 hover:text-blue-700 transition-all flex items-center gap-3"
              >
                <span>📋</span>
                <span>Ver plantillas disponibles</span>
              </button>

              <button
                (click)="quickAction('export')"
                class="w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 rounded-xl text-sm text-slate-700 hover:text-blue-700 transition-all flex items-center gap-3"
              >
                <span>📄</span>
                <span>Exportar a PDF</span>
              </button>

              <button
                (click)="quickAction('help')"
                class="w-full text-left px-4 py-3 bg-tertiary hover:bg-brand-ambient rounded-xl text-sm text-primary hover:text-brand transition-all flex items-center gap-3"
              >
                <span>❓</span>
                <span>¿Como funciona esto?</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel Chat -->
        <div class="lg:col-span-8">
          <div
            class="bg-surface rounded-2xl shadow-xl border border-soft flex flex-col h-[700px]"
          >
            <!-- Cabecera Chat -->
            <div class="px-6 py-4 border-b border-soft">
              <h2 class="text-xl font-bold text-primary">Chat con Asistente</h2>
              <p class="text-sm text-muted">
                Preguntame cualquier cosa sobre documentos, Markdown o PDFs
              </p>
            </div>

            <!-- Mensajes -->
            <div #chatContainer class="flex-1 overflow-y-auto p-6 space-y-4">
              <div
                *ngFor="let message of messages"
                class="flex"
                [class.justify-end]="message.type === 'user'"
                [class.justify-start]="message.type === 'bot'"
              >
                <div
                  class="max-w-[80%] px-4 py-3 rounded-2xl"
                  [class.bg-blue-600]="message.type === 'user'"
                  [class.text-white]="message.type === 'user'"
                  [class.bg-slate-100]="message.type === 'bot'"
                  [class.text-slate-800]="message.type === 'bot'"
                >
                  <p class="text-sm whitespace-pre-wrap">
                    {{ message.content }}
                  </p>
                  <p
                    class="text-xs mt-1"
                    [class.text-blue-200]="message.type === 'user'"
                    [class.text-slate-400]="message.type === 'bot'"
                  >
                    {{ message.timestamp | date: 'HH:mm' }}
                  </p>
                </div>
              </div>

              <div *ngIf="isTyping" class="flex justify-start">
                <div class="bg-slate-100 px-4 py-3 rounded-2xl">
                  <div class="flex gap-1">
                    <span
                      class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style="animation-delay: 0ms"
                    ></span>
                    <span
                      class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style="animation-delay: 150ms"
                    ></span>
                    <span
                      class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style="animation-delay: 300ms"
                    ></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input -->
            <div class="p-4 border-t border-slate-200">
              <form (ngSubmit)="sendMessage()" class="flex gap-3">
                <input
                  type="text"
                  [(ngModel)]="inputMessage"
                  name="message"
                  placeholder="Escribe tu mensaje..."
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autocomplete="off"
                />
                <button
                  type="submit"
                  [disabled]="!inputMessage.trim() || isTyping"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 transition-all"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentsBotComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [
    {
      id: 1,
      type: 'bot',
      content:
        '¡Hola! 👋 Soy tu asistente de documentos. ¿En que puedo ayudarte hoy?\n\nPuedo ayudarte a:\n✅ Mejorar y formatear tu Markdown\n✅ Generar plantillas profesionales\n✅ Convertir cualquier texto a PDF\n✅ Resolver dudas sobre el sistema',
      timestamp: new Date(),
    },
  ];

  inputMessage = '';
  isTyping = false;
  private messageId = 2;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  quickAction(action: string) {
    const responses: Record<string, string> = {
      markdown:
        '¡Genial! Para mejorar tu Markdown:\n\n1. Usa encabezados con #, ##, ###\n2. Resalta texto con **negrita** o *cursiva*\n3. Usa listas con - o números\n4. Bloques de código con ```\n\nPega tu Markdown aqui y te ayudo a perfeccionarlo!',
      templates:
        'Tenemos estas plantillas listas:\n\n📝 Presupuestos\n📋 Propuestas comerciales\n📖 Documentación técnica\n🏗️ Arquitectura de sistemas\n\nVe a "Crear Documento" para usar cualquiera de ellas.',
      export:
        'Para exportar a PDF es super facil:\n\n1. Ve al editor de documentos\n2. Pega tu Markdown\n3. Ve la vista previa en tiempo real\n4. Click en "Generar PDF"\n\nListo! Tendras un PDF profesional en 1 segundo.',
      help: 'Este sistema es muy sencillo:\n\n✅ Escribes Markdown\n✅ Ves como queda en tiempo real\n✅ Generas PDF perfectamente formateado\n\nToda la magia ocurre automaticamente. No necesitas configurar nada.',
    };

    this.addBotMessage(responses[action]);
  }

  sendMessage() {
    if (!this.inputMessage.trim() || this.isTyping) return;

    const userMessage: ChatMessage = {
      id: this.messageId++,
      type: 'user',
      content: this.inputMessage.trim(),
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    const userText = this.inputMessage.trim().toLowerCase();
    this.inputMessage = '';
    this.isTyping = true;

    setTimeout(() => {
      let response =
        'Entendido! Ve al editor de documentos para convertir tu texto en un PDF profesional. Alli puedes pegar cualquier Markdown y ver la vista previa en tiempo real.';

      if (userText.includes('pdf') || userText.includes('exportar')) {
        response =
          '¡Exacto! Para generar PDF solo tienes que ir al editor, pegar tu texto y darle a generar. El PDF sera exactamente igual que la vista previa que ves.';
      } else if (userText.includes('markdown') || userText.includes('md')) {
        response =
          'Markdown es super facil!\n\n# Encabezado 1\n## Encabezado 2\n**Negrita** *Cursiva*\n- Lista de items\n\nCualquier cosa que escribas en este formato se vera genial en el PDF.';
      } else if (userText.includes('hola') || userText.includes('holi')) {
        response =
          '¡Hola! 😊 En que puedo ayudarte hoy? Puedo explicarte como usar el sistema, ayudarte con Markdown o guiarte para generar tu primer PDF.';
      } else if (userText.includes('gracias')) {
        response =
          'De nada! 😊 Estoy aqui para ayudarte en lo que necesites. No dudes en preguntarme cualquier cosa.';
      }

      this.addBotMessage(response);
      this.isTyping = false;
    }, 1200);
  }

  private addBotMessage(content: string) {
    this.messages.push({
      id: this.messageId++,
      type: 'bot',
      content,
      timestamp: new Date(),
    });
  }
}
