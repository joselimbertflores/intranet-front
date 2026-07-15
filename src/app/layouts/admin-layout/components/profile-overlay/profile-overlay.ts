import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';

@Component({
  selector: 'profile-overlay',
  imports: [
    AvatarModule,
    PopoverModule,
    CommonModule,
    ButtonModule,
    Menu,
    RippleModule,
  ],
  template: `
    <button
      type="button"
      pRipple
      class="inline-flex rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label="Abrir menú de perfil"
      aria-haspopup="menu"
      aria-controls="admin-profile-menu"
      [attr.aria-expanded]="op.overlayVisible"
      (click)="op.toggle($event)"
    >
      <p-avatar
        icon="pi pi-user"
        shape="circle"
        aria-hidden="true"
      />
    </button>

    <p-popover #op id="admin-profile-menu" [focusOnShow]="false">
      <ng-template pTemplate="content">
        <div class="w-[300px]">
          <div class="flex flex-col space-y-3 items-center">
            <div class="w-full flex justify-end">
              <p-button
                icon="pi pi-times"
                severity="secondary"
                [rounded]="true"
                [text]="true"
                ariaLabel="Cerrar menú de perfil"
                (onClick)="op.hide()"
                size="small"
              />
            </div>
            <div>
              <p-avatar icon="pi pi-user" size="xlarge" shape="circle" />
            </div>
            <span class="font-semibold text-lg text-surface-800">
              {{ $safeNavigationMigration(user()?.fullName) | titlecase }}
            </span>
            <p-menu [model]="menuOptions" class="w-full">
              <ng-template #item let-item>
                <button
                  type="button"
                  pRipple
                  class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left outline-none hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
                  [class]="item.linkClass"
                >
                  <span [class]="item.icon" aria-hidden="true"></span>
                  <span class="ml-3">{{ item.label }}</span>
                </button>
              </ng-template>
            </p-menu>
          </div>
        </div>
      </ng-template>
    </p-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverlay {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);

  readonly poppoverRef = viewChild.required<Popover>('op');

  user = this.authDataSource.user;

  readonly menuOptions: MenuItem[] = [
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      linkClass: 'text-red-500',
      command: () => this.logout(),
    },
  ];

  logout(): void {
    this.authDataSource.logout().subscribe(() => {
      this.poppoverRef().hide();
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }
}
