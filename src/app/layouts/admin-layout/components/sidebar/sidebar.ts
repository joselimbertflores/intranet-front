import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { MenuModule } from 'primeng/menu';
import { AuthDataSource } from '../../../../core/auth/auth-data-source';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, MenuModule],
  template: `
    <div class="h-full flex flex-col overflow-y-auto">
      <p-menu [model]="menu" styleClass="h-full sm:p-2">
        <ng-template #start>
          <div class="flex items-center p-2 mb-2">
            <img src="images/icons/app.png" class="h-8" alt="Icon app" />
            <span class="text-lg ml-3 font-semibold">Intranet</span>
          </div>
        </ng-template>
        <ng-template #submenuheader let-item>
          <span class="text-primary font-bold">{{ item.label }}</span>
        </ng-template>
        <ng-template #item let-item>
          <a
            pRipple
            [routerLink]="item.routerLink"
            routerLinkActive="bg-primary-100 rounded-xl"
            class="flex items-center p-menu-item-link"
          >
            <span [class]="item.icon"></span>
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </ng-template>
      </p-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host ::ng-deep .p-menu {
      border: none !important;
    }
  `,
})
export class Sidebar {
  private authDataSource = inject(AuthDataSource);
  menu: MenuItem[] = [
    {
      label: 'Configuraciones',
      items: [
        {
          label: 'Contenido',
          icon: 'pi pi-objects-column',
          routerLink: 'content-settings',
        },
      ],
    },
    {
      label: 'Repositorio',
      items: [
        {
          label: 'Tipos',
          icon: 'pi pi-objects-column',
          routerLink: 'document-types',
        },
        {
          label: 'Secciones',
          icon: 'pi pi-objects-column',
          routerLink: 'document-sections',
        },
        {
          label: 'Documentos',
          icon: 'pi pi-file',
          routerLink: 'documents',
        },
      ],
    },
    {
      label: 'Institucional',
      items: [
        {
          label: 'Comunicados',
          icon: 'pi pi-objects-column',
          routerLink: 'communications-manage',
        },
        {
          label: 'Calendario',
          icon: 'pi pi-objects-column',
          routerLink: 'calendar-manage',
        },
        {
          label: 'Tutoriales',
          icon: 'pi pi-video',
          routerLink: 'tutorials-manage',
        },
      ],
    },
    {
      label: 'Accesso',
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-objects-column',
          routerLink: 'users',
        },
        {
          label: 'Roles',
          icon: 'pi pi-objects-column',
          routerLink: 'roles',
        },
      ],
    },
  ];
}
