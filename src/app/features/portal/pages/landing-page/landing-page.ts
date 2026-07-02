import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { catchError, of } from 'rxjs';

import {
  FeaturedBannersSection,
  LandingHeroSection,
  LandingModalNotices,
  LandingQuickAccessSection,
} from './components';
import { PortalLandingService } from '../../services';

@Component({
  selector: 'landing-page',
  imports: [
    LandingHeroSection,
    LandingQuickAccessSection,
    FeaturedBannersSection,
    LandingModalNotices,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export default class LandingPage {
  private readonly portalLandingService = inject(PortalLandingService);

  private readonly landingResponse = toSignal(
    this.portalLandingService.getLanding().pipe(
      catchError(() =>
        of({
          heroSlides: [],
          quickAccesses: [],
          featuredBanners: [],
          modalNotices: [],
        }),
      ),
    ),
    {
      initialValue: {
        heroSlides: [],
        quickAccesses: [],
        featuredBanners: [],
        modalNotices: [],
      },
    },
  );

  readonly heroSlides = computed(() => this.landingResponse().heroSlides);
  readonly quickAccesses = computed(() => this.landingResponse().quickAccesses);
  readonly featuredBanners = computed(
    () => this.landingResponse().featuredBanners,
  );
  readonly modalNotices = computed(() => this.landingResponse().modalNotices);
}
