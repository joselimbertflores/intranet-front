import {
  LOCALE_ID,
  ApplicationConfig,
  provideZoneChangeDetection,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withViewTransitions,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeBo from '@angular/common/locales/es-BO';
import { registerLocaleData } from '@angular/common';

import { definePreset, palette } from '@primeuix/themes';
import { DialogService } from 'primeng/dynamicdialog';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { es } from 'primelocale/es.json';
import theme from '@primeuix/themes/aura';

import { httpErrorInterceptor } from './core/http/http-error-interceptor';
import { authInterceptor } from './core/auth/auth-interceptor';
import { routes } from './app.routes';

registerLocaleData(localeBo, 'es');

const primaryColor = palette('{sky}');
const AuraSky = definePreset(theme, {
  semantic: {
    primary: primaryColor,
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions({
        // onViewTransitionCreated: handleTransitionCreated,
        skipInitialTransition: true,
      }),
    ),
    provideHttpClient(
      withInterceptors([httpErrorInterceptor, authInterceptor]),
    ),
    providePrimeNG({
      translation: es,
      theme: {
        preset: AuraSky,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
    { provide: LOCALE_ID, useValue: 'es-BO' },
    MessageService,
    DialogService,
  ],
};
