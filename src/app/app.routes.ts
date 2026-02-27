import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/auth/is-authenticated-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/portal-layout/portal-layout'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/portal/pages/landing-page/landing-page.component'),
      },
      {
        path: 'repository',
        loadComponent: () =>
          import('./features/portal/pages/documents-page/documents-page'),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/portal/pages/documents-page/documents-page'),
      },
      {
        path: 'communications',
        loadComponent: () =>
          import('./features/portal/pages/communications/communications-page/communications-page'),
      },
      {
        path: 'communications/:id',
        loadComponent: () =>
          import('./features/portal/pages/communications/communication-detail-page/communication-detail-page'),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/portal/pages/calendar-page/calendar-page'),
      },
      {
        path: 'tutorials',
        loadComponent: () =>
          import('./features/portal/pages/tutorials/tutorials-page/tutorials-page'),
      },
      {
        path: 'tutorials/:slug',
        loadComponent: () =>
          import('./features/portal/pages/tutorials/tutorials-detail-page/tutorials-detail-page'),
      },
      {
        path: 'directory',
        loadComponent: () =>
          import('./features/portal/pages/directory-page/directory-page'),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [isAuthenticatedGuard],
    title: 'Administracion',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component'),
    children: [
      {
        title: 'Inicio',
        path: '',
        loadComponent: () =>
          import('./features/administration/dashboard/pages/admin-home/admin-home'),
      },
      {
        title: 'Tipos de documentos',
        path: 'document-types',
        loadComponent: () =>
          import('./features/administration/document-records/pages/document-types-admin/document-types-admin'),
      },
      {
        title: 'Secciones de documentos',
        path: 'document-sections',
        loadComponent: () =>
          import('./features/administration/document-records/pages/sections-admin/sections-admin'),
      },
      {
        title: 'Documentos',
        path: 'documents',
        loadComponent: () =>
          import('./features/administration/document-records/pages/document-admin/document-admin'),
      },
      {
        path: 'communications-manage',
        loadComponent: () =>
          import('./features/administration/communications/pages/communications-admin/communications-admin'),
      },
      {
        path: 'calendar-manage',
        loadComponent: () =>
          import('./features/administration/calendar/pages/calendar-admin/calendar-admin'),
      },
      {
        path: 'tutorials',
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorials-admin/tutorials-admin'),
      },
      {
        path: 'tutorials/:id',
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorial-detail-admin/tutorial-detail-admin'),
      },
      {
        path: 'tutorial-categories',
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorial-categories-admin/tutorial-categories-admin'),
      },
      {
        path: 'users',
        title: 'Usuarios',
        loadComponent: () =>
          import('./features/administration/access/pages/users-admin/users-admin'),
      },
      {
        path: 'roles',
        title: 'Roles',
        loadComponent: () =>
          import('./features/administration/access/pages/roles-admin/roles-admin'),
      },
      {
        path: 'content-settings',
        loadComponent: () =>
          import('./features/administration/content-settings/pages/content-settings-list/content-settings-list'),
      },
      {
        path: 'directory',
        loadComponent: () =>
          import('./features/administration/directory/pages/directory-admin/directory-admin'),
      },
    ],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
