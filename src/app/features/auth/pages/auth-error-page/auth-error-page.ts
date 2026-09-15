import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-auth-error-page',
  imports: [RouterLink, HlmAlertImports, HlmButtonImports],
  template: `
    <main class="flex min-h-dvh items-center justify-center px-4 py-8">
      <section class="flex w-full max-w-md flex-col gap-4" aria-labelledby="auth-error-title">
        <div hlmAlert>
          <h1 hlmAlertTitle id="auth-error-title">{{ message().title }}</h1>
          <p hlmAlertDescription>{{ message().description }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a hlmBtn [href]="loginUrl">Volver a intentar</a>
          <a hlmBtn variant="outline" routerLink="/">Volver al inicio</a>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthErrorPage {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly loginUrl = `${environment.baseUrl}/auth/login`;

  protected readonly message = computed(() => {
    switch (this.queryParams().get('error')) {
      case 'access_denied':
        return {
          title: 'Acceso denegado',
          description: 'Tu cuenta no tiene acceso a Intranet.',
        };
      case 'identity_hub_unavailable':
        return {
          title: 'Servicio temporalmente no disponible',
          description: 'No se pudo completar el inicio de sesión. Vuelve a intentarlo en unos momentos.',
        };
      case 'invalid_state':
      case 'missing_code':
        return {
          title: 'Inicio de sesión no válido',
          description: 'El intento de inicio de sesión venció o no se pudo validar. Vuelve a intentarlo.',
        };
      default:
        return {
          title: 'No se pudo iniciar sesión',
          description: 'Ocurrió un error al iniciar sesión en Intranet. Puedes volver a intentarlo.',
        };
    }
  });
}
