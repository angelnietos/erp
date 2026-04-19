import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';

/**
 * Antigua pantalla de chat a página completa (duplicaba la burbuja Kilo).
 * Ahora solo abre el asistente flotante y lleva al listado.
 */
@Component({
  selector: 'app-documents-bot',
  standalone: true,
  template: `
    <div
      class="max-w-md mx-auto px-4 py-20 text-center text-secondary text-sm leading-relaxed"
    >
      <p class="text-primary font-medium mb-2">Abriendo el asistente…</p>
      <p class="text-muted">
        El chat está en la burbuja flotante; puedes moverla y configurarla con
        el engranaje.
      </p>
    </div>
  `,
})
export class DocumentsBotComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly assistant = inject(AssistantContextService);

  ngOnInit(): void {
    this.assistant.openAssistant();
    void this.router.navigate(['/documents/list'], { replaceUrl: true });
  }
}
