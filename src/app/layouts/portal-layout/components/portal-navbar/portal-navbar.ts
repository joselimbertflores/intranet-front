import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IconFieldModule } from 'primeng/iconfield';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'portal-navbar',
  imports: [CommonModule, MenubarModule, RouterModule, IconFieldModule, RippleModule],
  template: `
    <p-menubar [model]="menuItems" class="custom-navbar">
      <ng-template #start>
        <a
          routerLink="/"
          class="flex items-center gap-3 no-underline select-none"
        >
          <img
            src="images/icons/app.png"
            alt="Logo"
            class="h-8 w-auto"
            loading="eager"
          />
          <div class="leading-tight text-base font-semibold text-surface-900">
            Intranet
          </div>

          <span class="mx-3 h-6 w-px bg-surface-300 hidden md:block"></span>
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
        <div class="hidden md:flex items-center gap-2 text-xs text-surface-600">
          <span class="pi pi-globe"></span>
          <span>Portal público interno</span>
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: `
    @media screen and (max-width: 960px) {
      :host ::ng-deep .p-menubar .p-menubar-button {
        margin-left: auto !important;
      }

      :host ::ng-deep .p-menubar .p-menubar-end {
        margin-left: 0 !important;
      }
    }
    /*:host ::ng-deep .p-menubar .p-menubar-root-list {
      justify-content: center;
      flex-grow: 1;
    }*/
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
