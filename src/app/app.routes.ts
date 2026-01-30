import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/auth/is-authenticated-guard';
// import { isAuthenticatedGuard } from './administration/presentation/guards/is-authenticated-guard';

export const routes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import(
  //       './portal/presentation/layouts/portal-layout/portal-layout.component'
  //     ),
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/landing-page/landing-page.component'
  //         ),
  //     },
  //     {
  //       path: 'repository',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/document-repository/document-repository.component'
  //         ),
  //     },
  //     {
  //       path: 'communications',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/communications/communications.component'
  //         ),
  //     },
  //     {
  //       path: 'communications/:id',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/communication-detail/communication-detail'
  //         ),
  //     },
  //     {
  //       path: 'calendar',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/institutional-calendar/institutional-calendar.component'
  //         ),
  //     },
  //     {
  //       path: 'tutorials',
  //       loadComponent: () =>
  //         import('./portal/presentation/pages/tutorials-list/tutorials-list'),
  //     },
  //     {
  //       path: 'tutorials/:slug',
  //       loadComponent: () =>
  //         import(
  //           './portal/presentation/pages/tutorials-detail/tutorials-detail'
  //         ),
  //     },
  //   ],
  // },
  {
    path: 'admin',
    canActivate: [isAuthenticatedGuard],
    title: 'Administracion',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component'),
    children: [
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
          import('./features/administration/institutional-documents/pages/document-sectons-admin/document-sectons-admin'),
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
    ],
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
