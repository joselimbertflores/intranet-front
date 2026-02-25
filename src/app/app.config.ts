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
  withDebugTracing,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeBo from '@angular/common/locales/es-BO';
import { registerLocaleData } from '@angular/common';

import { definePreset, palette } from '@primeuix/themes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import theme from '@primeuix/themes/aura';
import { es } from 'primelocale/es.json';

import { routes } from './app.routes';
import { handleTransitionCreated } from './core/router/view-transition.config';
import { httpErrorInterceptor } from './core/http/http-error-interceptor';
import { authInterceptor } from './core/auth/auth-interceptor';
import { DialogService } from 'primeng/dynamicdialog';

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
      // withInMemoryScrolling({
      //   scrollPositionRestoration: 'enabled', // 'enabled' is the key
      // }),
      // withDebugTracing(),
      withViewTransitions({ onViewTransitionCreated: handleTransitionCreated }),
      withComponentInputBinding(),
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
