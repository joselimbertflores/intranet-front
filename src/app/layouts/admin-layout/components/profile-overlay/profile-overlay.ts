import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';

@Component({
  selector: 'profile-overlay',
  imports: [CommonModule],
  template: `
    <button
      type="button"
      appUiRipple
      class="inline-flex rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label="Abrir menú de perfil"
      aria-haspopup="menu"
      aria-controls="admin-profile-menu"
    >
      <!-- <app-ui-avatar
        icon="ui-icon ui-icon-user"
        shape="circle"
        aria-hidden="true"
      /> -->
    </button>

    <!-- <app-ui-popover #op id="admin-profile-menu" [focusOnShow]="false">
      <ng-template appUiTemplate="content">
        <div class="w-[300px]">
          <div class="flex flex-col space-y-3 items-center">
            <div class="w-full flex justify-end">
              <app-ui-button
                icon="ui-icon ui-icon-times"
                severity="secondary"
                [rounded]="true"
                [text]="true"
                ariaLabel="Cerrar menú de perfil"
                (onClick)="op.hide()"
                size="small"
              />
            </div>
            <div>
              <app-ui-avatar icon="ui-icon ui-icon-user" size="xlarge" shape="circle" />
            </div>
            <span class="font-semibold text-lg text-surface-800">
              {{ $safeNavigationMigration(user()?.fullName) | titlecase }}
            </span>
            <app-ui-menu [model]="menuOptions" class="w-full">
              <ng-template appUiTemplate="item" let-item>
                <button
                  type="button"
                  appUiRipple
                  class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left outline-none hover:bg-surface-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
                  [class]="item.linkClass"
                >
                  <span [class]="item.icon" aria-hidden="true"></span>
                  <span class="ml-3">{{ item.label }}</span>
                </button>
              </ng-template>
            </app-ui-menu>
          </div>
        </div>
      </ng-template>
    </app-ui-popover> -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverlay {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);

  readonly poppoverRef = viewChild.required<any>('op');

  user = this.authDataSource.user;

  readonly menuOptions: any[] = [
    {
      label: 'Cerrar sesión',
      icon: 'ui-icon ui-icon-sign-out',
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
