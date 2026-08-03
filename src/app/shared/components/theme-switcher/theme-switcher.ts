import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMonitor,
  lucideMoon,
  lucideSun,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

import { ThemeService } from '../../../core/theme/theme.service';
import type { ThemePreference } from '../../../core/theme/theme.service';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: 'lucideSun' },
  { value: 'dark', label: 'Oscuro', icon: 'lucideMoon' },
  { value: 'system', label: 'Sistema', icon: 'lucideMonitor' },
];

@Component({
  selector: 'app-theme-switcher',
  imports: [HlmButtonImports, HlmDropdownMenuImports, NgIcon],
  providers: [provideIcons({ lucideMonitor, lucideMoon, lucideSun })],
  host: { class: 'inline-flex' },
  template: `
    <ng-template #themeMenu>
      <div hlmDropdownMenu class="w-44" aria-label="Seleccionar tema">
        <div hlmDropdownMenuLabel>Tema</div>
        <div hlmDropdownMenuSeparator></div>
        <div hlmDropdownMenuGroup>
          @for (option of options; track option.value) {
            <button
              hlmDropdownMenuRadio
              type="button"
              [checked]="theme.preference() === option.value"
              [keepOpen]="false"
              (triggered)="theme.setPreference(option.value)"
            >
              <ng-icon [name]="option.icon" aria-hidden="true" />
              <span>{{ option.label }}</span>
              <hlm-dropdown-menu-radio-indicator />
            </button>
          }
        </div>
      </div>
    </ng-template>

    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-lg"
      class="size-11 text-current hover:bg-current/10 hover:text-current focus-visible:border-current/30 focus-visible:ring-current/40"
      [attr.aria-label]="accessibleLabel()"
      [attr.title]="accessibleLabel()"
      aria-haspopup="menu"
      [hlmDropdownMenuTrigger]="themeMenu"
      align="end"
    >
      <ng-icon [name]="currentIcon()" aria-hidden="true" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  readonly theme = inject(ThemeService);
  readonly options = THEME_OPTIONS;

  readonly currentIcon = computed(() => {
    const preference = this.theme.preference();
    return (
      THEME_OPTIONS.find((option) => option.value === preference)?.icon ??
      'lucideMonitor'
    );
  });

  readonly accessibleLabel = computed(() => {
    const preference = this.theme.preference();
    const option = THEME_OPTIONS.find((item) => item.value === preference);
    const resolvedLabel = this.theme.resolvedTheme() === 'dark' ? 'oscuro' : 'claro';
    const systemResolution = preference === 'system' ? `, actualmente ${resolvedLabel}` : '';

    return `Cambiar tema. Actual: ${option?.label ?? 'Sistema'}${systemResolution}`;
  });
}
