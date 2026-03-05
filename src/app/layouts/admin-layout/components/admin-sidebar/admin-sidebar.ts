import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';
import { AppIcon } from '../../../../shared';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterModule, PanelMenuModule, CommonModule, AppIcon],
  template: `
    <div class="h-full flex flex-col bg-surface-0">
      <div
        class="flex items-center gap-3 h-14 sm:px-4 border-b border-surface-200"
      >
        <app-icon />
        <div class="flex flex-col leading-tight">
          <span class="font-semibold text-surface-900"> Intranet </span>
          <span class="text-xs text-surface-500"> Administracion </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-2 sm:px-2">
        <p-panelMenu [model]="menu" class="w-full" [multiple]="true">
          <ng-template #item let-item>
            <a
              pRipple
              [routerLink]="item.routerLink"
              [routerLinkActiveOptions]="{ exact: false }"
              routerLinkActive="bg-primary-100 !text-primary-700 rounded-lg"
              class="flex items-center gap-x-4 px-4 py-2 text-surface-700 hover:bg-surface-100 hover:rounded-lg transition-colors mb-1"
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

  menu: MenuItem[] = [
    {
      label: 'Configuraciones',
      icon: 'pi pi-cog',
      separator: true,
      expanded: true,
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
      icon: 'pi pi-folder',
      expanded: true,
      items: [
        {
          label: 'Secciones',
          icon: 'pi pi-table',
          routerLink: 'document-sections',
        },
        {
          label: 'Tipos de documentos',
          icon: 'pi pi-list',
          routerLink: 'document-types',
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
      icon: 'pi pi-building',
      expanded: true,
      items: [
        {
          label: 'Comunicados',
          icon: 'pi pi-clipboard',
          routerLink: 'communications-manage',
        },
        {
          label: 'Calendario',
          icon: 'pi pi-calendar',
          routerLink: 'calendar-manage',
        },
        {
          label: 'Directorio telefonico',
          icon: 'pi pi-phone',
          routerLink: 'directory',
        },
        {
          label: 'Tutoriales',
          icon: 'pi pi-book',
          items: [
            {
              label: 'Categorias',
              icon: 'pi pi-align-center',
              routerLink: 'tutorial-categories',
            },
            {
              label: 'Contenido',
              icon: 'pi pi-desktop',
              routerLink: 'tutorials',
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
        },
        {
          label: 'Roles',
          icon: 'pi pi-shield',
          routerLink: 'roles',
        },
      ],
    },
  ];
}
