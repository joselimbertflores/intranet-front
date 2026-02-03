import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  imports: [],
  template: `
    <div class="h-full flex items-center justify-center">
      <div class="text-center space-y-4">
        <i class="pi pi-cog text-primary" style="font-size: 3rem"></i>

        <h1 class="text-2xl font-semibold">Panel de Administración</h1>

        <p class="text-surface-500">
          Selecciona una opción del menú lateral para comenzar
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminHome {}
