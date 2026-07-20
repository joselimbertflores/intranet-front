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

import { provideSpartanHlm } from '@spartan-ng/helm/utils';

import { httpErrorInterceptor } from './core/http/http-error-interceptor';
import { authInterceptor } from './core/auth/auth-interceptor';
import { routes } from './app.routes';
import { handleTransitionCreated } from './core/router/view-transition.config';

registerLocaleData(localeBo, 'es');


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideSpartanHlm(),
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
