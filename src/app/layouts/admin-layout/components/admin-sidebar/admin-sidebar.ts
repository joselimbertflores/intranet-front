import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';
import { Resource } from '../../../../core/auth/auth.types';
import { AppIcon } from '../../../../shared';

interface SidebarItem {
  label: string;
  icon: string;
  expanded?: boolean;
  routerLink?: string;
  resource?: Resource;
  items?: SidebarItem[];
}
@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule, PanelMenuModule, CommonModule, AppIcon],
  template: `
    <div class="h-full flex flex-col bg-surface-0">
      <div class="flex items-center gap-3 h-14 sm:px-4">
        <app-icon />
        <div class="flex flex-col leading-tight">
          <span class="font-semibold text-surface-900"> Intranet </span>
          <span class="text-xs text-surface-500"> Administracion </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-2 sm:px-2">
        <p-panelMenu [model]="filteredMenu()" class="w-full" [multiple]="true">
          <ng-template #item let-item>
            <a
              pRipple
              [routerLink]="item.routerLink"
              [routerLinkActiveOptions]="{ exact: false }"
              routerLinkActive="bg-primary-100 !text-primary-700 rounded-lg"
              class="flex items-center gap-x-3 px-2 py-2 text-surface-700 hover:bg-surface-100 hover:rounded-lg transition-colors mb-1"
            >
              @if (item.icon) {
                <i [class]="item.icon"></i>
              }

              <span [ngClass]="{ 'font-medium': item.items }">
                {{ item.label }}
              </span>

              @if (item.items) {
                <i
                  class="pi pi-chevron-down ml-auto transition-transform duration-200"
                  [ngClass]="{ 'rotate-180': item.expanded }"
                  style="font-size: 12px;"
                ></i>
              }
            </a>
          </ng-template>
        </p-panelMenu>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  private authDataSource = inject(AuthDataSource);

  // Si el padre tiene items → se ignora su resource.
  // Si no tiene items, entonces sí se usa resource.

  // Esto evita inconsistencias como:
  // - El padre permitido pero todos los hijos prohibidos.
  // - O el padre bloqueando hijos que sí deberían mostrarse.

  readonly menu: SidebarItem[] = [
    {
      label: 'Configuraciones',
      icon: 'pi pi-cog',
      expanded: true,
      items: [
        {
          label: 'Contenido',
          icon: 'pi pi-objects-column',
          routerLink: 'content-settings',
          resource: Resource.CONTENT,
        },
      ],
    },
    {
      label: 'Repositorio',
      icon: 'pi pi-folder',
      expanded: true,
      items: [
        {
          label: 'Secciones',
          icon: 'pi pi-table',
          routerLink: 'document-sections',
          resource: Resource.DOCUMENTS,
        },
        {
          label: 'Tipos de documentos',
          icon: 'pi pi-list',
          routerLink: 'document-types',
          resource: Resource.DOCUMENTS,
        },

        {
          label: 'Documentos',
          icon: 'pi pi-file',
          routerLink: 'documents',
          resource: Resource.DOCUMENTS,
        },
      ],
    },
    {
      label: 'Institucional',
      icon: 'pi pi-building',
      expanded: true,
      items: [
        {
          label: 'Comunicados',
          icon: 'pi pi-clipboard',
          routerLink: 'communications-manage',
          resource: Resource.COMMUNICATIONS,
        },
        {
          label: 'Calendario',
          icon: 'pi pi-calendar',
          routerLink: 'calendar-manage',
          resource: Resource.COMMUNICATIONS,
        },
        {
          label: 'Directorio telefonico',
          icon: 'pi pi-phone',
          routerLink: 'directory',
          resource: Resource.CONTENT,
        },
        {
          label: 'Tutoriales',
          icon: 'pi pi-book',
          items: [
            {
              label: 'Categorias',
              icon: 'pi pi-align-center',
              routerLink: 'tutorial-categories',
              resource: Resource.TUTORIALS,
            },
            {
              label: 'Contenido',
              icon: 'pi pi-desktop',
              routerLink: 'tutorials',
              resource: Resource.TUTORIALS,
            },
          ],
        },
      ],
    },
    {
      label: 'Accesso',
      icon: 'pi pi-lock',
      expanded: true,
      items: [
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          routerLink: 'users',
          resource: Resource.USERS,
        },
        {
          label: 'Roles',
          icon: 'pi pi-shield',
          routerLink: 'roles',
          resource: Resource.USERS,
        },
      ],
    },
  ];

  filteredMenu = computed<MenuItem[]>(() => this.filterMenu(this.menu));

  private filterMenu(items: SidebarItem[]): MenuItem[] {
    return items
      .map(({ resource, items, ...props }) => {
        if (items) {
          const children = this.filterMenu(items);
          return children.length ? { ...props, items: children } : null;
        }
        if (!resource) return props;

        return this.authDataSource
          .permissions()
          .some((permission) => permission.resource === resource)
          ? props
          : null;
      })
      .filter((item) => item !== null);
  }
}
