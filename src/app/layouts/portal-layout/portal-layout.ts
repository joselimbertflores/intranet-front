import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, MenubarModule],
  templateUrl: './portal-layout.html',
  styles: `
    @media screen and (max-width: 960px) {
      :host ::ng-deep .p-menubar .p-menubar-button {
        margin-left: auto !important;
      }

      :host ::ng-deep .p-menubar .p-menubar-end {
        margin-left: 0 !important;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayout {
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
      routerLinkActiveOptions: { exact: false },
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
