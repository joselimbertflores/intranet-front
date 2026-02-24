import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { NavigationStart, Router, RouterModule, Scroll } from '@angular/router';

import { PortalFooter, PortalNavbar } from './components';
import { ScrollStateService } from '../../shared';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, PortalNavbar, PortalFooter],
  templateUrl: './portal-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayout implements OnInit, AfterViewInit {
  private router = inject(Router);
  private scrollStateService = inject(ScrollStateService);

  ngOnInit(): void {
    this.scrollStateService.saveScrollPosition.subscribe(() => {
      console.log('saveing scroll', window.scrollY);
    });
  }

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        map((event: Scroll) => event.position),
      )
      .subscribe((position) => {
        console.log(position);
        // this.viewportScroller.scrollToPosition(position || [0, 0]);
      });
  }

  ngAfterViewInit(): void {
    this.listenScrollNavigation();
  }

  private listenScrollNavigation() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        console.log('saveing scroll', window.scrollY);
      }
    });
  }
}
