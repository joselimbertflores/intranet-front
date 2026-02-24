import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ScrollStateService {
  private _restore = signal<boolean>(false);
  restore = computed(() => this._restore());

  private positions = new Map<string, number>();

  private restore$ = new Subject<string>();

  private saveScrollPosition$ = new Subject<string>();
  saveScrollPosition = this.saveScrollPosition$.asObservable();

  set(routeKey: string, position: number) {
    // * call method on scroll-directive  destroy
    this._restore.set(false);
    this.positions.set(routeKey, position);
  }

  get(routeKey: string): number | null {
    return this.positions.get(routeKey) ?? null;
  }

  private scrollPositions = new Map<string, number>();

  savePosition(url: string) {
    this.saveScrollPosition$.next(url);
  }

  getPosition(url: string): number {
    return this.scrollPositions.get(url) || 0;
  }

  keepScroll() {
    this._restore.set(true);
  }

  notifyReady(route: string) {
    this.restore$.next(route);
  }

  onRestore() {
    return this.restore$.asObservable();
  }
}
