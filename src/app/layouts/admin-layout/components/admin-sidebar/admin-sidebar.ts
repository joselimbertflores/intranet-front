import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';
import { Resource } from '../../../../core/auth/auth.types';
import { AppIcon } from '../../../../shared';

interface SidebarItem extends MenuItem {
  resource?: Resource;
}
@Component({
  selector: 'app-admin-sidebar',
  host: {
    class: 'block h-full min-h-0',
  },
  imports: [PanelMenuModule, ButtonModule, AppIcon],
  template: `
    <div class="flex h-full min-h-0 flex-col">
      <div class="flex h-14 shrink-0 items-center gap-3 px-4">
        <app-icon />

        <div class="flex min-w-0 flex-1 flex-col leading-tight">
          <span class="font-semibold text-surface-900">Intranet</span>
          <span class="text-xs text-surface-500">Administración</span>
        </div>

        @if (showCloseButton()) {
          <p-button
            type="button"
            size="small"
            icon="pi pi-times"
            [rounded]="true"
            [text]="true"
            ariaLabel="Cerrar menú de administración"
            (onClick)="closeRequested.emit()"
          />
        }
      </div>

      <nav
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        aria-label="Navegación de administración"
      >
        <p-panelMenu [model]="filteredMenu()" class="w-full" [multiple]="true" />
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  private authDataSource = inject(AuthDataSource);

  readonly showCloseButton = input(false);
  readonly closeRequested = output<void>();

  readonly menu: SidebarItem[] = [
    {
      label: 'Portal',
      icon: 'pi pi-home',
      items: [
        {
          label: 'Página de inicio',
          routerLink: 'content-settings',
          resource: Resource.CONTENT,
        },
        {
          label: 'Avisos emergentes',
          routerLink: 'landing-notices',
          resource: Resource.CONTENT,
        },
      ],
    },
    {
      label: 'Documentación',
      icon: 'pi pi-folder',
      items: [
        {
          label: 'Documentos',
          routerLink: 'documents',
          resource: Resource.DOCUMENTS,
        },
        {
          label: 'Tipos de documento',
          routerLink: 'document-types',
          resource: Resource.DOCUMENTS,
        },
        {
          label: 'Unidades organizacionales',
          routerLink: 'document-sections',
          resource: Resource.DOCUMENTS,
        },
      ],
    },
    {
      label: 'Comunicación',
      icon: 'pi pi-megaphone',
      items: [
        {
          label: 'Comunicados',
          routerLink: 'communications-manage',
          resource: Resource.COMMUNICATIONS,
        },
        {
          label: 'Calendario',
          routerLink: 'calendar-manage',
          resource: Resource.CALENDAR,
        },
      ],
    },
    {
      label: 'Directorio',
      icon: 'pi pi-phone',
      items: [
        {
          label: 'Contactos',
          routerLink: 'directory',
          resource: Resource.DIRECTORY,
        },
      ],
    },
    {
      label: 'Capacitación',
      icon: 'pi pi-book',
      items: [
        {
          label: 'Tutoriales',
          routerLink: 'tutorials',
          resource: Resource.TUTORIALS,
        },
        {
          label: 'Categorías',
          routerLink: 'tutorial-categories',
          resource: Resource.TUTORIALS,
        },
      ],
    },
    {
      label: 'Acceso',
      icon: 'pi pi-lock',
      items: [
        {
          label: 'Usuarios',
          routerLink: 'users',
          resource: Resource.USERS,
        },
        {
          label: 'Roles',
          routerLink: 'roles',
          resource: Resource.ROLES,
        },
      ],
    },
  ];

  filteredMenu = computed<MenuItem[]>(() => this.filterMenu(this.menu));

  private filterMenu(items: SidebarItem[]): MenuItem[] {
    return items.flatMap(({ resource, items, ...item }) => {
      if (items) {
        const visibleChildren = this.filterMenu(items);

        return visibleChildren.length
          ? [{ ...item, items: visibleChildren }]
          : [];
      }

      if (resource && !this.authDataSource.hasAnyResourcePermission(resource)) {
        return [];
      }

      return [item];
    });
  }
}
