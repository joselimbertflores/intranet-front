import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

const THEME_STORAGE_KEY = 'intranet-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly preference = signal<ThemePreference>('light');

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const view = this.document.defaultView;
    if (!view) return;

    this.setPreference(this.readStoredPreference(view));
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);

    if (!isPlatformBrowser(this.platformId)) return;

    const view = this.document.defaultView;
    if (!view) return;

    this.document.documentElement.classList.toggle(
      'dark',
      preference === 'dark',
    );

    try {
      view.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }

  toggleTheme(): void {
    this.setPreference(this.preference() === 'dark' ? 'light' : 'dark');
  }

  private readStoredPreference(view: Window): ThemePreference {
    try {
      const preference = view.localStorage.getItem(THEME_STORAGE_KEY);
      if (preference === 'light' || preference === 'dark') {
        return preference;
      }
    } catch {
      // Fall back to the light theme when storage is unavailable.
    }

    return 'light';
  }
}
