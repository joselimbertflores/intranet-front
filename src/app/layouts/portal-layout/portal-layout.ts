import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
  Scroll,
} from '@angular/router';

import { PortalFooter, PortalNavbar } from './components';
import { WindowScrollStore } from '../../shared';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, PortalNavbar, PortalFooter],
  templateUrl: './portal-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayout implements OnInit, AfterViewInit {
  private router = inject(Router);
  // private scrollStore = inject(WindowScrollStore);

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  private currentRoute = '';

  constructor() {
    // this.initScrollSaving();
  }

  private initScrollSaving(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // console.log(event.navigationTrigger);
        // if (this.currentRoute) {
        //   this.scrollStore.save(this.currentRoute, window.scrollY);
        // }
      }
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }
}
