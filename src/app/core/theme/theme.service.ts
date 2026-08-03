import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const THEME_STORAGE_KEY = 'intranet-theme';
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly systemPrefersDark = signal(false);

  readonly preference = signal<ThemePreference>('system');
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const preference = this.preference();
    if (preference !== 'system') return preference;

    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const view = this.document.defaultView;
    if (!view) return;

    const colorSchemeQuery = view.matchMedia(DARK_MODE_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      this.systemPrefersDark.set(event.matches);
    };

    this.systemPrefersDark.set(colorSchemeQuery.matches);
    this.preference.set(this.readStoredPreference(view));
    colorSchemeQuery.addEventListener('change', handleSystemThemeChange);
    this.destroyRef.onDestroy(() => {
      colorSchemeQuery.removeEventListener('change', handleSystemThemeChange);
    });

    effect(() => {
      const preference = this.preference();
      const resolvedTheme = this.resolvedTheme();

      this.document.documentElement.classList.toggle(
        'dark',
        resolvedTheme === 'dark',
      );

      try {
        view.localStorage.setItem(THEME_STORAGE_KEY, preference);
      } catch {
        // The selected theme still applies when storage is unavailable.
      }
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  private readStoredPreference(view: Window): ThemePreference {
    try {
      const preference = view.localStorage.getItem(THEME_STORAGE_KEY);
      if (
        preference === 'light' ||
        preference === 'dark' ||
        preference === 'system'
      ) {
        return preference;
      }
    } catch {
      // Fall back to the system preference when storage is unavailable.
    }

    return 'system';
  }
}
