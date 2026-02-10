import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, MenubarModule],
  templateUrl: './portal-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayoutComponent {
  readonly currentYear = new Date().getFullYear();

  readonly menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Documentos',
      routerLink: '/documents',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Comunicados',
      routerLink: '/communications',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Calendario',
      routerLink: '/calendar',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Multimedia',
      routerLink: '/tutorials',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Directorio',
      routerLink: '/directory',
      routerLinkActiveOptions: { exact: false },
    },
  ];
}
