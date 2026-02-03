import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';

import { AppToolbarComponent } from '../../features/portal/presentation/components';
import { ScrollStateService } from '../../shared';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, AppToolbarComponent],
  templateUrl: './portal-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayoutComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private scrollStateService = inject(ScrollStateService);
  private router = inject(Router);

  scrollContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  ngAfterViewInit(): void {
    this.setScrollRestoreConfig();
  }

  private setScrollRestoreConfig() {
    // const container = this.scrollContainer().nativeElement;
    // this.router.events
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe((event) => {
    //     if (event instanceof  ) {
    //       const currentRoute = this.router.url;
    //       this.scrollStateService.save(currentRoute, container.scrollTop);
    //     }

    //     if (event instanceof NavigationEnd) {
    //       const newRoute = event.urlAfterRedirects;
    //       const savedScroll = this.scrollStateService.get(newRoute) ?? 0;
    //       setTimeout(() => {
    //         container.scrollTop = savedScroll;
    //       });
    //     }
    //   });
  }

    scrolled = false;

  onScroll(event: Event) {
    console.log(event);
    const target = event.target as HTMLElement;
    this.scrolled = target.scrollTop > 50; // Ajusta el umbral a gusto
  }
}
