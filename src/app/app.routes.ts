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
        title: 'Intranet institucional',
        loadComponent: () =>
          import('./features/portal/pages/landing-page/landing-page'),
      },
      {
        path: 'documentos',
        title: 'Documentos',
        loadComponent: () =>
          import('./features/portal/pages/documents-page/documents-page'),
      },
      {
        path: 'comunicados',
        title: 'Comunicados',
        loadComponent: () =>
          import('./features/portal/pages/communications-page/communications-page'),
      },
      {
        path: 'comunicados/:id',
        title: 'Detalle del comunicado',
        loadComponent: () =>
          import('./features/portal/pages/communications-page/communications-page'),
      },
      {
        path: 'calendario',
        title: 'Calendario',
        loadComponent: () =>
          import('./features/portal/pages/calendar-page/calendar-page'),
      },
      {
        path: 'tutoriales',
        title: 'Tutoriales',
        loadComponent: () =>
          import('./features/portal/pages/tutorials/tutorials-page/tutorials-page'),
      },
      {
        path: 'tutoriales/:slug',
        title: 'Detalle del tutorial',
        loadComponent: () =>
          import('./features/portal/pages/tutorials/tutorials-detail-page/tutorials-detail-page'),
      },
      {
        path: 'directorio',
        title: 'Directorio institucional',
        loadComponent: () =>
          import('./features/portal/pages/directory-page/directory-page'),
      },
      {
        path: 'autoridades',
        title: 'Autoridades municipales',
        loadComponent: () =>
          import('./features/portal/pages/authorities-page/authorities-page'),
      },
      {
        path: 'accesos',
        title: 'Accesos rápidos',
        loadComponent: () =>
          import('./features/portal/pages/quick-accesses-page/quick-accesses-page'),
      },
    ],
  },
  {
    path: 'administration',
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
        title: 'Administracion - Unidades organizacionales',
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
        path: 'tutorials/:id/edit',
        title: 'Administracion - Editar tutorial',
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
          {
            path: 'quick-accesses',
            title: 'Administración - Accesos rápidos',
            data: { resource: Resource.CONTENT },
            canActivate: [resourceGuard],
            loadComponent: () =>
              import('./features/administration/content-settings/pages/quick-accesses-admin/quick-accesses-admin'),
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
        data: { resource: Resource.DIRECTORY },
        canActivate: [resourceGuard],
        children: [
          {
            path: '',
            redirectTo: 'contacts',
            pathMatch: 'full',
          },
          {
            path: 'contacts',
            title: 'Administración - Contactos del directorio',
            loadComponent: () =>
              import('./features/administration/directory/pages/directory-contacts-admin/directory-contacts-admin'),
          },
          {
            path: 'sites',
            title: 'Administración - Sedes del directorio',
            loadComponent: () =>
              import('./features/administration/directory/pages/directory-sites-admin/directory-sites-admin'),
          },
        ],
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
  {
    path: 'admin',
    redirectTo: 'administration',
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
