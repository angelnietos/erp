import { Route } from '@angular/router';
import { openAssistantRedirectGuard } from './guards/open-assistant-redirect.guard';

export const documentGeneratorRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'bot',
    canActivate: [openAssistantRedirectGuard],
    loadComponent: () =>
      import('./guards/assistant-bot-stub.component').then(
        (m) => m.AssistantBotStubComponent,
      ),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./document-list/document-list.component').then(
        (m) => m.DocumentListComponent,
      ),
  },
  {
    path: 'create/edit/:documentId',
    loadComponent: () =>
      import('./document-create/document-create-editor.component').then(
        (m) => m.DocumentCreateEditorComponent,
      ),
  },
  {
    path: 'create/edit',
    loadComponent: () =>
      import('./document-create/document-create-editor.component').then(
        (m) => m.DocumentCreateEditorComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./document-create/document-create.component').then(
        (m) => m.DocumentCreateComponent,
      ),
  },
  {
    path: 'preview/:id',
    loadComponent: () =>
      import('./document-preview/document-preview.component').then(
        (m) => m.DocumentPreviewComponent,
      ),
  },
  {
    path: 'preview-download/:id',
    loadComponent: () =>
      import(
        './document-preview-download/document-preview-download.component'
      ).then((m) => m.DocumentPreviewDownloadComponent),
  },
  {
    path: 'analysis',
    loadComponent: () =>
      import('./document-analysis/document-analysis.component').then(
        (m) => m.DocumentAnalysisComponent,
      ),
  },
  {
    path: 'settings/ai',
    loadComponent: () =>
      import('./document-ai-settings/document-ai-settings.component').then(
        (m) => m.DocumentAiSettingsComponent,
      ),
  },
  {
    path: 'settings/agent',
    loadComponent: () =>
      import(
        './document-agent-settings/document-agent-settings.component'
      ).then((m) => m.DocumentAgentSettingsComponent),
  },
];
