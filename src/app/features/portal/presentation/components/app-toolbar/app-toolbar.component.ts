import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-toolbar',
  imports: [MenubarModule, CommonModule, RouterModule, RouterModule],
  template: `
    <p-menubar [model]="items">
      <ng-template #start>
        <img src="images/icons/app.png" alt="App icon" class="h-10 w-10" />
      </ng-template>
      <ng-template #item let-item let-root="root">
        <a
          pRipple
          [routerLink]="item.routerLink"
          routerLinkActive="active-menu-item"
          [routerLinkActiveOptions]="
            item.routerLinkActiveOptions || { exact: true }
          "
          class="flex items-center p-menubar-item-link"
        >
          @if (item.icon) {
            <i [class]="item.icon" class="p-menuitem-icon"></i>
          }
          <span class="sm:text-xl font-medium  hover:text-primary-700">{{
            item.label
          }}</span>
          @if (item.items) {
            <i
              [ngClass]="[
                'ml-auto pi',
                root ? 'pi-angle-down' : 'pi-angle-right',
              ]"
            ></i>
          }
        </a>
      </ng-template>
      <ng-template #end>
        <div class="w-12"></div>
      </ng-template>
    </p-menubar>
  `,
  styles: `
    .p-menubar .active-menu-item {
      color: var(--p-primary-700);
      border-radius: var(--radius-xl);
      background-color: var(--p-primary-100);
    }

    :host ::ng-deep .p-menubar .p-menubar-root-list {
      justify-content: center;
      flex-grow: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToolbarComponent {
  items: MenuItem[] = [
    {
      label: 'Inicio',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Documentos',
      routerLink: '/repository',
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
