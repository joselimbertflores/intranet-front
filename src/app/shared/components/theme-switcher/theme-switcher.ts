import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideMoon, lucideSun })],
  host: { class: 'inline-flex' },
  template: `
    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-lg"
      class="size-11 text-current hover:bg-current/10 hover:text-current focus-visible:border-current/30 focus-visible:ring-current/40"
      [attr.aria-label]="accessibleLabel()"
      [attr.title]="accessibleLabel()"
      (click)="theme.toggleTheme()"
    >
      <ng-icon [name]="currentIcon()" aria-hidden="true" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  readonly theme = inject(ThemeService);

  readonly currentIcon = computed(() =>
    this.theme.preference() === 'light' ? 'lucideMoon' : 'lucideSun',
  );

  readonly accessibleLabel = computed(() =>
    this.theme.preference() === 'light'
      ? 'Cambiar a tema oscuro'
      : 'Cambiar a tema claro',
  );
}
