import { Injector } from '@angular/core';
import type { DocumentExportOrchestratorService } from './document-export-orchestrator.service';

type OrchestratorModule = typeof import('./document-export-orchestrator.service');

let modulePromise: Promise<OrchestratorModule> | null = null;

function loadOrchestratorModule(): Promise<OrchestratorModule> {
  modulePromise ??= import('./document-export-orchestrator.service');
  return modulePromise;
}

/** PDF export + fallback html2pdf; no cargar en el chunk del editor hasta exportar. */
export async function getDocumentExportOrchestrator(
  injector: Injector,
): Promise<DocumentExportOrchestratorService> {
  const mod = await loadOrchestratorModule();
  return injector.get(mod.DocumentExportOrchestratorService);
}
