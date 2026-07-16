import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';

import { AuthDataSource } from '../../../../core/auth/auth-data-source';

@Component({
  selector: 'app-user-menu',
  imports: [HlmAvatarImports, HlmButton, HlmDropdownMenuImports],
  template: `
    <ng-template #userMenu>
      <div hlmDropdownMenu class="w-64" aria-label="Menú de usuario">
        <div hlmDropdownMenuLabel class="px-2 py-2">
          <p class="truncate text-sm font-semibold text-foreground">
            {{ user()?.fullName ?? 'Usuario' }}
          </p>
          <p class="mt-0.5 truncate font-normal text-muted-foreground">
            {{ roleLabel() }}
          </p>
        </div>

        <div hlmDropdownMenuSeparator></div>

        <button
          hlmDropdownMenuItem
          type="button"
          variant="destructive"
          (triggered)="logout()"
        >
          Cerrar sesión
        </button>
      </div>
    </ng-template>

    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Abrir menú de usuario"
      aria-haspopup="menu"
      [hlmDropdownMenuTrigger]="userMenu"
      align="end"
    >
      <hlm-avatar>
        <span hlmAvatarFallback>{{ initials() }}</span>
      </hlm-avatar>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenu {
  private readonly router = inject(Router);
  private readonly authDataSource = inject(AuthDataSource);

  readonly user = this.authDataSource.user;

  readonly initials = computed(() => {
    const fullName = this.user()?.fullName.trim();
    if (!fullName) return 'U';

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  });

  readonly roleLabel = computed(() => {
    const roles = this.user()?.roles;
    return roles?.length
      ? roles.map(({ name }) => name).join(', ')
      : 'Usuario administrativo';
  });

  logout(): void {
    this.authDataSource.logout().subscribe(() => {
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }
}
