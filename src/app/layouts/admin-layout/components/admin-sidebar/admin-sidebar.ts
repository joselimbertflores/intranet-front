import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBookOpen,
  lucideChevronDown,
  lucideFolder,
  lucideHouse,
  lucideLockKeyhole,
  lucideMegaphone,
  lucidePhone,
} from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';
import { Resource } from '../../../../core/auth/auth.types';

type AdminMenuIcon =
  | 'lucideHouse'
  | 'lucideFolder'
  | 'lucideMegaphone'
  | 'lucidePhone'
  | 'lucideBookOpen'
  | 'lucideLockKeyhole';

interface AdminMenuLink {
  readonly label: string;
  readonly route: string;
  readonly resource: Resource;
}

interface AdminMenuGroup {
  readonly label: string;
  readonly icon: AdminMenuIcon;
  readonly links: readonly AdminMenuLink[];
}

const ADMIN_MENU = [
  {
    label: 'Portal',
    icon: 'lucideHouse',
    links: [
      {
        label: 'Página de inicio',
        route: 'portal/home',
        resource: Resource.CONTENT,
      },
      {
        label: 'Avisos emergentes',
        route: 'portal/notices',
        resource: Resource.CONTENT,
      },
    ],
  },
  {
    label: 'Documentación',
    icon: 'lucideFolder',
    links: [
      {
        label: 'Documentos',
        route: 'documents',
        resource: Resource.DOCUMENTS,
      },
      {
        label: 'Tipos de documento',
        route: 'document-types',
        resource: Resource.DOCUMENTS,
      },
      {
        label: 'Unidades organizacionales',
        route: 'document-sections',
        resource: Resource.DOCUMENTS,
      },
    ],
  },
  {
    label: 'Comunicación',
    icon: 'lucideMegaphone',
    links: [
      {
        label: 'Comunicados',
        route: 'communications-manage',
        resource: Resource.COMMUNICATIONS,
      },
      {
        label: 'Calendario',
        route: 'calendar-manage',
        resource: Resource.CALENDAR,
      },
    ],
  },
  {
    label: 'Directorio',
    icon: 'lucidePhone',
    links: [
      {
        label: 'Contactos',
        route: 'directory',
        resource: Resource.DIRECTORY,
      },
    ],
  },
  {
    label: 'Capacitación',
    icon: 'lucideBookOpen',
    links: [
      {
        label: 'Tutoriales',
        route: 'tutorials',
        resource: Resource.TUTORIALS,
      },
      {
        label: 'Categorías',
        route: 'tutorial-categories',
        resource: Resource.TUTORIALS,
      },
    ],
  },
  {
    label: 'Acceso',
    icon: 'lucideLockKeyhole',
    links: [
      { label: 'Usuarios', route: 'users', resource: Resource.USERS },
      { label: 'Roles', route: 'roles', resource: Resource.ROLES },
    ],
  },
] as const satisfies readonly AdminMenuGroup[];

@Component({
  selector: 'app-admin-sidebar',
  host: {
    class: 'block h-full min-h-0 bg-sidebar text-sidebar-foreground',
  },
  imports: [RouterLink, RouterLinkActive, NgIcon, HlmCollapsibleImports],
  providers: [
    provideIcons({
      lucideHouse,
      lucideFolder,
      lucideMegaphone,
      lucidePhone,
      lucideBookOpen,
      lucideLockKeyhole,
      lucideChevronDown,
    }),
  ],
  template: `
    <div class="flex h-full min-h-0 flex-col">
      <nav
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        aria-label="Navegación de administración"
      >
        @for (group of visibleMenu(); track group.label) {
          <section hlmCollapsible [expanded]="true" class="group/collapsible mb-1">
            <button
              hlmCollapsibleTrigger
              class="flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <ng-icon [name]="group.icon" aria-hidden="true" />
              <span class="min-w-0 flex-1 truncate">{{ group.label }}</span>
              <ng-icon
                name="lucideChevronDown"
                class="transition-transform group-data-[state=open]/collapsible:rotate-180"
                aria-hidden="true"
              />
            </button>

            <div hlmCollapsibleContent class="mt-1 space-y-1 ps-9">
              @for (link of group.links; track link.route) {
                <a
                  class="block rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  [routerLink]="'/admin/' + link.route"
                  routerLinkActive="bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                >
                  {{ link.label }}
                </a>
              }
            </div>
          </section>
        }
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  private readonly authDataSource = inject(AuthDataSource);

  readonly visibleMenu = computed<readonly AdminMenuGroup[]>(() =>
    ADMIN_MENU.map((group) => ({
      ...group,
      links: group.links.filter(({ resource }) =>
        this.authDataSource.hasAnyResourcePermission(resource),
      ),
    })).filter(({ links }) => links.length > 0),
  );
}
