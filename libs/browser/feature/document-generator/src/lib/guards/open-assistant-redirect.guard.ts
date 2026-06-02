import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AssistantContextService } from '../services/assistant-context.service';

/**
 * Abre el panel Kilo y redirige al listado sin montar una pantalla intermedia
 * (sin flash de «Abriendo el asistente…»).
 */
export const openAssistantRedirectGuard: CanActivateFn = () => {
  const assistant = inject(AssistantContextService);
  const router = inject(Router);
  assistant.openAssistant({ announce: true });
  return router.createUrlTree(['/documents/list']);
};
