import { Routes } from '@angular/router';
import { isAuthenticatedGuard, resourceGuard } from './core/auth/guards';
import { Resource } from './core/auth/auth.types';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/portal-layout/portal-layout'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/portal/pages/landing-page/landing-page'),
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
          import('./features/portal/pages/communications-page/communications-page'),
      },
      {
        path: 'communications/:id',
        loadComponent: () =>
          import('./features/portal/pages/communications-page/communications-page'),
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
        path: 'forbidden',
        title: 'Administracion - Acceso denegado',
        loadComponent: () =>
          import('./features/administration/dashboard/pages/admin-forbidden/admin-forbidden'),
      },
      {
        path: 'document-types',
        title: 'Administracion - Tipos documento',
        data: { resource: Resource.DOCUMENTS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/document-records/pages/document-types-admin/document-types-admin'),
      },
      {
        path: 'document-sections',
        title: 'Administracion - Secciones documento',
        data: { resource: Resource.DOCUMENTS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/document-records/pages/organizational-unit-admin/organizational-unit-admin'),
      },
      {
        path: 'documents',
        title: 'Administracion - Documentos',
        data: { resource: Resource.DOCUMENTS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/document-records/pages/document-admin/document-admin'),
      },
      {
        path: 'communications-manage',
        title: 'Administracion - Comunicados',
        data: { resource: Resource.COMMUNICATIONS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/communications/pages/communications-admin/communications-admin'),
      },
      {
        path: 'calendar-manage',
        title: 'Administracion - Calendarios',
        data: { resource: Resource.CALENDAR },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/calendar/pages/calendar-admin/calendar-admin'),
      },
      {
        path: 'tutorials',
        title: 'Administracion - Tutoriales',
        data: { resource: Resource.TUTORIALS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorials-admin/tutorials-admin'),
      },
      {
        path: 'tutorials/:id',
        title: 'Administracion - Detalle tutorial',
        data: { resource: Resource.TUTORIALS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorial-detail-admin/tutorial-detail-admin'),
      },
      {
        path: 'tutorial-categories',
        title: 'Administracion - Categorias tutorial',
        data: { resource: Resource.TUTORIALS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/tutorials/pages/tutorial-categories-admin/tutorial-categories-admin'),
      },
      {
        path: 'portal',
        children: [
          {
            path: 'home',
            title: 'Administración - Página de inicio',
            data: { resource: Resource.CONTENT },
            canActivate: [resourceGuard],
            loadComponent: () =>
              import('./features/administration/content-settings/pages/portal-home-page/portal-home-page'),
          },
          {
            path: 'notices',
            title: 'Administración - Avisos emergentes',
            data: { resource: Resource.CONTENT },
            canActivate: [resourceGuard],
            loadComponent: () =>
              import('./features/administration/content-settings/pages/landing-notices-admin/landing-notices-admin'),
          },
        ],
      },
      {
        path: 'content-settings',
        redirectTo: 'portal/home',
        pathMatch: 'full',
      },
      {
        path: 'landing-notices',
        redirectTo: 'portal/notices',
        pathMatch: 'full',
      },
      {
        path: 'directory',
        title: 'Administracion - Directorio',
        data: { resource: Resource.DIRECTORY },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/directory/pages/directory-admin/directory-admin'),
      },
      {
        path: 'users',
        title: 'Administracion - Usuarios',
        data: { resource: Resource.USERS },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/access/pages/users-admin/users-admin'),
      },
      {
        path: 'roles',
        title: 'Administracion - Roles',
        data: { resource: Resource.ROLES },
        canActivate: [resourceGuard],
        loadComponent: () =>
          import('./features/administration/access/pages/roles-admin/roles-admin'),
      },
    ],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
