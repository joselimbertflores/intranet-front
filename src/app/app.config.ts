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
import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import localeBo from '@angular/common/locales/es-BO';
import { registerLocaleData } from '@angular/common';

import { definePreset, palette } from '@primeuix/themes';

import { es } from 'primelocale/es.json';
import theme from '@primeuix/themes/aura';

import { httpErrorInterceptor } from './core/http/http-error-interceptor';
import { authInterceptor } from './core/auth/auth-interceptor';
import { routes } from './app.routes';
import { handleTransitionCreated } from './core/router/view-transition.config';

registerLocaleData(localeBo, 'es');

const primaryColor = palette('{green}');
const AuraSky = definePreset(theme, {
  semantic: {
    primary: primaryColor,
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}', // Color base por defecto (más fuerte que el 500)
          hoverColor: '{primary.700}', // Color al pasar el cursor (aún más fuerte/oscuro)
          activeColor: '{primary.800}', // Color al hacer clic continuo
          contrastColor: '#ffffff', // Color de texto blanco para un buen contraste
        },
      },
      dark: {
        primary: {
          color: '{primary.400}', // En modo oscuro se suele usar un tono un poco más claro para que brille
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
          contrastColor: '#111827',
        },
      },
    },
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
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions({
        onViewTransitionCreated: handleTransitionCreated,
        skipInitialTransition: true,
      }),
    ),
    provideHttpClient(
      withXhr(),
      withInterceptors([httpErrorInterceptor, authInterceptor]),
    ),
    // providePrimeNG({
    //   translation: es,
    //   theme: {
    //     preset: AuraSky,
    //     options: {
    //       darkModeSelector: false || 'none',
    //     },
    //   },
    // }),
    // { provide: LOCALE_ID, useValue: 'es-BO' },
    // MessageService,
    // DialogService,
  ],
};
