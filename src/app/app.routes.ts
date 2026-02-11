import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/auth/is-authenticated-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/portal-layout/portal-layout.component'),
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
          import('./features/portal/pages/communications/communications.component'),
      },
      {
        path: 'communications/:id',
        loadComponent: () =>
          import('./features/portal/pages/communication-detail/communication-detail'),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/portal/pages/institutional-calendar/institutional-calendar.component'),
      },
      {
        path: 'tutorials',
        loadComponent: () =>
          import('./features/portal/pages/tutorials-list/tutorials-list'),
      },
      {
        path: 'tutorials/:slug',
        loadComponent: () =>
          import('./features/portal/pages/tutorials-detail/tutorials-detail'),
      },
      {
        path: 'directory',
        loadComponent: () =>
          import('./features/portal/pages/directory/directory'),
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
          import('./features/administration/institutional-documents/pages/document-types-admin/document-types-admin'),
      },
      {
        title: 'Secciones de documentos',
        path: 'document-sections',
        loadComponent: () =>
          import('./features/administration/institutional-documents/pages/sections-admin/sections-admin'),
      },
      {
        title: 'Documentos',
        path: 'documents',
        loadComponent: () =>
          import('./features/administration/institutional-documents/pages/document-admin/document-admin'),
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
        path: 'tutorials-manage',
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorial-admin/tutorial-admin'),
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
