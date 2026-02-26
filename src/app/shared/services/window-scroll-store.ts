import { inject, Injectable } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class WindowScrollStore {
  private router = inject(Router);
  private positions = new Map<string, number>();

  // Indica si la navegación actual es un "volver"
  private isPopState = false;

  // Ruta anterior
  // private currentRoute: string | null = null;
  private currentRoute = this.router.url.split('?')[0];

  constructor() {
    this.init();
  }

  /**
   * Restaura el scroll SOLO si:
   * - venimos de un back (popstate)
   * - hay una posición guardada
   * - el componente ya decidió que es el momento correcto
   */
  restoreScroll(routeKey: string): void {
    const y = this.positions.get(routeKey);
    if (!y || y <= 0) return;

    if (!this.isPopState) return;

    console.log('RESTORE SCROLL');
    window.scrollTo({ top: y });

    // Remover data para evitar que algun effect de RxResource siga restableciendo scroll cuando paginacion cambia
    this.positions.delete(routeKey);
  }

  private init(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isPopState = event.navigationTrigger === 'popstate';

        if (this.currentRoute) {
          this.positions.set(this.currentRoute, window.scrollY);
        }
      }

      if (event instanceof NavigationEnd) {
        //  Si tu ruta es /comunicaciones?page=2
        this.currentRoute = event.urlAfterRedirects.split('?')[0];
      }
    });
  }
}
