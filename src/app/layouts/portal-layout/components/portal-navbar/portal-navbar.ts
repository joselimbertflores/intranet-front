import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IconFieldModule } from 'primeng/iconfield';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';

import { AppIcon } from '../../../../shared';

@Component({
  selector: 'portal-navbar',
  imports: [
    CommonModule,
    MenubarModule,
    RouterModule,
    IconFieldModule,
    RippleModule,
    AppIcon,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <p-menubar [model]="menuItems" [style]="{ border: 'none' }">
        <ng-template #start>
          <a
            routerLink="/"
            class="flex items-center gap-3 no-underline select-none"
          >
            <app-icon />
            <div class="leading-tight text-base font-semibold text-surface-900">
              Intranet
            </div>
          </a>
        </ng-template>

        <ng-template #item let-item let-root="root">
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="text-primary"
            [routerLinkActiveOptions]="{ exact: item.routerLink === '/' }"
            pRipple
            class="flex items-center px-3 py-1 gap-2"
          >
            @if (item.icons) {
              <span [class]="item.icon"></span>
            }
            <span>{{ item.label }}</span>

            @if (item.items) {
              <i
                [ngClass]="[
                  'ms-auto pi',
                  root ? 'pi-angle-down' : 'pi-angle-right',
                ]"
              ></i>
            }
          </a>
        </ng-template>

        <!-- opcional: cosas a la derecha (sin auth por ahora) -->
        <ng-template #end>
          <div class="flex items-center gap-2 text-xs text-surface-600">
            <span class="pi pi-globe"></span>
          </div>
        </ng-template>
      </p-menubar>
    </div>
  `,
  styles: `
    :host ::ng-deep .p-menubar-end {
      order: 1;
      margin-left: auto;
      display: flex;
      justify-content: flex-end;
    }

    :host ::ng-deep .p-menubar-button {
      order: 2;
      margin-left: 1rem;
    }

    /* 2. Centrado corregido para Desktop */
    @media screen and (min-width: 960px) {
      :host ::ng-deep .p-menubar-start,
      :host ::ng-deep .p-menubar-end {
        flex: 1; /* Distribuye espacio igual en los laterales */
      }

      :host ::ng-deep .p-menubar .p-menubar-root-list {
        justify-content: center;
        flex-grow: 0; /* Evita que la lista crezca sola, dejando que los laterales la centren */
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalNavbar {
  readonly menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      routerLink: '/',
      icon: 'pi pi-home',
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
      label: 'Directorio',
      routerLink: '/directory',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Tutoriales',
      routerLink: '/tutorials',
      routerLinkActiveOptions: { exact: false },
    },
    {
      label: 'Calendario',
      routerLink: '/calendar',
      routerLinkActiveOptions: { exact: true },
    },
  ];
}
