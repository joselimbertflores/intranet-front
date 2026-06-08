import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-forbidden',
  imports: [RouterLink],
  template: `
    <div class="h-full flex items-center justify-center px-4">
      <div class="text-center space-y-4 max-w-md">
        <i class="pi pi-lock text-primary" style="font-size: 3rem"></i>

        <h1 class="text-2xl font-semibold">Acceso denegado</h1>

        <p class="text-surface-500">
          No tienes permiso para ver esta seccion.
        </p>

        <a
          routerLink="/admin"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-contrast hover:bg-primary-emphasis transition-colors"
        >
          <i class="pi pi-arrow-left"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminForbidden {}
