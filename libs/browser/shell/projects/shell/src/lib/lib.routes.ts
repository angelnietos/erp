import { Route } from '@angular/router';

export const projectsShellRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@josanz-erp/projects-feature').then(m => m.projectsFeatureRoutes),
  },
];
