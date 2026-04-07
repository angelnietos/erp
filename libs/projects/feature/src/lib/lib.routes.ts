import { Route } from '@angular/router';

export const projectsFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./projects-list/projects-list.component').then(
        (m) => m.ProjectsListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./projects-detail/projects-detail.component').then(
        (m) => m.ProjectsDetailComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./projects-detail/projects-detail.component').then(
        (m) => m.ProjectsDetailComponent,
      ),
  },
];
